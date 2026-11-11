import type { components, operations } from './schema'

type Schemas = components['schemas']

export type CompanySummary = Schemas['CompanySummary']
export type CompanyDetails = Schemas['CompanyDetails']
export type TickerItem = Schemas['TickerItem']
export type NewsItem = Schemas['NewsItem']
export type NewsArticle = Schemas['NewsArticle']
export type CompanyNewsPage = Schemas['CompanyNewsPage']
export type StockRow = Schemas['StockRow']

/** Section label ("This day", "This week", ...) -> news */
export type NewsSections = Record<string, NewsItem[]>
/** ISO timestamp -> close price */
export type PriceHistory = Record<string, number>

type PriceHistoryQuery = NonNullable<operations['price_history_stocks__code__get']['parameters']['query']>
export const TIME_RANGES = ['1D', '1W', '1M', '1Y', '3Y'] as const satisfies readonly NonNullable<PriceHistoryQuery['range']>[]
export type TimeRange = (typeof TIME_RANGES)[number]
