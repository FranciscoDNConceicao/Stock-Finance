import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../../scripts/utils'

interface PaginationProps {
  page: number // zero-based
  onPageChange: (page: number) => void
  hasNext: boolean
  totalPages?: number
  disabled?: boolean
  className?: string
}

const buttonClass =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted'

export default function Pagination({ page, onPageChange, hasNext, totalPages, disabled, className }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-3', className)}>
      <p className="text-xs text-muted tabular">
        Page <span className="font-medium text-fg">{page + 1}</span>
        {totalPages ? <> of {totalPages}</> : null}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 0}
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !hasNext}
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>
    </nav>
  )
}
