import { useState } from 'react'
import { faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons'
import { useAuth, useTransactions } from '../api/account'
import { Link } from '../router'
import SignInPrompt from '../components/Account/SignInPrompt'
import { Card } from '../components/ui/Card'
import CompanyLogo from '../components/ui/CompanyLogo'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import Skeleton from '../components/ui/Skeleton'
import { cn, formatCurrency, formatDate, formatNumber } from '../scripts/utils'

const PAGE_SIZE = 20
const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle first:pl-5 last:pr-5'
const td = 'px-4 py-3 first:pl-5 last:pr-5'

export default function MovementsPage() {
  const { isSignedIn } = useAuth()
  const [page, setPage] = useState(0)
  const transactions = useTransactions(page, PAGE_SIZE, isSignedIn)

  if (!isSignedIn) {
    return <SignInPrompt icon={faMoneyBillTransfer} title="Your movements" description="Sign in to see every buy and sell in your wallet." />
  }

  const rows = transactions.data ?? []
  const loading = transactions.isLoading
  return (
    <div className="space-y-6">
      <PageHeader title="Movements" description="Every order placed in your paper-trading wallet." />
      <Card className="overflow-hidden">
        {transactions.isError ? (
          <EmptyState icon={faMoneyBillTransfer} title="Couldn't load your movements" description="The server may be unavailable. Try again in a moment." />
        ) : !loading && rows.length === 0 && page === 0 ? (
          <EmptyState icon={faMoneyBillTransfer} title="No movements yet" description="Buy shares from a company's page and they'll show up here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg/40">
                  <tr>
                    <th scope="col" className={`${th} text-left`}>Date</th>
                    <th scope="col" className={`${th} text-left`}>Company</th>
                    <th scope="col" className={`${th} text-left`}>Type</th>
                    <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Shares</th>
                    <th scope="col" className={`${th} hidden text-right md:table-cell`}>Price</th>
                    <th scope="col" className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} className={cn(td, j === 3 && 'hidden sm:table-cell', j === 4 && 'hidden md:table-cell')}>
                              <Skeleton className="h-3.5 w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : rows.map((tx) => (
                        <tr key={tx.id} className={cn(transactions.isPlaceholderData && 'opacity-60')}>
                          <td className={`${td} whitespace-nowrap text-[13px] text-muted`}>{formatDate(tx.executed_at, true)}</td>
                          <td className={td}>
                            <Link to="/company/:id" params={{ id: String(tx.company_id) }} className="inline-flex cursor-pointer items-center gap-2.5 hover:text-accent">
                              <CompanyLogo code={tx.code} color={tx.color} size="xs" />
                              <span className="font-medium text-fg">{tx.code}</span>
                            </Link>
                          </td>
                          <td className={td}>
                            <span className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium', tx.side === 'buy' ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>
                              {tx.side === 'buy' ? 'Buy' : 'Sell'}
                            </span>
                          </td>
                          <td className={`${td} hidden text-right tabular text-fg sm:table-cell`}>{formatNumber(tx.quantity, tx.quantity % 1 ? 4 : 0)}</td>
                          <td className={`${td} hidden text-right tabular text-muted md:table-cell`}>{formatNumber(tx.price)}</td>
                          <td className={`${td} text-right font-medium tabular text-fg`}>
                            {tx.side === 'buy' ? '−' : '+'}{formatCurrency(tx.total, 'USD')}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            <Pagination
              className="border-t border-line px-5 py-3"
              page={page}
              onPageChange={setPage}
              hasNext={rows.length >= PAGE_SIZE}
              disabled={transactions.isFetching}
            />
          </>
        )}
      </Card>
    </div>
  )
}
