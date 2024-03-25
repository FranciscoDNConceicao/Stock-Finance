export interface StockImage {
    code: string;
  }
export interface LineGraphProps {
    data: DataGraph;
    changingTimeCateg: (TimeCateg: string, Stock:string) => void;
    isLoading: boolean
    categProp: StockImage[]
}
export interface DataGraph {
    company_data: CompanyData | null;
}
export interface CompanyData {
    [timestamp: string]: string;
}

export interface TimeChangedGraphProps{
    changingTimeCateg: (TimeCateg: string) => void;
}

