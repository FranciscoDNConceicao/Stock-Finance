import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAuth, useToggleWatchlist, useWatchlist } from '../api/account'
import { Link } from '../router'
import SignInPrompt from '../components/Account/SignInPrompt'
import { Card, CardHeader } from '../components/ui/Card'
import CompanyLogo from '../components/ui/CompanyLogo'
import ChangeBadge from '../components/ui/ChangeBadge'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import { formatDate, formatNumber } from '../scripts/utils'

const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle first:pl-5 last:pr-5'
const td = 'px-4 py-3 first:pl-5 last:pr-5'

export default function WatchlistPage() {
  const { isSignedIn } = useAuth()
  const watchlist = useWatchlist(isSignedIn)
  const toggle = useToggleWatchlist()

  if (!isSignedIn) {
    return (
      <SignInPrompt icon={faStar} title="Your watchlist" description="Sign in to follow companies and see their latest moves in one place." />
    )
  }

  const items = watchlist.data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title="Watchlist" description="Companies you follow, with their latest close." />
      <Card className="overflow-hidden">
        <CardHeader title={`${items.length} ${items.length === 1 ? 'company' : 'companies'}`} className="pb-4" />
        {watchlist.isError ? (
          <EmptyState icon={faStar} title="Couldn't load your watchlist" description="The server may be unavailable. Try again in a moment." />
        ) : !watchlist.isLoading && items.length === 0 ? (
          <EmptyState
            icon={faStar}
            title="Nothing here yet"
            description="Open a company and press Watch to add it to this list."
            className="border-t border-line"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-t border-line text-sm">
              <thead className="bg-bg/40">
                <tr>
                  <th scope="col" className={`${th} text-left`}>Company</th>
                  <th scope="col" className={`${th} text-right`}>Last close</th>
                  <th scope="col" className={`${th} text-right`}>Change</th>
                  <th scope="col" className={`${th} hidden text-right md:table-cell`}>Updated</th>
                  <th scope="col" className={`${th} w-12`}><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {watchlist.isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className={td}><Skeleton className="h-9 w-40" /></td>
                        <td className={td}><Skeleton className="ml-auto h-3.5 w-16" /></td>
                        <td className={td}><Skeleton className="ml-auto h-5 w-14" /></td>
                        <td className={`${td} hidden md:table-cell`}><Skeleton className="ml-auto h-3.5 w-20" /></td>
                        <td className={td} />
                      </tr>
                    ))
                  : items.map((item) => (
                      <tr key={item.company_id} className="transition-colors hover:bg-raised/60">
                        <td className={td}>
                          <Link
                            to="/company/:id"
                            params={{ id: String(item.company_id) }}
                            className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg"
                          >
                            <CompanyLogo code={item.code} color={item.color} size="sm" />
                            <span className="min-w-0">
                              <span className="block max-w-[150px] truncate font-medium text-fg sm:max-w-[280px]">{item.name ?? item.code}</span>
                              <span className="block text-xs text-subtle">{item.code}</span>
                            </span>
                          </Link>
                        </td>
                        <td className={`${td} text-right`}>
                          <span className="font-medium tabular text-fg">{item.last_price != null ? formatNumber(item.last_price) : '—'}</span>
                          <span className="ml-1 text-[11px] text-subtle">{item.currency?.toUpperCase()}</span>
                        </td>
                        <td className={`${td} text-right`}>{item.change != null ? <ChangeBadge value={item.change} /> : <span className="text-subtle">—</span>}</td>
                        <td className={`${td} hidden text-right text-[13px] text-muted md:table-cell`}>{formatDate(item.last_update)}</td>
                        <td className={`${td} text-right`}>
                          <button
                            type="button"
                            onClick={() => toggle.mutate({ companyId: item.company_id, watched: true })}
                            disabled={toggle.isPending && toggle.variables.companyId === item.company_id}
                            aria-label={`Remove ${item.code} from watchlist`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-raised hover:text-down disabled:opacity-40"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
