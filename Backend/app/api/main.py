from fastapi import APIRouter
from app.api.routers import Company, News, Stocks

api_router = APIRouter()
api_router.include_router(Company.router, prefix="/company", tags=['company'])
api_router.include_router(News.router, prefix="/news", tags=['news'])
api_router.include_router(Stocks.router, prefix="/stocks", tags=['stocks'])
