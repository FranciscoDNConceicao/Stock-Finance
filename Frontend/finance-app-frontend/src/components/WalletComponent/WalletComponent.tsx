import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash, faBuildingColumns, faWallet, faChartLine, faCoins } from '@fortawesome/free-solid-svg-icons'
import { cn, formatCurrency } from '../../scripts/utils'

interface WalletData {
  balance: number
  wallet_balance: number
  day_balance: number
  total_balance: number
}
interface WalletComponentProps {
  WalletData: WalletData
  currency?: string
}

interface Kpi {
  label: string
  value: number
  icon: IconDefinition
  signed?: boolean
}

export default function WalletComponent({ WalletData, currency = 'EUR' }: WalletComponentProps) {
  const [hidden, setHidden] = useState(false)

  const kpis: Kpi[] = [
    { label: 'Account balance', value: WalletData.balance, icon: faBuildingColumns },
    { label: 'Wallet balance', value: WalletData.wallet_balance, icon: faWallet },
    { label: "Today's P/L", value: WalletData.day_balance, icon: faChartLine, signed: true },
    { label: 'Total P/L', value: WalletData.total_balance, icon: faCoins, signed: true },
  ]

  return (
    <section aria-labelledby="portfolio-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="portfolio-heading" className="text-[13px] font-semibold uppercase tracking-wider text-subtle">
          Portfolio
        </h2>
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          aria-pressed={hidden}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <FontAwesomeIcon icon={hidden ? faEye : faEyeSlash} aria-hidden="true" />
          {hidden ? 'Show balances' : 'Hide balances'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((kpi) => {
          const tone = kpi.signed ? (kpi.value > 0 ? 'text-up' : kpi.value < 0 ? 'text-down' : 'text-fg') : 'text-fg'
          const text = `${kpi.signed && kpi.value > 0 ? '+' : ''}${formatCurrency(kpi.value, currency)}`
          return (
            <div key={kpi.label} className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-muted">{kpi.label}</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-raised text-[12px] text-subtle">
                  <FontAwesomeIcon icon={kpi.icon} aria-hidden="true" />
                </span>
              </div>
              <p className={cn('mt-3 truncate text-xl font-semibold tracking-tight tabular sm:text-2xl', hidden ? 'text-muted' : tone)}>
                {hidden ? '••••••' : text}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
