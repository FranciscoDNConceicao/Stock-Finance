import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBuilding, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from '../../../router'
import { CompanyInfo, LeftOrRightCompany } from '../../../components/CompanyProfile/interfaces'
import {
  CompanyAbout,
  CompanyHero,
  CompanyPageSkeleton,
  KeyStats,
} from '../../../components/CompanyProfile/CompanyProfile'
import PriceCard from '../../../components/LineGraph/PriceCard'
import { parseSeries } from '../../../components/LineGraph/series'
import { CompanyData, TimeRange } from '../../../components/LineGraph/interfaces'
import TableNews from '../../../components/TableNews/TableNews'
import { NewsCompanyTable } from '../../../components/TableNews/interfaces'
import { Card, CardHeader } from '../../../components/ui/Card'
import CompanyLogo from '../../../components/ui/CompanyLogo'
import EmptyState from '../../../components/ui/EmptyState'
import { LeftAndRightValues, getAllValuesFromCompany, getCompanyNews } from '../../../scripts/Company/getCompanyValues'
import { generateDataStockTime } from '../../../scripts/Stocks/DataStockTime'

const NEWS_PER_PAGE = 8

export default function CompanyPage() {
  const { id } = useParams('/company/:id')

  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)

  const [range, setRange] = useState<TimeRange>('1Y')
  const [chartData, setChartData] = useState<CompanyData | null>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const chartRequest = useRef(0)

  const [newsPage, setNewsPage] = useState(0)
  const [news, setNews] = useState<NewsCompanyTable>({ data: [], num_Rows: 0 })
  const [newsLoading, setNewsLoading] = useState(true)

  const [discover, setDiscover] = useState<LeftOrRightCompany[]>([])

  // Company + suggestions, whenever the route id changes
  useEffect(() => {
    let active = true
    setCompanyLoading(true)
    setCompany(null)
    setNewsPage(0)
    getAllValuesFromCompany(id)
      .then((res) => active && setCompany(res?.data ?? null))
      .catch(() => active && setCompany(null))
      .finally(() => active && setCompanyLoading(false))

    Promise.all([LeftAndRightValues(), LeftAndRightValues(), LeftAndRightValues()])
      .then((results) => {
        if (!active) return
        const seen = new Set<string>([String(id)])
        const unique: LeftOrRightCompany[] = []
        for (const result of results) {
          const c = result?.data
          if (!c?.code || seen.has(String(c.id))) continue
          seen.add(String(c.id))
          unique.push(c)
        }
        setDiscover(unique)
      })
      .catch(() => active && setDiscover([]))
    return () => {
      active = false
    }
  }, [id])

  // Price history
  useEffect(() => {
    if (!company?.code) return
    const requestId = ++chartRequest.current
    setChartLoading(true)
    generateDataStockTime(company.code, range)
      .then((res) => requestId === chartRequest.current && setChartData(res?.data ?? null))
      .catch(() => requestId === chartRequest.current && setChartData(null))
      .finally(() => requestId === chartRequest.current && setChartLoading(false))
  }, [company?.code, range])

  // News
  useEffect(() => {
    if (!company) return
    let active = true
    setNewsLoading(true)
    getCompanyNews(id, newsPage * NEWS_PER_PAGE, (newsPage + 1) * NEWS_PER_PAGE)
      .then((res) => active && setNews(res?.data ?? { data: [], num_Rows: 0 }))
      .catch(() => active && setNews({ data: [], num_Rows: 0 }))
      .finally(() => active && setNewsLoading(false))
    return () => {
      active = false
    }
  }, [company, id, newsPage])

  const series = useMemo(() => parseSeries(chartData), [chartData])

  const backLink = (
    <Link to="/" className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
      <FontAwesomeIcon icon={faArrowLeft} className="text-xs" aria-hidden="true" />
      Dashboard
    </Link>
  )

  if (companyLoading) {
    return (
      <>
        {backLink}
        <CompanyPageSkeleton />
      </>
    )
  }

  if (!company) {
    return (
      <>
        {backLink}
        <Card className="mx-auto max-w-lg">
          <EmptyState icon={faBuilding} title="Company not found" description="We couldn't load this company. It may not exist or the server is unavailable." />
        </Card>
      </>
    )
  }

  return (
    <div>
      {backLink}
      <div className="space-y-4 lg:space-y-6">
        <CompanyHero company={company} />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <PriceCard
            className="lg:col-span-2"
            heading={<h2 className="text-[15px] font-semibold tracking-tight text-fg">Price history</h2>}
            series={series}
            range={range}
            onRangeChange={setRange}
            isLoading={chartLoading}
            currency={company.currency_name}
            height={340}
          />
          <KeyStats company={company} stats={series.stats} isLoading={chartLoading} />
        </div>

        <CompanyAbout company={company} />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <TableNews
              dataTable={news}
              page={newsPage}
              rowsPerPage={NEWS_PER_PAGE}
              isLoading={newsLoading}
              onPageChange={setNewsPage}
            />
          </div>

          {discover.length > 0 && (
            <Card className="h-fit">
              <CardHeader title="Discover" description="Other companies to explore" />
              <ul className="space-y-1 px-3 pb-3 pt-3">
                {discover.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/company/:id"
                      params={{ id: String(c.id) }}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-raised"
                    >
                      <CompanyLogo code={c.code} color={c.color} size="sm" />
                      <span className="flex-1 text-sm font-semibold text-fg">{c.code}</span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-xs text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
