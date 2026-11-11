import { useState } from 'react'
import { faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { Link } from '../../router'
import { cn, formatDate } from '../../scripts/utils'
import noImage from '../../assets/images/noImage.png'
import SegmentedControl from '../ui/SegmentedControl'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

function NewsThumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={!src || failed ? noImage : src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-16 w-24 shrink-0 rounded-lg bg-raised object-cover ring-1 ring-line"
    />
  )
}

export function NewsListItem({ item }: { item: NewsItem }) {
  return (
    <li>
      <Link
        to="/news/:id"
        params={{ id: item.id.toString() }}
        className="group -mx-2 flex cursor-pointer gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-raised"
      >
        <NewsThumb src={item.Image} />
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-fg group-hover:text-accent-hover">
            {item.Description}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-subtle">
            <span className="truncate">{item.Publisher}</span>
            {item.Date && (
              <>
                <span aria-hidden="true">·</span>
                <time className="shrink-0" dateTime={item.Date}>{formatDate(item.Date)}</time>
              </>
            )}
          </p>
        </div>
      </Link>
    </li>
  )
}

export function NewsListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-1" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-3 py-2">
          <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Tabbed news list. Each key of `Data` is a tab (e.g. "This day", "This week"). */
export default function SeparatorInfo({ Data, categorieSelected, isLoading, className }: SeparatorInfo) {
  const categories = Object.keys(Data ?? {})
  const [selected, setActive] = useState(categorieSelected)
  const active = categories.includes(selected) ? selected : categories[0] ?? ''
  const items = Data?.[active] ?? []

  return (
    <div className={cn('flex flex-col', className)}>
      {categories.length > 1 && (
        <SegmentedControl
          label="News period"
          options={categories}
          value={active}
          onChange={setActive}
          className="mb-3 self-start"
        />
      )}
      {isLoading ? (
        <NewsListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={faNewspaper} title="No news yet" description="Check back later for new stories." />
      ) : (
        <ul className="space-y-1 animate-fade-in">
          {items.map((item) => (
            <NewsListItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
