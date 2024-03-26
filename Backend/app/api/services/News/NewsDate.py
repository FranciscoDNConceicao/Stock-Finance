import requests
from fastapi import APIRouter

from app.api.models.News.DateNews import DateNews

NewsDateRouter = APIRouter()
@NewsDateRouter.post("/news/date/get/")
async def getCompanyImage(params:DateNews):
    date = params.date
    limit = params.limit_news
