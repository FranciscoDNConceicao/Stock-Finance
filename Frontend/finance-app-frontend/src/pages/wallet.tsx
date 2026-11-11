import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faMagnifyingGlass, faWallet } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { Position, useAuth, useWallet } from '../api/account'
import { useNavigate } from '../router'
import DashboardWallet from '../components/Account/DashboardWallet'
import SignInPrompt from '../components/Account/SignInPrompt'
import { Card, CardHeader } from '../components/ui/Card'
import CompanyLogo from '../components/ui/CompanyLogo'
import ChangeBadge from '../components/ui/ChangeBadge'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import { cn, formatCurrency, formatDate, formatNumber, formatSigned } from '../scripts/utils'

const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle first:pl-5 last:pr-5'
const td = 'px-4 py-3 first:pl-5 last:pr-5'

function Signed({ value, currency }: { value: number; currency: string }) {
  const tone = value > 0 ? 'text-up' : value < 0 ? 'text-down' : 'text-muted'
  return <span className={cn('tabular', tone)}>{formatSigned(value)} <span className="text-[11px] text-subtle">{currency}</span></span>
}

function PositionsTable({ positions, currency, isLoading }: { positions: Position[]; currency: string; isLoading: boolean }) {
  const navigate = useNavigate()
  const open = (id: number) => navigate('/company/:id', { params: { id: String(id) } })

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-t border-line text-sm">
        <thead className="bg-bg/40">
          <tr>
            <th scope="col" className={`${th} text-left`}>Company</th>
            <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Shares</th>
            <th scope="col" className={`${th} hidden text-right md:table-cell`}>Avg. price</th>
            <th scope="col" className={`${th} text-right`}>Value</th>
            <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Today</th>
            <th scope="col" className={`${th} hidden text-right lg:table-cell`}>Total P/L</th>
            <th scope="col" className={`${th} w-10`}><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className={td}><Skeleton className="h-9 w-40" /></td>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className={cn(td, j !== 2 && 'hidden sm:table-cell')}><Skeleton className="ml-auto h-3.5 w-16" /></td>
                  ))}
                  <td className={td} />
                </tr>
              ))
            : positions.map((p) => (
                <tr
                  key={p.company_id}
                  tabIndex={0}
                  onClick={() => open(p.company_id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(p.company_id))}
                  aria-label={`${p.name ?? p.code} (${p.code})`}
                  className="group cursor-pointer transition-colors hover:bg-raised/60 focus-visible:bg-raised/60 focus-visible:outline-none"
                >
                  <td className={td}>
                    <div className="flex min-w-0 items-center gap-3">
                      <CompanyLogo code={p.code} color={p.color} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-[140px] truncate font-medium text-fg sm:max-w-[240px]">{p.name ?? p.code}</p>
                        <p className="text-xs text-subtle">
                          {p.code}
                          <span className="sm:hidden"> · {formatNumber(p.quantity, p.quantity % 1 ? 4 : 0)} shares</span>
                          {p.last_update && <span className="hidden sm:inline"> · {formatDate(p.last_update)}</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} hidden text-right tabular text-fg sm:table-cell`}>{formatNumber(p.quantity, p.quantity % 1 ? 4 : 0)}</td>
                  <td className={`${td} hidden text-right tabular text-muted md:table-cell`}>{formatNumber(p.avg_price)}</td>
                  <td className={`${td} text-right font-medium tabular text-fg`}>{formatCurrency(p.market_value, currency)}</td>
                  <td className={`${td} hidden text-right sm:table-cell`}><Signed value={p.day_change} currency={currency} /></td>
                  <td className={`${td} hidden text-right lg:table-cell`}>
                    <div className="flex items-center justify-end gap-2">
                      <Signed value={p.total_change} currency={currency} />
                      <ChangeBadge value={p.total_change_pct} />
                    </div>
                  </td>
                  <td className={`${td} text-right text-subtle`}>
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

export default function WalletPage() {
  const { isSignedIn } = useAuth()
  const wallet = useWallet(isSignedIn)

  if (!isSignedIn) {
    return (
      <SignInPrompt
        icon={faWallet}
        title="Your wallet"
        description="Sign in to see your paper-trading positions, balance and profit/loss."
      />
    )
  }

  const data = wallet.data
  const currency = data?.currency ?? 'USD'
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="A paper-trading portfolio. Orders fill at each company's latest close."
        actions={<Link to="/movements" className="text-[13px] font-medium text-accent hover:text-accent-hover">View movements</Link>}
      />
      <DashboardWallet />

      <Card className="overflow-hidden">
        <CardHeader
          title="Positions"
          description={data ? `${formatCurrency(data.cash, currency)} cash available` : undefined}
          className="pb-4"
        />
        {wallet.isError ? (
          <EmptyState icon={faWallet} title="Couldn't load your wallet" description="The server may be unavailable. Try again in a moment." />
        ) : data && data.positions.length === 0 ? (
          <EmptyState
            icon={faMagnifyingGlass}
            title="No positions yet"
            description="Find a company with the search bar and buy shares from its page."
            className="border-t border-line"
          />
        ) : (
          <PositionsTable positions={data?.positions ?? []} currency={currency} isLoading={!data} />
        )}
      </Card>
    </div>
  )
}
