import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useToggleWatchlist, useWatchlist } from '../../api/account'
import { signInHref } from './links'
import { cn } from '../../scripts/utils'

/** Star toggle that adds/removes a company from the signed-in user's watchlist. */
export default function WatchlistButton({ companyId, className }: { companyId: number; className?: string }) {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const watchlist = useWatchlist(isSignedIn)
  const toggle = useToggleWatchlist()

  const listed = !!watchlist.data?.some((item) => item.company_id === companyId)
  // Show the intended state straight away while the request is in flight
  const watched = toggle.isPending ? !toggle.variables.watched : listed

  const onClick = () => {
    if (!isSignedIn) {
      navigate(signInHref(location.pathname))
      return
    }
    toggle.mutate({ companyId, watched: listed })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={toggle.isPending || (isSignedIn && watchlist.isLoading)}
      aria-pressed={isSignedIn ? watched : undefined}
      title={isSignedIn ? undefined : 'Sign in to use the watchlist'}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-wait',
        watched
          ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15'
          : 'border-line-strong bg-raised text-fg hover:border-muted/40 hover:bg-line',
        className,
      )}
    >
      <FontAwesomeIcon icon={faStar} className={watched ? 'text-amber-300' : 'text-subtle'} aria-hidden="true" />
      {watched ? 'Watching' : 'Watch'}
    </button>
  )
}
