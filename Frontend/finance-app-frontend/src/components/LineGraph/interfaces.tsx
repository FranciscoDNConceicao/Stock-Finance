export interface StockImage {
    code: string;
    id:string
  }
export interface LineGraphProps {
    data: DataGraph;
    changingTimeCateg: (TimeCateg: string, Stock:string) => void;
    isLoading: boolean
    categProp: StockImage[]
    hasChoosingCategory: boolean
    extendedVersion: boolean
    timeStampInitial: string
}
export interface DataGraph {
    company_data: CompanyData | null;
}
export interface CompanyData {
    [timestamp: string]: string;
}

export interface TimeChangedGraphProps{
    changingTimeCateg: (TimeCateg: string) => void;
    initialTimeStamp: string
}

