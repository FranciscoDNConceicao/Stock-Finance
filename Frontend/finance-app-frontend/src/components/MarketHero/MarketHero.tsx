import { PointerEvent, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendDown, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons'
import { Link } from '../../router'
import { StockRow } from '../TableStocks/interfaces'
import Heatmap from './Heatmap'
import { formatDuration, useCountUp, useMarketStatus } from './hooks'
import CompanyLogo from '../ui/CompanyLogo'
import Skeleton from '../ui/Skeleton'
import { cn, formatPercent } from '../../scripts/utils'

function greeting(date: Date) {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function MarketStatusPill() {
  const { isOpen, minutesLeft, nyTime } = useMarketStatus()
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur',
        isOpen ? 'border-up/30 bg-up/10 text-up' : 'border-line-strong bg-raised/60 text-muted',
      )}
      title="NYSE regular session, 09:30 to 16:00 New York time. Holidays are not taken into account."
    >
      <span className="relative flex h-2 w-2">
        {isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', isOpen ? 'bg-up' : 'bg-subtle')} />
      </span>
      <span>
        NYSE {isOpen ? 'open' : 'closed'}
        <span className="text-subtle"> · {isOpen ? 'closes' : 'opens'} in {formatDuration(minutesLeft)}</span>
      </span>
      <span className="hidden border-l border-white/10 pl-2 text-subtle tabular sm:inline">NY {nyTime}</span>
    </div>
  )
}

function Mover({ row, kind }: { row: StockRow; kind: 'gainer' | 'loser' }) {
  const [name, code, color] = row.stockName ?? ['', row.icon, '']
  const up = kind === 'gainer'
  return (
    <Link
      to="/company/:id"
      params={{ id: row.id.toString() }}
      className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg/40 p-3 backdrop-blur transition-colors duration-200 hover:border-line-strong hover:bg-raised/60"
    >
      <CompanyLogo code={row.icon} color={color} size="sm" />
      <div className="min-w-0 flex-1" title={name ?? undefined}>
        <p className="truncate text-sm font-semibold leading-tight text-fg group-hover:text-accent-hover">{code}</p>
        <p className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[11px] text-subtle">
          <FontAwesomeIcon icon={up ? faArrowTrendUp : faArrowTrendDown} className={up ? 'text-up' : 'text-down'} aria-hidden="true" />
          Top {kind}
        </p>
      </div>
      <span className={cn('shrink-0 text-sm font-semibold tabular', up ? 'text-up' : 'text-down')}>{formatPercent(row.percentage)}</span>
    </Link>
  )
}

function Breadth({ rows }: { rows: StockRow[] }) {
  const stats = useMemo(() => {
    const changes = rows.map((r) => r.percentage).filter(Number.isFinite)
    const up = changes.filter((c) => c > 0).length
    const down = changes.filter((c) => c < 0).length
    const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : 0
    return { up, down, flat: changes.length - up - down, total: changes.length, avg }
  }, [rows])

  const up = Math.round(useCountUp(stats.up))
  const down = Math.round(useCountUp(stats.down))
  const avg = useCountUp(stats.avg)

  const upPct = stats.total ? (stats.up / stats.total) * 100 : 0
  const downPct = stats.total ? (stats.down / stats.total) * 100 : 0
  const mood = stats.avg > 0.002 ? 'Bullish' : stats.avg < -0.002 ? 'Bearish' : 'Mixed'

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Market breadth</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular sm:text-4xl">
            <span className="text-up">{up}</span>
            <span className="mx-1.5 text-line-strong">/</span>
            <span className="text-down">{down}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            advancing / declining{stats.flat > 0 && ` · ${stats.flat} flat`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Avg. change</p>
          <p className={cn('mt-1 text-xl font-semibold tabular', stats.avg > 0 ? 'text-up' : stats.avg < 0 ? 'text-down' : 'text-fg')}>
            {formatPercent(avg)}
          </p>
          <p className="mt-0.5 text-xs text-muted">{mood} session</p>
        </div>
      </div>
      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-raised"
        role="img"
        aria-label={`${stats.up} advancing, ${stats.down} declining, ${stats.flat} unchanged`}
      >
        <div className="breadth-bar h-full origin-left rounded-l-full bg-up shadow-[0_0_12px_rgb(var(--up)/0.6)]" style={{ width: `${upPct}%` }} />
        <div className="h-full flex-1" />
        <div className="breadth-bar h-full origin-right rounded-r-full bg-down shadow-[0_0_12px_rgb(var(--down)/0.6)]" style={{ width: `${downPct}%` }} />
      </div>
    </div>
  )
}

interface MarketHeroProps {
  rows: StockRow[]
  isLoading: boolean
}

export default function MarketHero({ rows, isLoading }: MarketHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const now = new Date()

  const movers = useMemo(() => {
    const valid = rows.filter((r) => Number.isFinite(r.percentage))
    if (!valid.length) return null
    const sorted = [...valid].sort((a, b) => b.percentage - a.percentage)
    const gainer = sorted[0]
    const loser = sorted[sorted.length - 1]
    return { gainer: gainer.percentage > 0 ? gainer : null, loser: loser.percentage < 0 ? loser : null }
  }, [rows])

  // Spotlight follows the pointer via CSS variables (no re-render)
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <section
      ref={heroRef}
      onPointerMove={onPointerMove}
      aria-labelledby="hero-title"
      className="hero-spotlight relative isolate overflow-hidden rounded-3xl border border-line bg-surface shadow-card"
    >
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora-blob left-[-10%] top-[-30%] h-[380px] w-[520px] bg-accent/30" />
        <div className="aurora-blob aurora-delay right-[-5%] top-[10%] h-[320px] w-[420px] bg-up/15" />
        <div className="aurora-blob aurora-delay-2 bottom-[-40%] left-[30%] h-[360px] w-[480px] bg-fuchsia-500/15" />
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-5 lg:gap-8">
        <div className="flex min-w-0 flex-col justify-between gap-6 lg:col-span-2">
          <div>
            <MarketStatusPill />
            <p className="mt-5 text-[13px] font-medium text-muted">
              Dashboard · {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 id="hero-title" className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="hero-gradient-text">{greeting(now)}.</span>
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Here is how the market is moving right now: breadth, the biggest movers and a live heatmap.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3" aria-hidden="true">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Skeleton className="h-[62px] rounded-xl" />
                <Skeleton className="h-[62px] rounded-xl" />
              </div>
            </div>
          ) : rows.length > 0 ? (
            <div className="space-y-4">
              <Breadth rows={rows} />
              {movers && (movers.gainer || movers.loser) && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {movers.gainer && <Mover row={movers.gainer} kind="gainer" />}
                  {movers.loser && <Mover row={movers.loser} kind="loser" />}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-fg">Heatmap</h2>
            <div className="flex items-center gap-2 text-[11px] text-subtle" aria-hidden="true">
              <span className="tabular">−3%</span>
              <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-[#E11D48] via-[#1E2536] to-[#16A34A]" />
              <span className="tabular">+3%</span>
            </div>
          </div>
          <Heatmap rows={rows} isLoading={isLoading} className="h-[260px] sm:h-[320px] lg:h-full lg:min-h-[340px]" />
          <p className="mt-2 text-[11px] text-subtle">Tile size by all-time high, colour by today's change. Select a tile to open the company.</p>
        </div>
      </div>
    </section>
  )
}
