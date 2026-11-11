import { ReactNode } from 'react'
import LineGraph from './Linegraph'
import { ParsedSeries } from './series'
import TimeChangedGraph from './Components/TimeChangedGraph'
import { TimeRange } from './interfaces'
import { Card } from '../ui/Card'
import ChangeBadge from '../ui/ChangeBadge'
import Skeleton from '../ui/Skeleton'
import { cn, formatNumber, formatSigned } from '../../scripts/utils'

const rangeLabel: Record<TimeRange, string> = {
  '1D': 'today',
  '1W': 'past week',
  '1M': 'past month',
  '1Y': 'past year',
  '3Y': 'past 3 years',
}

interface PriceCardProps {
  heading: ReactNode
  series: ParsedSeries
  range: TimeRange
  onRangeChange: (range: TimeRange) => void
  isLoading: boolean
  currency?: string
  height?: number
  className?: string
}

export default function PriceCard({
  heading,
  series,
  range,
  onRangeChange,
  isLoading,
  currency,
  height = 320,
  className,
}: PriceCardProps) {
  const stats = series.stats
  const tone = !stats ? 'text-muted' : stats.change >= 0 ? 'text-up' : 'text-down'

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">{heading}</div>
        <TimeChangedGraph value={range} onChange={onRangeChange} />
      </div>

      <div className="px-5 pb-1 pt-4" aria-live="polite">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : stats ? (
          <>
            <p className="text-[32px] font-semibold leading-none tracking-tight text-fg tabular">
              {formatNumber(stats.last)}
              {currency && <span className="ml-1.5 text-sm font-medium text-subtle">{currency.toUpperCase()}</span>}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
              <span className={cn('font-medium tabular', tone)}>{formatSigned(stats.change)}</span>
              <ChangeBadge value={stats.changePct} />
              <span className="text-subtle">{rangeLabel[range]}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
      </div>

      <div className="mt-auto">
        <LineGraph series={series} range={range} isLoading={isLoading} height={height} />
      </div>
    </Card>
  )
}
