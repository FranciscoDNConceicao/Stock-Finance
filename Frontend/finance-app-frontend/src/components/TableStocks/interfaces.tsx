import { GridRowParams, GridRowsProp } from "@mui/x-data-grid";

export interface TableStocksProps {
    rows: GridRowsProp | null;
    actionNextPage: (initPage: number, endPage:number) => void
    rowClicked: (params : GridRowParams) => void;
}