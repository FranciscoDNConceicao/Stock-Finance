import { ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowUpRightFromSquare,
  faCalendarDays,
  faGlobe,
  faIndustry,
  faLocationDot,
  faMapLocationDot,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { CompanyInfo } from './interfaces'
import { Card, CardHeader } from '../ui/Card'
import CompanyLogo from '../ui/CompanyLogo'
import Skeleton from '../ui/Skeleton'
import { ChartStats } from '../LineGraph/interfaces'
import { formatCompact, formatDate, formatNumber, hexColor, prettyHost, readableOn, safeUrl, toNumber } from '../../scripts/utils'

/* ---------- Hero ---------- */

export function CompanyHero({ company, actions }: { company: CompanyInfo; actions?: ReactNode }) {
  const color = hexColor(company.color)
  const website = safeUrl(company.URL)
  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(900px 220px at 0% 0%, ${color}, transparent 70%)` }}
      />
      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <CompanyLogo code={company.code} color={company.color} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">{company.name ?? company.code}</h1>
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide"
              style={{ backgroundColor: color, color: readableOn(color) }}
            >
              {company.code}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            {company.locate && (
              <span className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faLocationDot} className="text-subtle" aria-hidden="true" />
                {company.locate.toUpperCase()}
              </span>
            )}
            {company.sicCode && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <FontAwesomeIcon icon={faIndustry} className="text-subtle" aria-hidden="true" />
                <span className="truncate">{company.sicCode}</span>
              </span>
            )}
            {company.dateList && (
              <span className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarDays} className="text-subtle" aria-hidden="true" />
                Listed {formatDate(company.dateList)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {actions}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-line-strong bg-raised px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:border-muted/40 hover:bg-line"
            >
              Website
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-muted" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ---------- Key statistics ---------- */

function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-fg tabular">{value}</dd>
    </div>
  )
}

export function KeyStats({ company, stats, isLoading }: { company: CompanyInfo; stats: ChartStats | null; isLoading: boolean }) {
  const employees = toNumber(company.num_employees)
  const allTimeHigh = toNumber(company.highMax)
  const currency = company.currency_name?.toUpperCase()
  const money = (n: number) => (Number.isFinite(n) ? `${formatNumber(n)} ${currency ?? ''}`.trim() : '—')
  const loading = <Skeleton className="ml-auto h-3.5 w-16" />

  return (
    <Card className="flex flex-col">
      <CardHeader title="Key statistics" />
      <dl className="divide-y divide-line px-5 pb-3 pt-2">
        <StatRow label="Period open" value={isLoading ? loading : money(stats?.first ?? NaN)} />
        <StatRow label="Period high" value={isLoading ? loading : money(stats?.high ?? NaN)} />
        <StatRow label="Period low" value={isLoading ? loading : money(stats?.low ?? NaN)} />
        <StatRow label="All-time high" value={money(allTimeHigh)} />
        <StatRow label="Employees" value={Number.isFinite(employees) ? formatCompact(employees) : '—'} />
        <StatRow label="Currency" value={currency || '—'} />
      </dl>
    </Card>
  )
}

/* ---------- About ---------- */

function DetailItem({ icon, label, children }: { icon: IconDefinition; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-raised text-[13px] text-subtle">
        <FontAwesomeIcon icon={icon} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-subtle">{label}</dt>
        <dd className="mt-0.5 break-words text-[13px] text-fg">{children}</dd>
      </div>
    </div>
  )
}

export function CompanyAbout({ company }: { company: CompanyInfo }) {
  const [expanded, setExpanded] = useState(false)
  const description = company.description?.trim()
  const long = (description?.length ?? 0) > 420
  const website = safeUrl(company.URL)

  return (
    <Card>
      <CardHeader title={`About ${company.name ?? company.code}`} />
      <div className="grid gap-6 px-5 pb-5 pt-3 md:grid-cols-5">
        <div className="md:col-span-3">
          {description ? (
            <>
              <p className={`text-sm leading-relaxed text-muted ${!expanded && long ? 'line-clamp-6' : ''}`}>{description}</p>
              {long && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 cursor-pointer text-[13px] font-medium text-accent hover:text-accent-hover"
                  aria-expanded={expanded}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-subtle">No description available.</p>
          )}
        </div>
        <dl className="space-y-4 md:col-span-2 md:border-l md:border-line md:pl-6">
          {company.address && (
            <DetailItem icon={faMapLocationDot} label="Headquarters">{company.address}</DetailItem>
          )}
          {website && (
            <DetailItem icon={faGlobe} label="Website">
              <a href={website} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-accent hover:text-accent-hover hover:underline">
                {prettyHost(company.URL)}
              </a>
            </DetailItem>
          )}
          {company.num_employees != null && (
            <DetailItem icon={faUsers} label="Employees">{formatNumber(company.num_employees, 0)}</DetailItem>
          )}
          {company.sicCode && <DetailItem icon={faIndustry} label="Industry (SIC)">{company.sicCode}</DetailItem>}
        </dl>
      </div>
    </Card>
  )
}

/* ---------- Loading skeleton for the whole page ---------- */

export function CompanyPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading company">
      <Card className="flex items-center gap-5 p-6">
        <Skeleton className="h-20 w-20 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[460px] rounded-2xl lg:col-span-2" />
        <Skeleton className="h-[460px] rounded-2xl" />
      </div>
    </div>
  )
}
