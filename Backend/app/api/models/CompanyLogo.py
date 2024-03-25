from pydantic import BaseModel

class CompanyGraph(BaseModel):
    stockCode: list = []
