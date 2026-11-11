import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { NewsMainProps } from './interfaces'
import SeparatorInfo from '../SeparatorInfo/SeparatorInfo'
import { Link } from '../../router'
import { Card, CardHeader } from '../ui/Card'
import CompanyLogo from '../ui/CompanyLogo'
import Skeleton from '../ui/Skeleton'
import { formatDate, prettyHost, safeUrl } from '../../scripts/utils'

function ArticleSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading article">
      <Card className="space-y-4 p-6 lg:col-span-2">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </Card>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function NewsProfile({ data, isLoading, newsRelated, relatedLoading }: NewsMainProps) {
  const [imageFailed, setImageFailed] = useState(false)
  if (isLoading) return <ArticleSkeleton />

  const articleUrl = safeUrl(data.article_url)
  const publisherUrl = safeUrl(data.publisher?.url)
  const relatedKey = Object.keys(newsRelated ?? {})[0] ?? 'Related News'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card as="article" className="overflow-hidden lg:col-span-2">
        <div className="p-5 sm:p-8">
          {data.Companies.length > 0 && (
            <ul className="mb-5 flex flex-wrap gap-2" aria-label="Companies mentioned">
              {data.Companies.slice(0, 12).map((company) => (
                <li key={company.id}>
                  <Link
                    to="/company/:id"
                    params={{ id: company.id.toString() }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-raised py-1 pl-1 pr-3 text-xs font-semibold text-fg transition-colors hover:border-line-strong hover:bg-line"
                  >
                    <CompanyLogo code={company.code} color={company.color} size="xs" className="!rounded-full" />
                    {company.code}
                  </Link>
                </li>
              ))}
              {data.Companies.length > 12 && (
                <li className="inline-flex items-center px-2 text-xs text-subtle">+{data.Companies.length - 12} more</li>
              )}
            </ul>
          )}

          <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-fg sm:text-[34px] sm:leading-[1.15]">
            {data.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            {data.author && <span className="font-medium text-fg">{data.author}</span>}
            {data.author && data.publisher?.name && <span aria-hidden="true">·</span>}
            {data.publisher?.name && <span>{data.publisher.name}</span>}
            {data.date_published && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={data.date_published}>{formatDate(data.date_published, true)}</time>
              </>
            )}
          </div>
        </div>

        {data.image_url && !imageFailed && (
          <img
            src={data.image_url}
            alt=""
            onError={() => setImageFailed(true)}
            className="aspect-video max-h-[480px] w-full border-y border-line bg-raised object-cover"
          />
        )}

        <div className="p-5 sm:p-8">
          {data.description ? (
            <p className="max-w-[68ch] text-[15.5px] leading-relaxed text-fg/85">{data.description}</p>
          ) : (
            <p className="text-sm text-subtle">No summary available for this article.</p>
          )}

          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
            >
              Read full article
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" aria-hidden="true" />
            </a>
          )}
        </div>
      </Card>

      <aside className="space-y-6">
        {data.publisher?.name && (
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Publisher</p>
            <div className="mt-3 flex items-center gap-3">
              {data.publisher.logo_url && (
                <div className="flex h-11 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-2">
                  <img src={data.publisher.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{data.publisher.name}</p>
                {publisherUrl && (
                  <a
                    href={publisherUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer truncate text-[13px] text-accent hover:text-accent-hover hover:underline"
                  >
                    {prettyHost(data.publisher.url)}
                  </a>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Related news" description="Other stories about these companies" />
          <div className="px-5 pb-4 pt-3">
            <SeparatorInfo Data={newsRelated} categorieSelected={relatedKey} isLoading={relatedLoading} />
          </div>
        </Card>
      </aside>
    </div>
  )
}
