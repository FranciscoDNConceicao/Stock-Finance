import { faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { TableNewsRoot } from './interfaces'
import { Card, CardHeader } from '../ui/Card'
import Pagination from '../ui/Pagination'
import EmptyState from '../ui/EmptyState'
import { NewsListItem, NewsListSkeleton } from '../SeparatorInfo/SeparatorInfo'

export default function TableNews({ dataTable, page, rowsPerPage, isLoading, onPageChange }: TableNewsRoot) {
  const total = dataTable.num_Rows ?? 0
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))

  return (
    <Card>
      <CardHeader
        title="Latest news"
        description={total > 0 ? `${total} articles mention this company` : undefined}
      />
      <div className="px-5 pb-2 pt-3">
        {isLoading ? (
          <NewsListSkeleton rows={4} />
        ) : dataTable.data.length === 0 ? (
          <EmptyState icon={faNewspaper} title="No news for this company" />
        ) : (
          <ul className="space-y-1 animate-fade-in">
            {dataTable.data.map((row) => (
              <NewsListItem
                key={row.id}
                item={{
                  id: row.id,
                  Image: row.url_image,
                  Description: row.title,
                  Publisher: row.author,
                  Date: row.date_published,
                }}
              />
            ))}
          </ul>
        )}
      </div>
      {total > rowsPerPage && (
        <Pagination
          className="border-t border-line px-5 py-3"
          page={page}
          totalPages={totalPages}
          hasNext={page + 1 < totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
        />
      )}
    </Card>
  )
}
