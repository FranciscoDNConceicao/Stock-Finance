import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import NewsProfile from '../../../components/NewsProfile'
import { DataNews } from '../../../components/NewsProfile/interfaces'
import { Card } from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import { Link, useParams } from '../../../router'
import { getAllValuesOfNews } from '../../../scripts/News/SeparatorInfoNews'
import { POST } from '../../../scripts/axios'

export default function NewsPage() {
  const { id } = useParams('/news/:id')
  const [data, setData] = useState<DataNews | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [related, setRelated] = useState<NewsData>({ 'Related News': [] })
  const [relatedLoading, setRelatedLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setRelatedLoading(true)
    setRelated({ 'Related News': [] })

    getAllValuesOfNews(String(id))
      .then(async (res) => {
        if (!active) return
        const article = res?.data ?? null
        setData(article)
        setIsLoading(false)

        if (!article || article.Companies.length === 0) return
        const relatedNews = (await POST('http://127.0.0.1:8000/news/get/related/company', {
          id,
          companies: article.Companies,
          limit: 10,
          label: 'Related News',
        })) as NewsData
        if (active) setRelated(relatedNews ?? { 'Related News': [] })
      })
      .catch(() => {
        if (active) setData(null)
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
          setRelatedLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" aria-hidden="true" />
        Dashboard
      </Link>

      {!isLoading && !data ? (
        <Card className="mx-auto max-w-lg">
          <EmptyState icon={faNewspaper} title="Article not found" description="We couldn't load this article. It may have been removed." />
        </Card>
      ) : (
        <NewsProfile
          key={id}
          data={data ?? emptyArticle}
          isLoading={isLoading}
          newsRelated={related}
          relatedLoading={relatedLoading}
        />
      )}
    </div>
  )
}

const emptyArticle: DataNews = {
  Companies: [],
  article_url: '',
  author: '',
  date_published: '',
  description: '',
  image_url: '',
  publisher: { logo_url: '', name: '', url: '' },
  title: '',
}
