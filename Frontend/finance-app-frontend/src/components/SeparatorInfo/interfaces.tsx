import type { NewsSections } from '../../api/types'

export interface SeparatorInfoProps {
    Data: NewsSections;
    categorieSelected: string;
    isLoading?: boolean;
    className?: string;
}
