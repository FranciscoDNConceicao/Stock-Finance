/** Row returned by POST /stock/select/StockForDataGrid */
export interface StockRow {
    id: string | number;
    icon: string;
    /** [name, code, color] */
    stockName: [string, string, string];
    unit: string;
    /** [price, currency] */
    priceLast: [string, string];
    /** Ratio vs previous close (0.01 = +1%) */
    percentage: number;
    /** [price, currency] */
    priceHigh: [string, string];
    lastUpdate: string;
}

export interface TableStocksProps {
    rows: StockRow[] | null;
    isLoading: boolean;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
