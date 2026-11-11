import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBuilding, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from '../../../router'
import {
  CompanyAbout,
  CompanyHero,
  CompanyPageSkeleton,
  KeyStats,
} from '../../../components/CompanyProfile/CompanyProfile'
import PriceCard from '../../../components/LineGraph/PriceCard'
import { parseSeries } from '../../../components/LineGraph/series'
import { TimeRange } from '../../../components/LineGraph/interfaces'
import TableNews from '../../../components/TableNews/TableNews'
import { Card, CardHeader } from '../../../components/ui/Card'
import CompanyLogo from '../../../components/ui/CompanyLogo'
import EmptyState from '../../../components/ui/EmptyState'
import { useCompany, useCompanyNews, useDiscoverCompanies, usePriceHistory } from '../../../api/queries'
import TradeCard from '../../../components/Account/TradeCard'
import WatchlistButton from '../../../components/Account/WatchlistButton'

const NEWS_PER_PAGE = 8
const NO_NEWS = { data: [], num_Rows: 0 }

export default function CompanyPage() {
  const { id } = useParams('/company/:id')
  // Remount per company so the news page and chart range start fresh
  return <CompanyView key={id} id={id} />
}

function CompanyView({ id }: { id: string }) {
  const [range, setRange] = useState<TimeRange>('1Y')
  const [newsPage, setNewsPage] = useState(0)

  const companyQuery = useCompany(id)
  const company = companyQuery.data
  const historyQuery = usePriceHistory(company?.code, range)
  const newsQuery = useCompanyNews(id, newsPage * NEWS_PER_PAGE, NEWS_PER_PAGE, !!company)
  const discover = useDiscoverCompanies(id).data ?? []

  const series = useMemo(() => parseSeries(historyQuery.data), [historyQuery.data])

  const backLink = (
    <Link to="/" className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
      <FontAwesomeIcon icon={faArrowLeft} className="text-xs" aria-hidden="true" />
      Dashboard
    </Link>
  )

  if (companyQuery.isPending) {
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
        <CompanyHero company={company} actions={<WatchlistButton companyId={Number(id)} />} />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <PriceCard
            className="lg:col-span-2"
            heading={<h2 className="text-[15px] font-semibold tracking-tight text-fg">Price history</h2>}
            series={series}
            range={range}
            onRangeChange={setRange}
            isLoading={historyQuery.isPending}
            currency={company.currency_name ?? undefined}
            height={340}
          />
          <KeyStats company={company} stats={series.stats} isLoading={historyQuery.isPending} />
        </div>

        <CompanyAbout company={company} />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <TableNews
              dataTable={newsQuery.data ?? NO_NEWS}
              page={newsPage}
              rowsPerPage={NEWS_PER_PAGE}
              isLoading={newsQuery.isPending}
              onPageChange={setNewsPage}
            />
          </div>

          <div className="space-y-4 lg:space-y-6">
          <TradeCard companyId={Number(id)} code={company.code} lastPrice={series.stats?.last} />

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
    </div>
  )
}
