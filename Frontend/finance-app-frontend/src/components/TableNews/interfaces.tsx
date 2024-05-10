export interface NewsCompany {
    id: string
    title: string;
    author: string;
    url_image: string
    date_published: string
}
export interface TableNewsRoot{
    dataTable: NewsCompanyTable
    color:string
    page: number
    rowperPage: number
    pageChange : (init:number, end:number) => void
}
export interface NewsCompanyTable{
    data: NewsCompany[]
    num_Rows: number
}