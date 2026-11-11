import { useEffect, useMemo, useRef, useState } from 'react'
import { faBorderAll } from '@fortawesome/free-solid-svg-icons'
import { Link } from '../../router'
import { StockRow } from '../TableStocks/interfaces'
import { squarify, Tile } from './treemap'
import CompanyLogo from '../ui/CompanyLogo'
import ChangeBadge from '../ui/ChangeBadge'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { cn, formatNumber, formatPercent, toNumber } from '../../scripts/utils'

const GAP = 3
const NEUTRAL = [30, 37, 54] // #1E2536
const UP = [22, 163, 74] // #16A34A
const DOWN = [225, 29, 72] // #E11D48
/** Change (ratio) at which a tile reaches full color */
const SATURATION = 0.03

function heatColor(change: number): string {
  if (!Number.isFinite(change) || change === 0) return `rgb(${NEUTRAL.join(' ')})`
  const t = Math.min(Math.abs(change) / SATURATION, 1) ** 0.75
  const target = change > 0 ? UP : DOWN
  const mix = NEUTRAL.map((c, i) => Math.round(c + (target[i] - c) * (0.25 + 0.75 * t)))
  return `rgb(${mix.join(' ')})`
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (Math.abs(s.width - width) < 1 && Math.abs(s.height - height) < 1 ? s : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

interface HeatmapProps {
  rows: StockRow[]
  isLoading: boolean
  className?: string
}

export default function Heatmap({ rows, isLoading, className }: HeatmapProps) {
  const [ref, { width, height }] = useSize<HTMLDivElement>()
  const [hovered, setHovered] = useState<Tile<StockRow> | null>(null)

  const tiles = useMemo(() => {
    const items = rows
      // Square root keeps the largest names from swallowing the whole map
      .map((row) => ({ value: Math.sqrt(Math.max(toNumber(row.priceHigh?.[0]), 0)) || 1, item: row }))
      .sort((a, b) => b.value - a.value)
    return squarify(items, width + GAP, height + GAP)
  }, [rows, width, height])

  return (
    <div ref={ref} className={cn('relative', className)} onPointerLeave={() => setHovered(null)}>
      {isLoading ? (
        <div className="grid h-full grid-cols-4 grid-rows-3 gap-[3px]" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-full w-full rounded-lg', i === 0 && 'col-span-2 row-span-2', i === 1 && 'row-span-2')}
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={faBorderAll} title="No market data" description="The heatmap appears once quotes are available." className="h-full" />
      ) : (
        <ul aria-label="Market heatmap" className="h-full">
          {tiles.map((tile, i) => {
            const { item: row } = tile
            const [name, code] = row.stockName ?? ['', row.icon]
            const w = tile.w - GAP
            const h = tile.h - GAP
            const showCode = w > 34 && h > 22
            const showChange = w > 52 && h > 40
            const showName = w > 118 && h > 74
            const big = w > 150 && h > 110
            return (
              <li
                key={row.id}
                className="absolute"
                style={{ left: tile.x, top: tile.y, width: Math.max(w, 0), height: Math.max(h, 0) }}
              >
                <Link
                  to="/company/:id"
                  params={{ id: row.id.toString() }}
                  onPointerEnter={() => setHovered(tile)}
                  onFocus={() => setHovered(tile)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${name} (${code}), ${formatPercent(row.percentage)}`}
                  className="heat-tile group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg text-center text-white"
                  style={{ backgroundColor: heatColor(row.percentage), animationDelay: `${i * 28}ms` }}
                >
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.09] to-transparent" />
                  {showCode && (
                    <span className={cn('relative font-semibold leading-none tracking-tight drop-shadow', big ? 'text-xl' : w > 80 ? 'text-sm' : 'text-[11px]')}>
                      {code}
                    </span>
                  )}
                  {showChange && (
                    <span className={cn('relative mt-1 font-medium leading-none text-white/85 tabular', big ? 'text-sm' : 'text-[11px]')}>
                      {formatPercent(row.percentage)}
                    </span>
                  )}
                  {showName && (
                    <span className="relative mt-1.5 max-w-[90%] truncate text-[10.5px] leading-none text-white/60">{name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {hovered && !isLoading && <HeatTooltip tile={hovered} width={width} />}
    </div>
  )
}

function HeatTooltip({ tile, width }: { tile: Tile<StockRow>; width: number }) {
  const row = tile.item
  const [name, code, color] = row.stockName ?? ['', row.icon, '']
  const price = toNumber(row.priceLast?.[0])
  const below = tile.y < 96
  const left = Math.min(Math.max(tile.x + (tile.w - GAP) / 2, 110), Math.max(width - 110, 110))
  const top = below ? tile.y + tile.h + 6 : tile.y - 8

  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-20 w-[208px] animate-fade-in rounded-xl border border-line-strong bg-raised/95 p-3 shadow-pop backdrop-blur"
      style={{ left, top, transform: `translate(-50%, ${below ? '0' : '-100%'})` }}
    >
      <div className="flex items-center gap-2.5">
        <CompanyLogo code={row.icon} color={color} size="xs" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-fg">{name}</p>
          <p className="text-[11px] text-subtle">{code}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <p className="text-base font-semibold text-fg tabular">
          {Number.isFinite(price) ? formatNumber(price) : '—'}
          <span className="ml-1 text-[11px] font-normal text-subtle">{row.priceLast?.[1]}</span>
        </p>
        <ChangeBadge value={row.percentage} />
      </div>
    </div>
  )
}
