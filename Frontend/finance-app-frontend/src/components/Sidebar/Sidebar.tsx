import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faChartPie,
  faFire,
  faWallet,
  faMoneyBillTransfer,
  faGear,
  faRightFromBracket,
  faRightToBracket,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../api/account'
import logoImage from '../../assets/images/stock-finance-high-resolution-logo-white-transparent.png'
import { cn } from '../../scripts/utils'

interface NavItem {
  label: string
  icon: IconDefinition
  to?: string
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: faChartPie, to: '/' },
  { label: 'Trending', icon: faFire },
  { label: 'Wallet', icon: faWallet, to: '/wallet' },
  { label: 'Movements', icon: faMoneyBillTransfer, to: '/movements' },
  { label: 'Watchlist', icon: faStar, to: '/watchlist' },
]

const settingsNav: NavItem = { label: 'Settings', icon: faGear }

const itemBase =
  'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150'

function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const icon = <FontAwesomeIcon icon={item.icon} className="w-4 text-[15px]" aria-hidden="true" />

  if (!item.to) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Coming soon"
          className={cn(itemBase, 'cursor-not-allowed text-subtle')}
        >
          {icon}
          <span className="flex-1">{item.label}</span>
          <span className="rounded border border-line px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-subtle">
            Soon
          </span>
        </span>
      </li>
    )
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            itemBase,
            'cursor-pointer',
            isActive
              ? 'bg-accent/10 text-fg ring-1 ring-inset ring-accent/25 [&_svg]:text-accent'
              : 'text-muted hover:bg-raised hover:text-fg',
          )
        }
      >
        {icon}
        <span>{item.label}</span>
      </NavLink>
    </li>
  )
}

interface SidebarProps {
  onNavigate?: () => void
  onClose?: () => void
}

function AccountNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isSignedIn, user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isSignedIn) {
    return <NavEntry item={{ label: 'Sign in', icon: faRightToBracket, to: '/login' }} onNavigate={onNavigate} />
  }
  return (
    <>
      {user && (
        <li className="truncate px-3 pb-1 text-xs text-subtle" title={user.email}>
          {user.email}
        </li>
      )}
      <li>
        <button
          type="button"
          onClick={() => {
            signOut()
            onNavigate?.()
            navigate('/')
          }}
          className={cn(itemBase, 'cursor-pointer text-muted hover:bg-raised hover:text-fg')}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-[15px]" aria-hidden="true" />
          <span>Log out</span>
        </button>
      </li>
    </>
  )
}

export default function Sidebar({ onNavigate, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex h-14 items-center justify-between px-5">
        <NavLink to="/" onClick={onNavigate} className="cursor-pointer" aria-label="Stock Finance — home">
          <img src={logoImage} alt="Stock Finance" className="h-7 w-auto" />
        </NavLink>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-fg"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col justify-between px-3 pb-4 pt-4">
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">Menu</p>
          <ul className="space-y-0.5">
            {mainNav.map((item) => (
              <NavEntry key={item.label} item={item} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
        <ul className="space-y-0.5 border-t border-line pt-4">
          <NavEntry item={settingsNav} onNavigate={onNavigate} />
          <AccountNav onNavigate={onNavigate} />
        </ul>
      </nav>
    </div>
  )
}
