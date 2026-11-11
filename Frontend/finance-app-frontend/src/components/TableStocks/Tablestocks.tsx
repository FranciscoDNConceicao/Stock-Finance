import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faTableList } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from '../../router'
import { TableStocksProps, StockRow } from './interfaces'
import { Card, CardHeader } from '../ui/Card'
import CompanyLogo from '../ui/CompanyLogo'
import ChangeBadge from '../ui/ChangeBadge'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import Pagination from '../ui/Pagination'
import { formatDate, formatNumber, hexColor, readableOn, toNumber } from '../../scripts/utils'

function Price({ value }: { value: [string, string] }) {
  const n = toNumber(value?.[0])
  return (
    <div className="text-right">
      <span className="font-medium text-fg tabular">{Number.isFinite(n) ? formatNumber(n) : '—'}</span>
      <span className="ml-1 text-[11px] text-subtle">{value?.[1]}</span>
    </div>
  )
}

const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle first:pl-5 last:pr-5'
const td = 'px-4 py-3 first:pl-5 last:pr-5'

export default function TableStocks({ rows, isLoading, page, pageSize, onPageChange }: TableStocksProps) {
  const navigate = useNavigate()
  const data: StockRow[] = rows ?? []
  const open = (id: StockRow['id']) => navigate('/company/:id', { params: { id: id.toString() } })

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Markets" description="Most valuable listed companies, by all-time high" className="pb-4" />

      <div className="overflow-x-auto">
        <table className="w-full border-t border-line text-sm">
          <thead className="bg-bg/40">
            <tr>
              <th scope="col" className={`${th} text-left`}>Company</th>
              <th scope="col" className={`${th} text-right`}>Last price</th>
              <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Change</th>
              <th scope="col" className={`${th} hidden text-right md:table-cell`}>High</th>
              <th scope="col" className={`${th} hidden text-right lg:table-cell`}>Updated</th>
              <th scope="col" className={`${th} w-10`}><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28 sm:w-36" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </div>
                    </td>
                    <td className={td}><Skeleton className="ml-auto h-3.5 w-20" /></td>
                    <td className={`${td} hidden sm:table-cell`}><Skeleton className="ml-auto h-5 w-16" /></td>
                    <td className={`${td} hidden md:table-cell`}><Skeleton className="ml-auto h-3.5 w-20" /></td>
                    <td className={`${td} hidden lg:table-cell`}><Skeleton className="ml-auto h-3.5 w-24" /></td>
                    <td className={td} />
                  </tr>
                ))
              : data.map((row) => {
                  const [name, code, color] = row.stockName ?? ['', row.icon, '']
                  const chip = hexColor(color)
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      onClick={() => open(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          open(row.id)
                        }
                      }}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-raised/60 focus-visible:bg-raised/60 focus-visible:outline-none"
                      aria-label={`${name} (${code})`}
                    >
                      <td className={td}>
                        <div className="flex min-w-0 items-center gap-3">
                          <CompanyLogo code={row.icon} color={color} size="sm" />
                          <div className="min-w-0">
                            <p className="max-w-[150px] truncate sm:max-w-[260px] font-medium text-fg">{name}</p>
                            <span
                              className="mt-0.5 inline-block rounded px-1.5 py-px text-[10.5px] font-semibold tracking-wide"
                              style={{ backgroundColor: chip, color: readableOn(chip) }}
                            >
                              {code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        <Price value={row.priceLast} />
                        <div className="mt-1 text-right sm:hidden"><ChangeBadge value={row.percentage} /></div>
                      </td>
                      <td className={`${td} hidden text-right sm:table-cell`}><ChangeBadge value={row.percentage} /></td>
                      <td className={`${td} hidden md:table-cell`}><Price value={row.priceHigh} /></td>
                      <td className={`${td} hidden text-right text-[13px] text-muted lg:table-cell`}>
                        {formatDate(row.lastUpdate)}
                      </td>
                      <td className={`${td} text-right text-subtle`}>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-xs transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg"
                          aria-hidden="true"
                        />
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
        {!isLoading && data.length === 0 && (
          <EmptyState icon={faTableList} title="No companies on this page" description="Try going back to the previous page." />
        )}
      </div>

      <Pagination
        className="border-t border-line px-5 py-3"
        page={page}
        onPageChange={onPageChange}
        hasNext={data.length >= pageSize}
        disabled={isLoading}
      />
    </Card>
  )
}
