from pydantic import BaseModel

class DateNews(BaseModel):
    date: str
    limit_news: int

