export interface NewsCompany {
    id: string
    title: string;
    author: string;
    url_image: string
    date_published: string
}
export interface TableNewsRoot {
    dataTable: NewsCompanyTable
    page: number
    rowsPerPage: number
    isLoading: boolean
    onPageChange: (page: number) => void
}
export interface NewsCompanyTable {
    data: NewsCompany[]
    num_Rows: number
}
