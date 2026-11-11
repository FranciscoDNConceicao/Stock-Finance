import { useId, useMemo } from 'react'
import { LineChart } from '@mui/x-charts'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { TimeRange } from './interfaces'
import { ParsedSeries } from './series'
import { formatNumber } from '../../scripts/utils'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

// Hex on purpose: MUI charts parses series colors with d3-color, which rejects space-separated rgb().
const UP = '#22C55E'
const DOWN = '#F43F5E'
const MARGIN = { left: 60, right: 28, top: 16, bottom: 32 }

function tickFormatter(range: TimeRange) {
  return (date: Date) => {
    if (range === '1D') return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    if (range === '1W' || range === '1M') return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
}

interface LineGraphProps {
  series: ParsedSeries
  range: TimeRange
  isLoading: boolean
  height?: number
}

export default function LineGraph({ series, range, isLoading, height = 320 }: LineGraphProps) {
  const gradientId = `area-${useId().replace(/:/g, '')}`
  const isUp = (series.stats?.change ?? 0) >= 0
  const color = isUp ? UP : DOWN

  const yDomain = useMemo(() => {
    if (!series.stats) return { min: 0, max: 1 }
    const pad = Math.max((series.stats.high - series.stats.low) * 0.08, series.stats.last * 0.002)
    return { min: series.stats.low - pad, max: series.stats.high + pad }
  }, [series.stats])

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

  const formatX = tickFormatter(range)

  return (
    <div className="animate-fade-in" style={{ height }}>
      <LineChart
        height={height}
        margin={{ left: MARGIN.left, right: MARGIN.right, top: MARGIN.top, bottom: MARGIN.bottom }}
        xAxis={[
          {
            id: 'time',
            data: series.x,
            scaleType: 'time',
            min: series.x[0],
            max: series.x[series.x.length - 1],
            valueFormatter: formatX,
            tickLabelStyle: { fontSize: 11 },
            tickNumber: 5,
          },
        ]}
        yAxis={[
          {
            id: 'price',
            min: yDomain.min,
            max: yDomain.max,
            tickNumber: 5,
            valueFormatter: (v: number) => formatNumber(v, v >= 1000 ? 0 : 2),
            tickLabelStyle: { fontSize: 11 },
          },
        ]}
        bottomAxis={{ axisId: 'time', disableLine: true, disableTicks: true, tickLabelStyle: { fontSize: 11 } }}
        leftAxis={{ axisId: 'price', disableLine: true, disableTicks: true, tickLabelStyle: { fontSize: 11 } }}
        series={[
          {
            data: series.y,
            area: true,
            curve: 'linear',
            showMark: false,
            color,
            label: 'Price',
            valueFormatter: (v: number) => formatNumber(v),
          },
        ]}
        slotProps={{ legend: { hidden: true } }}
        axisHighlight={{ x: 'line', y: 'none' }}
        tooltip={{ trigger: 'axis' }}
        sx={{
          '& .MuiChartsAxis-tickLabel': { fill: 'rgb(100 116 139) !important', fontFamily: 'Inter, sans-serif' },
          '& .MuiChartsAxisHighlight-root': { stroke: 'rgb(148 163 184 / 0.5)', strokeDasharray: '4 4' },
          '& .MuiAreaElement-root': { fill: `url(#${gradientId}) !important` },
          '& .MuiLineElement-root': { strokeWidth: 2 },
        }}
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1={MARGIN.top} x2="0" y2={height - MARGIN.bottom}>
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
      <span className="sr-only">
        Price chart. {formatX(series.x[0])} to {formatX(series.x[series.x.length - 1])}. Last price{' '}
        {series.stats ? formatNumber(series.stats.last) : ''}.
      </span>
    </div>
  )
}
