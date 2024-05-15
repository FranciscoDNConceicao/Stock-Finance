from pydantic import BaseModel

class CompanyLogo(BaseModel):
    stockCode: str

class LimitRandom(BaseModel):
    limit : int

class PaginationNewsCompanyTable(BaseModel):
    id : str
    initPage: int
    endPage:int
class StockCode(BaseModel):
    code: str

class DataGridPagination(BaseModel):
    initPage: int
    endPage: int


class NewsCompanyDataSetRelated(BaseModel):
    id : str
    companies: list = []
    limit: int
    label: str