from fastapi import APIRouter

from app.api.routers import Auth, Company, Health, News, Search, Stocks, Wallet, Watchlist

api_router = APIRouter()
api_router.include_router(Health.router, tags=["health"])
api_router.include_router(Auth.router, prefix="/auth", tags=["auth"])
# Before Company so /companies/search is not taken for a company id
api_router.include_router(Search.router, prefix="/companies", tags=["companies"])
api_router.include_router(Company.router, prefix="/companies", tags=["companies"])
api_router.include_router(News.router, prefix="/news", tags=["news"])
api_router.include_router(Stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(Wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(Watchlist.router, prefix="/watchlist", tags=["watchlist"])
