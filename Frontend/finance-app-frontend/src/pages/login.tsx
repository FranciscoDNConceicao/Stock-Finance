import { FormEvent, useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage, useAuth } from '../api/account'
import { Card } from '../components/ui/Card'
import SegmentedControl from '../components/ui/SegmentedControl'
import { primaryButton } from '../components/Account/links'
import { cn } from '../scripts/utils'

const MODES = ['Sign in', 'Create account'] as const
type Mode = (typeof MODES)[number]

/** Only same-site paths, so ?next= can't send people to another website */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/wallet'
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-line bg-bg/60 px-3 text-sm text-fg placeholder:text-subtle focus:border-accent/60 focus:outline-none focus-visible:outline-none'

export default function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isSignedIn, signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('Sign in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const next = safeNext(params.get('next'))
  const registering = mode === 'Create account'

  useEffect(() => {
    document.title = `${mode} · Stock Finance`
  }, [mode])

  if (isSignedIn && !signIn.isPending) return <Navigate to={next} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    signIn.mutate(
      { mode: registering ? 'register' : 'login', email: email.trim(), password },
      { onSuccess: () => navigate(next, { replace: true }) },
    )
  }

  return (
    <div className="mx-auto max-w-sm pt-4 sm:pt-10">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-fg">
        {registering ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        {registering ? 'Get a paper-trading wallet and a watchlist.' : 'Sign in to your wallet and watchlist.'}
      </p>

      <Card className="mt-6 p-5 sm:p-6">
        <SegmentedControl
          options={MODES}
          value={mode}
          onChange={(m) => {
            setMode(m)
            signIn.reset()
          }}
          label="Account"
          size="md"
          className="mb-5 flex w-full [&>button]:flex-1"
        />
        <form onSubmit={submit} className="space-y-4" noValidate={false}>
          <div>
            <label htmlFor="email" className="text-[13px] text-muted">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-[13px] text-muted">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              aria-describedby={registering ? 'password-hint' : undefined}
            />
            {registering && <p id="password-hint" className="mt-1.5 text-xs text-subtle">At least 8 characters.</p>}
          </div>

          {signIn.isError && (
            <p role="alert" className="rounded-lg border border-down/30 bg-down/10 px-3 py-2 text-[13px] text-down">
              {errorMessage(signIn.error)}
            </p>
          )}

          <button type="submit" className={cn(primaryButton, 'w-full')} disabled={signIn.isPending}>
            {signIn.isPending ? 'Please wait…' : mode}
          </button>
        </form>
      </Card>
      <p className="mt-4 text-center text-xs text-subtle">Virtual money only — no real trades are placed.</p>
    </div>
  )
}
