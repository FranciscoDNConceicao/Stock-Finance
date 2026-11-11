import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { errorMessage, useAuth, useTrade, useWallet } from '../../api/account'
import { Card, CardHeader } from '../ui/Card'
import SegmentedControl from '../ui/SegmentedControl'
import EmptyState from '../ui/EmptyState'
import { primaryButton, signInHref } from './links'
import { cn, formatCurrency, formatNumber } from '../../scripts/utils'

const SIDES = ['Buy', 'Sell'] as const
type Side = (typeof SIDES)[number]

interface TradeCardProps {
  companyId: number
  code: string
  /** Latest stored close, used to preview the order total */
  lastPrice?: number | null
  className?: string
}

/** Paper-trading order form. Orders fill at the latest close stored by the backend. */
export default function TradeCard({ companyId, code, lastPrice, className }: TradeCardProps) {
  const { isSignedIn } = useAuth()
  const wallet = useWallet(isSignedIn)
  const trade = useTrade()
  const [side, setSide] = useState<Side>('Buy')
  const [quantity, setQuantity] = useState('')
  const [done, setDone] = useState<string | null>(null)

  if (!isSignedIn) {
    return (
      <Card className={className}>
        <CardHeader title="Trade" description="Practice with a virtual wallet" />
        <EmptyState
          icon={faWallet}
          title={`Buy and sell ${code}`}
          description="Create a free account to get a paper-trading wallet with virtual cash."
          action={<Link to={signInHref(`/company/${companyId}`)} className={primaryButton}>Sign in to trade</Link>}
        />
      </Card>
    )
  }

  const position = wallet.data?.positions.find((p) => p.company_id === companyId)
  const price = position?.last_price ?? lastPrice ?? null
  const amount = Number(quantity)
  const validAmount = Number.isFinite(amount) && amount > 0
  const estimate = validAmount && price ? amount * price : null
  const cash = wallet.data?.cash ?? 0
  const held = position?.quantity ?? 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!validAmount) return
    setDone(null)
    trade.mutate(
      { company_id: companyId, side: side === 'Buy' ? 'buy' : 'sell', quantity: amount },
      {
        onSuccess: () => {
          setDone(`${side === 'Buy' ? 'Bought' : 'Sold'} ${formatNumber(amount, amount % 1 ? 4 : 0)} ${code}.`)
          setQuantity('')
        },
      },
    )
  }

  const inputId = `trade-qty-${companyId}`
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Trade"
        description="Orders fill at the latest close"
        action={<SegmentedControl options={SIDES} value={side} onChange={(v) => { setSide(v); trade.reset(); setDone(null) }} label="Order side" />}
      />
      <form onSubmit={submit} className="space-y-4 px-5 pb-5 pt-4">
        <div>
          <label htmlFor={inputId} className="text-[13px] text-muted">Shares</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id={inputId}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-bg/60 px-3 text-sm text-fg tabular placeholder:text-subtle focus:border-accent/60 focus:outline-none focus-visible:outline-none"
            />
            {side === 'Sell' && held > 0 && (
              <button
                type="button"
                onClick={() => setQuantity(String(held))}
                className="shrink-0 cursor-pointer rounded-lg border border-line px-3 text-xs font-medium text-muted hover:bg-raised hover:text-fg"
              >
                Max
              </button>
            )}
          </div>
        </div>

        <dl className="space-y-2 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Price</dt>
            <dd className="font-medium text-fg tabular">{price ? formatCurrency(price, 'USD') : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Estimated total</dt>
            <dd className="font-medium text-fg tabular">{estimate !== null ? formatCurrency(estimate, 'USD') : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{side === 'Buy' ? 'Cash available' : 'Shares held'}</dt>
            <dd className="text-fg tabular">{side === 'Buy' ? formatCurrency(cash, 'USD') : formatNumber(held, held % 1 ? 4 : 0)}</dd>
          </div>
        </dl>

        <button type="submit" className={cn(primaryButton, 'w-full')} disabled={!validAmount || trade.isPending || !wallet.data}>
          {trade.isPending ? 'Placing order…' : `${side} ${code}`}
        </button>

        <div aria-live="polite" className="min-h-[1.25rem] text-[13px]">
          {trade.isError && <p className="text-down">{errorMessage(trade.error)}</p>}
          {done && (
            <p className="text-up">
              {done} <Link to="/wallet" className="text-accent hover:text-accent-hover hover:underline">View wallet</Link>
            </p>
          )}
        </div>
      </form>
    </Card>
  )
}
