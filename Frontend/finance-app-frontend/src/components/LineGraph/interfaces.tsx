export type { CompanySummary as StockImage, PriceHistory as CompanyData, TimeRange } from '../../api/types'

export interface ChartStats {
    first: number
    last: number
    high: number
    low: number
    change: number
    /** Ratio, e.g. 0.0123 */
    changePct: number
}
