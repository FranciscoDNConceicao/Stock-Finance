import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import logoImage from '../../assets/images/stock-finance-high-resolution-logo-white-transparent.png'
import TickerAction from '../Ticker/Ticker'
import { TickerActionInt } from '../Ticker/Interfaces'
import CompanySearch from '../Search/CompanySearch'

interface HeaderProps {
  onOpenMenu: () => void
  tickerData: TickerActionInt[] | null
  tickerLoading: boolean
}

export default function Header({ onOpenMenu, tickerData, tickerLoading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/70">
      <div className="flex h-14 items-center gap-3 px-4 lg:hidden">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="-ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-fg"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <Link to="/" aria-label="Stock Finance — home" className="cursor-pointer">
          <img src={logoImage} alt="Stock Finance" className="h-4 w-auto" />
        </Link>
      </div>
      <div className="px-4 pb-3 lg:flex lg:h-14 lg:items-center lg:px-8 lg:pb-0">
        <CompanySearch className="w-full lg:max-w-md" />
      </div>
      <div className="border-t border-line">
        <TickerAction data={tickerData} isLoading={tickerLoading} />
      </div>
    </header>
  )
}
