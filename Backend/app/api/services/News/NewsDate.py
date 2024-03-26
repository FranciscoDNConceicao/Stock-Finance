import requests
from fastapi import APIRouter

NewsDateRouter = APIRouter()
@NewsDateRouter.post("/news/date/get/")
async def getCompanyImage(params:DateNews):
    date = params.date
    limit =
