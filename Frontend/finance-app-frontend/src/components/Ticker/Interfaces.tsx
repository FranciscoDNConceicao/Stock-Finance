
export interface propsTicker {
    isFixed:Boolean
    isLoading:Boolean
    data: TickerActionInt[] | null
}
export interface TickerActionInt{
    code:string;
    discount:number;
}

