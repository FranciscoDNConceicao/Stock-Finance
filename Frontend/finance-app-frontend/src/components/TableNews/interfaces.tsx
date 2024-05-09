export interface NewsCompany {
    id: string
    title: string;
    author: string;
    url_image: string
}
export interface TableNewsRoot{
    data: NewsCompany[]
    color:string
    CountRows: number
    page: number
    rowperPage: number
    pageChange : (init:number, end:number) => void
}