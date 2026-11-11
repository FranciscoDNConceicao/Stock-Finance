import type { StockRow } from '../../api/types'

export type { StockRow }

export interface TableStocksProps {
    rows: StockRow[] | undefined;
    isLoading: boolean;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
