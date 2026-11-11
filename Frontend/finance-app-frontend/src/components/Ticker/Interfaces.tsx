export interface propsTicker {
    isLoading: boolean
    data: TickerActionInt[] | null
}
export interface TickerActionInt {
    code: string;
    /** Day change as a ratio (0.0123 = +1.23%) */
    discount: number;
}
