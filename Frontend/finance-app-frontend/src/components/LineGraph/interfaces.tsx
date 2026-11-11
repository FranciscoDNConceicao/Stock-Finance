export interface StockImage {
    code: string;
    id: string
}
export interface DataGraph {
    company_data: CompanyData | null;
}
export interface CompanyData {
    [timestamp: string]: string;
}

export const TIME_RANGES = ['1D', '1W', '1M', '1Y', '3Y'] as const
export type TimeRange = typeof TIME_RANGES[number]

export interface ChartStats {
    first: number
    last: number
    high: number
    low: number
    change: number
    /** Ratio, e.g. 0.0123 */
    changePct: number
}
