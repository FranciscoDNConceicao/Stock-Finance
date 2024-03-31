from fastapi import FastAPI
import uvicorn
import app.api.services.Stocks.datetimeStocksServices as serviceStockDate
from fastapi.middleware.cors import CORSMiddleware
import app.api.services.Stocks.companyLogo as companyLogoService
from sqlalchemy import create_engine
from const import headers
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()
app.include_router(serviceStockDate.RouterDatetimeStocksServices)
app.include_router(companyLogoService.RouterCompanyLogo)

origins = [
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
engine = create_engine(
    headers['SQL_ALCHEMY_DATABASE_URL'], connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


if __name__ == "__main__":
    Base = declarative_base()
    uvicorn.run(app)