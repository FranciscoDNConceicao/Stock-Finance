import { QueryClient, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { get } from './client'
import type { CompanySummary, NewsSections, TimeRange } from './types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Retry network/5xx errors twice; a 4xx (e.g. 404 company not found) won't change on retry.
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status !== undefined && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

/* ---------- Layout ---------- */

export function useTicker() {
  return useQuery({
    queryKey: ['ticker'],
    queryFn: ({ signal }) => get('/stocks/ticker', { signal }),
    select: (response) => response.data,
    staleTime: 5 * 60_000,
  })
}

/* ---------- Dashboard ---------- */

/** A random selection, so it is kept for the whole session instead of reshuffling on every visit. */
export function useRandomCompanies(limit: number) {
  return useQuery({
    queryKey: ['companies', 'random', limit],
    queryFn: ({ signal }) => get('/companies/random', { query: { limit }, signal }),
    staleTime: Infinity,
  })
}

export function useNewsSections(limit: number) {
  return useQuery({
    queryKey: ['news', 'sections', limit],
    queryFn: ({ signal }) => get('/news/highlights', { query: { limit }, signal }),
    staleTime: 5 * 60_000,
  })
}

export function useStockRows(offset: number, limit: number) {
  return useQuery({
    queryKey: ['stocks', 'rows', offset, limit],
    queryFn: ({ signal }) => get('/stocks', { query: { offset, limit }, signal }),
  })
}

export function usePriceHistory(stockCode: string | undefined, range: TimeRange) {
  return useQuery({
    queryKey: ['stocks', 'history', stockCode, range],
    queryFn: ({ signal }) => get('/stocks/{code}', { path: { code: stockCode! }, query: { range }, signal }),
    enabled: !!stockCode,
    staleTime: 5 * 60_000,
  })
}

/* ---------- Company page ---------- */

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: ({ signal }) => get('/companies/{company_id}', { path: { company_id: Number(id) }, signal }),
  })
}

/** Up to three random companies other than `excludeId`, for the "Discover" card. */
export function useDiscoverCompanies(excludeId: string) {
  return useQuery({
    queryKey: ['companies', 'discover', excludeId],
    // One extra in case the current company is among the picks
    queryFn: ({ signal }) => get('/companies/random', { query: { limit: 4 }, signal }),
    select: (companies): CompanySummary[] => companies.filter((c) => String(c.id) !== excludeId).slice(0, 3),
    staleTime: Infinity,
  })
}

export function useCompanyNews(id: string, offset: number, limit: number, enabled: boolean) {
  return useQuery({
    queryKey: ['company', id, 'news', offset, limit],
    queryFn: ({ signal }) =>
      get('/companies/{company_id}/news', { path: { company_id: Number(id) }, query: { offset, limit }, signal }),
    enabled,
  })
}

/* ---------- News page ---------- */

export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: ({ signal }) => get('/news/{news_id}', { path: { news_id: Number(id) }, signal }),
  })
}

export const RELATED_NEWS_LABEL = 'Related News'

/** The backend picks the article's companies itself; `companies` only decides whether to ask. */
export function useRelatedNews(id: string, companies: CompanySummary[] | undefined) {
  return useQuery({
    queryKey: ['news', id, 'related'],
    queryFn: ({ signal }) => get('/news/{news_id}/related', { path: { news_id: Number(id) }, query: { limit: 10 }, signal }),
    select: (news): NewsSections => ({ [RELATED_NEWS_LABEL]: news }),
    enabled: !!companies?.length,
  })
}
