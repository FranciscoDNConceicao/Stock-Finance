import { ChartStats, CompanyData } from './interfaces'
import { toNumber } from '../../scripts/utils'

export interface ParsedSeries {
  x: Date[]
  y: number[]
  stats: ChartStats | null
}

/** Turns the backend `{timestamp: "price"}` map into sorted, numeric series + summary stats. */
export function parseSeries(data: CompanyData | null): ParsedSeries {
  if (!data) return { x: [], y: [], stats: null }
  const points = Object.entries(data)
    .map(([ts, v]) => ({ t: new Date(ts), v: toNumber(v) }))
    .filter((p) => !Number.isNaN(p.t.getTime()) && Number.isFinite(p.v))
    .sort((a, b) => a.t.getTime() - b.t.getTime())

  const x = points.map((p) => p.t)
  const y = points.map((p) => p.v)
  if (y.length === 0) return { x, y, stats: null }

  const first = y[0]
  const last = y[y.length - 1]
  return {
    x,
    y,
    stats: {
      first,
      last,
      high: Math.max(...y),
      low: Math.min(...y),
      change: last - first,
      changePct: first !== 0 ? (last - first) / first : 0,
    },
  }
}
