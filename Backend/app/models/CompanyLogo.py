from pydantic import BaseModel

class CompanyLogo(BaseModel):
    stockCode: str

class LimitRandom(BaseModel):
    limit : int