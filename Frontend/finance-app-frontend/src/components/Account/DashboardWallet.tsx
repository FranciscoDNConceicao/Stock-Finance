import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useAuth, useWallet } from '../../api/account'
import WalletComponent from '../WalletComponent/WalletComponent'
import Skeleton from '../ui/Skeleton'
import { primaryButton, signInHref } from './links'

/** Portfolio KPIs on the dashboard: the user's wallet, or an invitation to create one. */
export default function DashboardWallet() {
  const { isSignedIn } = useAuth()
  const wallet = useWallet(isSignedIn)

  if (!isSignedIn) {
    return (
      <section aria-label="Portfolio" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <FontAwesomeIcon icon={faWallet} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Track a portfolio</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Create a free account to get a paper-trading wallet with virtual cash and a personal watchlist.
          </p>
        </div>
        <Link to={signInHref('/wallet')} className={primaryButton}>Get started</Link>
      </section>
    )
  }

  if (!wallet.data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-busy={wallet.isLoading} aria-label="Loading portfolio">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)}
      </div>
    )
  }

  const { balance, holdings_value, day_change, total_change, currency } = wallet.data
  return (
    <WalletComponent
      currency={currency}
      WalletData={{ balance, wallet_balance: holdings_value, day_balance: day_change, total_balance: total_change }}
    />
  )
}
