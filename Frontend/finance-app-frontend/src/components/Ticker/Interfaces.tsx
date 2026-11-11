import type { TickerItem } from '../../api/types'

export type TickerActionInt = TickerItem

export interface propsTicker {
    isLoading: boolean
    data: TickerActionInt[] | null
}
