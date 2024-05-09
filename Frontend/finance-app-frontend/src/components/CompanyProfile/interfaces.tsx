import { DataGraph } from "../LineGraph/interfaces";

export interface CompanyInfo{
    id: string
    name: string;
    code: string;
    description: string;
    locate: string;
    address: string;
    URL:string;
    dateList:string;
    num_employees:string;
    sicCode:string;
    highMax: string;
    currency_name: string;
    color: string;
}
export interface CompanyProfileProps{
    dataCompany: CompanyInfo|null;
    changingTimeCateg: (TimeCateg: string, Stock:string) => void;
    dataGraph: DataGraph;
    isLoading: boolean;
}
export interface LeftOrRightCompany {
    id:string,
    code:string,
    color:string
}