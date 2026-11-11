/**
 * Accounts, the paper-trading wallet, the watchlist and company search.
 *
 * Uses the shared `http` instance directly (not the typed get/post helpers) because these
 * endpoints return 201/204, take query parameters or use DELETE. Types still come from the
 * generated OpenAPI schema.
 */
import { useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { http } from './client'
import type { components } from './schema'

type Schemas = components['schemas']
export type User = Schemas['UserOut']
export type TokenResponse = Schemas['TokenOut']
export type Wallet = Schemas['WalletOut']
export type Position = Schemas['PositionOut']
export type Transaction = Schemas['TransactionOut']
export type TradeOrder = Schemas['TradeIn']
export type WatchlistItem = Schemas['WatchlistItemOut']
export type CompanySearchResult = Schemas['CompanySearchResult']

/* ---------- Session token (localStorage + a tiny store React can subscribe to) ---------- */

const TOKEN_KEY = 'sf.token'
const listeners = new Set<() => void>()

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

let token: string | null = readToken()

function setToken(value: string | null) {
  token = value
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked (private mode): the session just won't survive a reload
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Keep tabs in sync: signing out in one tab signs out the others
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === TOKEN_KEY) {
      token = event.newValue
      listeners.forEach((listener) => listener())
    }
  })
}

http.interceptors.request.use((config) => {
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

http.interceptors.response.use(undefined, (error: unknown) => {
  // An expired/invalid token: drop it so the UI falls back to the signed-out state
  if (isAxiosError(error) && error.response?.status === 401 && error.config?.headers?.Authorization) {
    setToken(null)
  }
  return Promise.reject(error)
})

/** Error message from a FastAPI response ({ detail }), or a generic fallback. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 429) return 'Too many attempts. Please wait a minute and try again.'
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg.replace(/^Value error, /, '')
    if (!error.response) return 'Cannot reach the server. Check that the API is running.'
  }
  return fallback
}

/* ---------- Auth ---------- */

const ACCOUNT_KEY = ['account'] as const

export function useAuth() {
  const queryClient = useQueryClient()
  const currentToken = useSyncExternalStore(subscribe, () => token)

  const me = useQuery({
    queryKey: [...ACCOUNT_KEY, 'me', currentToken],
    queryFn: ({ signal }) => http.get<User>('/auth/me', { signal }).then((r) => r.data),
    enabled: !!currentToken,
    staleTime: Infinity,
  })

  const signIn = useMutation({
    mutationFn: ({ mode, email, password }: { mode: 'login' | 'register'; email: string; password: string }) =>
      http.post<TokenResponse>(`/auth/${mode}`, { email, password }).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ACCOUNT_KEY })
      queryClient.setQueryData([...ACCOUNT_KEY, 'me', data.access_token], data.user)
      setToken(data.access_token)
    },
  })

  const signOut = () => {
    setToken(null)
    queryClient.removeQueries({ queryKey: ACCOUNT_KEY })
  }

  return {
    isSignedIn: !!currentToken,
    user: me.data ?? null,
    signIn,
    signOut,
  }
}

/* ---------- Wallet ---------- */

const WALLET_KEY = [...ACCOUNT_KEY, 'wallet'] as const
const TRANSACTIONS_KEY = [...ACCOUNT_KEY, 'transactions'] as const

export function useWallet(enabled = true) {
  return useQuery({
    queryKey: WALLET_KEY,
    queryFn: ({ signal }) => http.get<Wallet>('/wallet', { signal }).then((r) => r.data),
    enabled,
  })
}

export function useTransactions(page: number, pageSize: number, enabled = true) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, page, pageSize],
    queryFn: ({ signal }) =>
      http
        .get<Transaction[]>('/wallet/transactions', { params: { limit: pageSize, offset: page * pageSize }, signal })
        .then((r) => r.data),
    enabled,
    // Keep the current page on screen while the next one loads
    placeholderData: (previous) => previous,
  })
}

export function useTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (order: TradeOrder) => http.post<Wallet>('/wallet/transactions', order).then((r) => r.data),
    onSuccess: (wallet) => {
      queryClient.setQueryData(WALLET_KEY, wallet)
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
    },
  })
}

/* ---------- Watchlist ---------- */

const WATCHLIST_KEY = [...ACCOUNT_KEY, 'watchlist'] as const

export function useWatchlist(enabled = true) {
  return useQuery({
    queryKey: WATCHLIST_KEY,
    queryFn: ({ signal }) => http.get<WatchlistItem[]>('/watchlist', { signal }).then((r) => r.data),
    enabled,
  })
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ companyId, watched }: { companyId: number; watched: boolean }) => {
      if (watched) await http.delete(`/watchlist/${companyId}`)
      else await http.post<WatchlistItem>('/watchlist', { company_id: companyId })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY }),
  })
}

/* ---------- Search ---------- */

export function useCompanySearch(term: string) {
  const q = term.trim()
  return useQuery({
    queryKey: ['companies', 'search', q.toLowerCase()],
    queryFn: ({ signal }) =>
      http.get<CompanySearchResult[]>('/companies/search', { params: { q, limit: 8 }, signal }).then((r) => r.data),
    enabled: q.length > 0,
    staleTime: 5 * 60_000,
    // Keep the previous results while typing
    placeholderData: (previous) => previous,
  })
}
