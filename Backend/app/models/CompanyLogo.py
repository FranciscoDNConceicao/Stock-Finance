from pydantic import BaseModel

class CompanyLogo(BaseModel):
    stockCode: str

class LimitRandom(BaseModel):
    limit : int


class StockCode(BaseModel):
    code: str

class DataGridPagination(BaseModel):
    initPage: int
    endPage: int