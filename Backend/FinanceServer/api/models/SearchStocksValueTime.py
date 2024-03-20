from pydantic import BaseModel

class SearchStocksValue(BaseModel):
    stockCode: str
