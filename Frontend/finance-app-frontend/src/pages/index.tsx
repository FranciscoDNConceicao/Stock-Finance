import { useEffect, useMemo, useRef, useState } from 'react'
import WalletComponent from '../components/WalletComponent/WalletComponent'
import SeparatorInfo from '../components/SeparatorInfo/SeparatorInfo'
import TableStocks from '../components/TableStocks/Tablestocks'
import PriceCard from '../components/LineGraph/PriceCard'
import ChoosingCategory from '../components/LineGraph/Components/ChoosingCategory'
import { parseSeries } from '../components/LineGraph/series'
import { CompanyData, StockImage, TimeRange } from '../components/LineGraph/interfaces'
import { StockRow } from '../components/TableStocks/interfaces'
import { Card, CardHeader } from '../components/ui/Card'
import MarketHero from '../components/MarketHero/MarketHero'
import { generateDataStockTime } from '../scripts/Stocks/DataStockTime'
import { POST } from '../scripts/axios'

const PAGE_SIZE = 15
const HEATMAP_SIZE = 30

// Placeholder until the wallet endpoint exists
const wallet = {
  balance: 3824.45,
  wallet_balance: 2694.32,
  day_balance: 34.42,
  total_balance: 593.13,
}

export default function InitPage() {
  // Chart
  const [stocks, setStocks] = useState<StockImage[]>([])
  const [stockIndex, setStockIndex] = useState(0)
  const [range, setRange] = useState<TimeRange>('1D')
  const [chartData, setChartData] = useState<CompanyData | null>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const chartRequest = useRef(0)

  // News
  const [news, setNews] = useState<NewsData>({})
  const [newsLoading, setNewsLoading] = useState(true)

  // Markets table
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<StockRow[] | null>(null)
  const [rowsLoading, setRowsLoading] = useState(true)

  // Hero heatmap
  const [heatRows, setHeatRows] = useState<StockRow[]>([])
  const [heatLoading, setHeatLoading] = useState(true)

  useEffect(() => {
    POST('http://127.0.0.1:8000/company/random/', { limit: 20 })
      .then((data: StockImage[]) => setStocks(data ?? []))
      .catch(() => {
        setStocks([])
        setChartLoading(false)
      })

    POST('http://127.0.0.1:8000/news/get/essential/SeparatedDate', { limit: 6 })
      .then((data: NewsData) => setNews(data ?? {}))
      .catch(() => setNews({}))
      .finally(() => setNewsLoading(false))

    POST('http://127.0.0.1:8000/stock/select/StockForDataGrid', { initPage: 0, endPage: HEATMAP_SIZE })
      .then((data: StockRow[]) => setHeatRows(data ?? []))
      .catch(() => setHeatRows([]))
      .finally(() => setHeatLoading(false))
  }, [])

  const stock = stocks[stockIndex] ?? null
  const stockCode = stock?.code

  useEffect(() => {
    if (!stockCode) return
    const requestId = ++chartRequest.current
    setChartLoading(true)
    generateDataStockTime(stockCode, range)
      .then((res) => requestId === chartRequest.current && setChartData(res?.data ?? null))
      .catch(() => requestId === chartRequest.current && setChartData(null))
      .finally(() => requestId === chartRequest.current && setChartLoading(false))
  }, [stockCode, range])

  useEffect(() => {
    let active = true
    setRowsLoading(true)
    POST('http://127.0.0.1:8000/stock/select/StockForDataGrid', {
      initPage: page * PAGE_SIZE,
      endPage: page * PAGE_SIZE + PAGE_SIZE,
    })
      .then((data: StockRow[]) => active && setRows(data ?? []))
      .catch(() => active && setRows([]))
      .finally(() => active && setRowsLoading(false))
    return () => {
      active = false
    }
  }, [page])

  const series = useMemo(() => parseSeries(chartData), [chartData])
  const step = (delta: number) =>
    setStockIndex((i) => (stocks.length ? (i + delta + stocks.length) % stocks.length : 0))

  return (
    <div className="space-y-6">
      <MarketHero rows={heatRows} isLoading={heatLoading} />

      <WalletComponent WalletData={wallet} />

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
            <SeparatorInfo Data={news} categorieSelected="This day" isLoading={newsLoading} />
          </div>
        </Card>
      </div>

      <TableStocks rows={rows} isLoading={rowsLoading} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
