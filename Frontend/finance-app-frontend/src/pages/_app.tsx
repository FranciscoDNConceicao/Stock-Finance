import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import { TickerActionInt } from '../components/Ticker/Interfaces'
import { generateDataTicket } from '../scripts/Stocks/TickerDataStock'
import { cn } from '../scripts/utils'

export default function App() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [tickerData, setTickerData] = useState<TickerActionInt[] | null>(null)
  const [tickerLoading, setTickerLoading] = useState(true)

  useEffect(() => {
    let active = true
    generateDataTicket()
      .then((response) => {
        if (active) setTickerData(response?.data ?? null)
      })
      .catch(() => {
        if (active) setTickerData(null)
      })
      .finally(() => {
        if (active) setTickerLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Close the mobile drawer and reset scroll on navigation
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', menuOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn('absolute inset-0 bg-black/60 transition-opacity duration-200', menuOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-pop transition-transform duration-200 ease-out',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {menuOpen && <Sidebar onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />}
        </aside>
      </div>

      <div className="lg:pl-60">
        <Header onOpenMenu={() => setMenuOpen(true)} tickerData={tickerData} tickerLoading={tickerLoading} />
        <main id="main" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
