import { useMemo, useState } from 'react'
import DashboardWallet from '../components/Account/DashboardWallet'
import SeparatorInfo from '../components/SeparatorInfo/SeparatorInfo'
import TableStocks from '../components/TableStocks/Tablestocks'
import PriceCard from '../components/LineGraph/PriceCard'
import ChoosingCategory from '../components/LineGraph/Components/ChoosingCategory'
import { parseSeries } from '../components/LineGraph/series'
import { TimeRange } from '../components/LineGraph/interfaces'
import { Card, CardHeader } from '../components/ui/Card'
import MarketHero from '../components/MarketHero/MarketHero'
import { useNewsSections, usePriceHistory, useRandomCompanies, useStockRows } from '../api/queries'

const PAGE_SIZE = 15
const HEATMAP_SIZE = 30

export default function InitPage() {
  const [stockIndex, setStockIndex] = useState(0)
  const [range, setRange] = useState<TimeRange>('1D')
  const [page, setPage] = useState(0)

  const stocksQuery = useRandomCompanies(20)
  const newsQuery = useNewsSections(6)
  const heatQuery = useStockRows(0, HEATMAP_SIZE)
  const rowsQuery = useStockRows(page * PAGE_SIZE, PAGE_SIZE)

  const stocks = stocksQuery.data ?? []
  const stock = stocks[stockIndex] ?? null
  const historyQuery = usePriceHistory(stock?.code, range)

  // The chart waits for the stock list, then for that stock's history
  const chartLoading = stocksQuery.isPending || (!!stock && historyQuery.isPending)
  const series = useMemo(() => parseSeries(historyQuery.data), [historyQuery.data])
  const step = (delta: number) =>
    setStockIndex((i) => (stocks.length ? (i + delta + stocks.length) % stocks.length : 0))

  return (
    <div className="space-y-6">
      <MarketHero rows={heatQuery.data ?? []} isLoading={heatQuery.isPending} />

      <DashboardWallet />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <PriceCard
          className="lg:col-span-2"
          heading={
            <ChoosingCategory
              stock={stock}
              position={stockIndex}
              total={stocks.length}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
            />
          }
          series={series}
          range={range}
          onRangeChange={setRange}
          isLoading={chartLoading}
          height={340}
        />

        <Card className="flex flex-col">
          <CardHeader title="Market news" />
          <div className="px-5 pb-4 pt-3">
            <SeparatorInfo Data={newsQuery.data ?? {}} categorieSelected="This day" isLoading={newsQuery.isPending} />
          </div>
        </Card>
      </div>

      <TableStocks rows={rowsQuery.data} isLoading={rowsQuery.isPending} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
