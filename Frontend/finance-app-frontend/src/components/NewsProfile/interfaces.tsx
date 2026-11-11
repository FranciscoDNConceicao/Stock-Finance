import type { NewsArticle, NewsSections } from '../../api/types'

export interface NewsMainProps {
    /** Undefined while loading */
    data: NewsArticle | undefined;
    isLoading: boolean;
    newsRelated: NewsSections;
    relatedLoading: boolean;
}
