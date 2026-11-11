import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { cn, formatPercent } from '../../scripts/utils'

interface ChangeBadgeProps {
  /** Ratio, e.g. 0.0123 for +1.23% */
  value: number
  size?: 'sm' | 'md'
  variant?: 'soft' | 'plain'
  className?: string
}

export default function ChangeBadge({ value, size = 'sm', variant = 'soft', className }: ChangeBadgeProps) {
  const valid = Number.isFinite(value)
  const isUp = valid && value > 0
  const isDown = valid && value < 0
  const tone = isUp ? 'text-up' : isDown ? 'text-down' : 'text-muted'
  const bg = variant === 'soft' ? (isUp ? 'bg-up/10' : isDown ? 'bg-down/10' : 'bg-raised') : ''

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium tabular',
        size === 'sm' ? 'text-xs' : 'text-sm',
        variant === 'soft' && (size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'),
        tone,
        bg,
        className,
      )}
    >
      {(isUp || isDown) && <FontAwesomeIcon icon={isUp ? faCaretUp : faCaretDown} className="text-[0.85em]" aria-hidden="true" />}
      <span>{formatPercent(value)}</span>
      <span className="sr-only">{isUp ? 'up' : isDown ? 'down' : 'unchanged'}</span>
    </span>
  )
}
