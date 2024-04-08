import { DataGraph } from "../LineGraph/interfaces";

export interface CompanyInfo{
    name: string;
    company: string;
    description: string;
    locate: string;
    address: string;
    URL:string;
    dateList:string;
    num_employees:string;
    sicCode:string;
    highMax: string;
    currency_name: string;

}
export interface CompanyProfileProps{
    dataCompany: CompanyInfo;
    changingTimeCateg: (TimeCateg: string, Stock:string) => void;
    dataGraph: DataGraph;
    isLoading: boolean;
}