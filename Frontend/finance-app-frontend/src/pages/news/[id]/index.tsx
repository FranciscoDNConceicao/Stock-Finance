import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import NewsProfile from '../../../components/NewsProfile'
import { Card } from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import { Link, useParams } from '../../../router'
import { RELATED_NEWS_LABEL, useNewsArticle, useRelatedNews } from '../../../api/queries'

const NO_RELATED = { [RELATED_NEWS_LABEL]: [] }

export default function NewsPage() {
  const { id } = useParams('/news/:id')
  const articleQuery = useNewsArticle(id)
  const article = articleQuery.data
  const relatedQuery = useRelatedNews(id, article?.Companies)
  // Related news only loads when the article mentions companies
  const relatedLoading = articleQuery.isPending || (!!article?.Companies.length && relatedQuery.isPending)

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" aria-hidden="true" />
        Dashboard
      </Link>

      {!articleQuery.isPending && !article ? (
        <Card className="mx-auto max-w-lg">
          <EmptyState icon={faNewspaper} title="Article not found" description="We couldn't load this article. It may have been removed." />
        </Card>
      ) : (
        <NewsProfile
          key={id}
          data={article}
          isLoading={articleQuery.isPending}
          newsRelated={relatedQuery.data ?? NO_RELATED}
          relatedLoading={relatedLoading}
        />
      )}
    </div>
  )
}
