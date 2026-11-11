import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from '../../../router'
import CompanyLogo from '../../ui/CompanyLogo'
import { StockImage } from '../interfaces'

interface ChoosingCategoryProps {
  stock: StockImage | null
  position: number
  total: number
  onPrev: () => void
  onNext: () => void
}

const arrowClass =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-40'

/** Stock switcher: previous / current (links to company) / next. */
export default function ChoosingCategory({ stock, position, total, onPrev, onNext }: ChoosingCategoryProps) {
  const disabled = total < 2
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <button type="button" className={arrowClass} onClick={onPrev} disabled={disabled} aria-label="Previous stock">
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>
        <button type="button" className={arrowClass} onClick={onNext} disabled={disabled} aria-label="Next stock">
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>
      {stock && (
        <Link
          to="/company/:id"
          params={{ id: stock.id.toString() }}
          className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg pr-2"
        >
          <CompanyLogo code={stock.code} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-fg group-hover:text-accent-hover">{stock.code}</p>
            <p className="text-xs text-subtle tabular">
              {position + 1} of {total} · View company
            </p>
          </div>
        </Link>
      )}
    </div>
  )
}
