import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { propsTicker, TickerActionInt } from './Interfaces'
import { cn, formatPercent } from '../../scripts/utils'
import Skeleton from '../ui/Skeleton'

function TickerItem({ item }: { item: TickerActionInt }) {
  const up = item.discount >= 0
  return (
    <span className="inline-flex items-center gap-2 px-4 text-[13px]">
      <span className="font-semibold text-fg">{item.code}</span>
      <span className={cn('inline-flex items-center gap-1 tabular', up ? 'text-up' : 'text-down')}>
        <FontAwesomeIcon icon={up ? faCaretUp : faCaretDown} aria-hidden="true" />
        {formatPercent(item.discount)}
      </span>
    </span>
  )
}

export default function TickerAction({ data, isLoading }: propsTicker) {
  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-4 overflow-hidden px-4" aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-20 shrink-0" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="flex h-9 items-center px-4 text-xs text-subtle">Market data unavailable</div>
  }

  return (
    <div
      className="ticker-viewport relative h-9 overflow-hidden"
      role="region"
      aria-label="Market movers"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />
      <div className="ticker-track flex h-full w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center divide-x divide-line" aria-hidden={copy === 1}>
            {data.map((item, index) => (
              <TickerItem key={`${copy}-${item.code}-${index}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
