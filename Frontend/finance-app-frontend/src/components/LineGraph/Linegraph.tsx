import { PointerEvent, useEffect, useId, useMemo, useRef, useState } from 'react'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { TimeRange } from './interfaces'
import { ParsedSeries } from './series'
import { cn, formatNumber } from '../../scripts/utils'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

const MARGIN = { left: 60, right: 28, top: 16, bottom: 32 }
const TICKS = 5

function tickFormatter(range: TimeRange) {
  return (date: Date) => {
    if (range === '1D') return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    if (range === '1W' || range === '1M') return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
}

const formatPrice = (v: number) => formatNumber(v, v >= 1000 ? 0 : 2)

/** Round tick values (1, 2, 2.5 or 5 × 10^n) covering [min, max]. */
function niceTicks(min: number, max: number, count: number): number[] {
  const raw = (max - min) / Math.max(count - 1, 1)
  if (!(raw > 0)) return [min]
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(v)
  return ticks
}

/** Index of the point whose time is closest to `t` (x is sorted). */
function nearestIndex(x: Date[], t: number): number {
  let lo = 0
  let hi = x.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (x[mid].getTime() < t) lo = mid
    else hi = mid
  }
  return Math.abs(x[lo].getTime() - t) <= Math.abs(x[hi].getTime() - t) ? lo : hi
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

interface LineGraphProps {
  series: ParsedSeries
  range: TimeRange
  isLoading: boolean
  height?: number
}

export default function LineGraph({ series, range, isLoading, height = 320 }: LineGraphProps) {
  if (isLoading) {
    return (
      <div style={{ height }} className="flex flex-col justify-end gap-3 px-5 pb-5" aria-busy="true" aria-label="Loading chart">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    )
  }

  if (series.y.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <EmptyState icon={faChartLine} title="No price data" description="There is no data available for this period." />
      </div>
    )
  }

  return <Chart series={series} range={range} height={height} />
}

function Chart({ series, range, height }: { series: ParsedSeries; range: TimeRange; height: number }) {
  const gradientId = `area-${useId().replace(/:/g, '')}`
  const [containerRef, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const { x, y, stats } = series
  const isUp = (stats?.change ?? 0) >= 0
  const formatX = tickFormatter(range)

  const chart = useMemo(() => {
    const low = stats?.low ?? Math.min(...y)
    const high = stats?.high ?? Math.max(...y)
    const pad = Math.max((high - low) * 0.08, Math.abs(stats?.last ?? high) * 0.002)
    const yMin = low - pad
    const yMax = high + pad
    const t0 = x[0].getTime()
    const t1 = x[x.length - 1].getTime()
    const innerW = Math.max(width - MARGIN.left - MARGIN.right, 0)
    const innerH = height - MARGIN.top - MARGIN.bottom

    const sx = (t: number) => MARGIN.left + ((t - t0) / (t1 - t0 || 1)) * innerW
    const sy = (v: number) => MARGIN.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH

    const points = x.map((d, i) => `${sx(d.getTime()).toFixed(1)},${sy(y[i]).toFixed(1)}`)
    const line = `M${points.join('L')}`
    const bottom = MARGIN.top + innerH
    const area = `${line}L${sx(t1).toFixed(1)},${bottom}L${sx(t0).toFixed(1)},${bottom}Z`

    const yTicks = niceTicks(yMin, yMax, TICKS).map((v) => ({ v, y: sy(v) }))
    const xTicks = Array.from({ length: TICKS }, (_, i) => {
      const t = t0 + ((t1 - t0) * i) / (TICKS - 1)
      return { t, x: sx(t) }
    })
    return { sx, sy, line, area, yTicks, xTicks, t0, t1, innerW, bottom }
  }, [x, y, stats, width, height])

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (chart.innerW <= 0) return
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left
    const ratio = Math.min(Math.max((px - MARGIN.left) / chart.innerW, 0), 1)
    setHover(nearestIndex(x, chart.t0 + ratio * (chart.t1 - chart.t0)))
  }

  const hx = hover !== null ? chart.sx(x[hover].getTime()) : 0
  const hy = hover !== null ? chart.sy(y[hover]) : 0

  return (
    <div ref={containerRef} className={cn('relative animate-fade-in', isUp ? 'text-up' : 'text-down')} style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block touch-pan-y select-none"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1={MARGIN.top} x2="0" y2={chart.bottom} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>

          <g className="fill-subtle text-[11px]">
            {chart.yTicks.map(({ v, y: ty }) => (
              <text key={v} x={MARGIN.left - 8} y={ty} dy="0.32em" textAnchor="end">
                {formatPrice(v)}
              </text>
            ))}
            {chart.xTicks.map(({ t, x: tx }, i) => (
              <text key={t} x={tx} y={height - 10} textAnchor={i === 0 ? 'start' : i === TICKS - 1 ? 'end' : 'middle'}>
                {formatX(new Date(t))}
              </text>
            ))}
          </g>

          <path d={chart.area} fill={`url(#${gradientId})`} />
          <path d={chart.line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null && (
            <g>
              <line x1={hx} x2={hx} y1={MARGIN.top} y2={chart.bottom} className="stroke-muted/50" strokeDasharray="4 4" />
              <circle cx={hx} cy={hy} r={4} fill="currentColor" className="stroke-surface" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}

      {hover !== null && (
        <div
          role="presentation"
          className="pointer-events-none absolute z-10 rounded-lg border border-line-strong bg-raised/95 px-2.5 py-1.5 shadow-pop backdrop-blur"
          style={{
            left: Math.min(Math.max(hx, 70), width - 70),
            top: hy < 60 ? hy + 12 : hy - 12,
            transform: `translate(-50%, ${hy < 60 ? '0' : '-100%'})`,
          }}
        >
          <p className="whitespace-nowrap text-[11px] text-subtle">{formatX(x[hover])}</p>
          <p className="text-[13px] font-semibold text-fg tabular">{formatNumber(y[hover])}</p>
        </div>
      )}

      <span className="sr-only">
        Price chart. {formatX(x[0])} to {formatX(x[x.length - 1])}. Last price {stats ? formatNumber(stats.last) : ''}.
      </span>
    </div>
  )
}
