import type { CompanyNewsPage } from '../../api/types'

export type NewsCompanyTable = CompanyNewsPage

export interface TableNewsRoot {
    dataTable: NewsCompanyTable
    page: number
    rowsPerPage: number
    isLoading: boolean
    onPageChange: (page: number) => void
}
