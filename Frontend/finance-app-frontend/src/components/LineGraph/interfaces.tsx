export interface LineGraphProps {
    data: DataGraph;
    changingTimeCateg: (TimeCateg: string) => void;
    isLoading: boolean
    changingStock: (rightOrleft:string) => void;
}
export interface CompanyData {
    [timestamp: string]: string;
}
export interface DataGraph {
    [key: string]: {
      image: string;
      company_data: CompanyData | null;
    };
}
export interface TimeChangedGraphProps{
    changingTimeCateg: (TimeCateg: string) => void;
}

