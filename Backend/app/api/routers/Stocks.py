from fastapi import HTTPException
from sqlalchemy import func

from app.models.CompanyLogo import StockCode
from app.database import SessionLocal
from app.settings import settings
from app.models.SearchStocksValueTime import SearchStocksValue
from alpaca_trade_api import REST, TimeFrameUnit
from datetime import datetime, timedelta
from alpaca_trade_api import TimeFrame
from sqlalchemy.orm import Session
from fastapi import APIRouter
from fastapi import HTTPException, Depends
from app.models.Company.Company import CompanyTable as Company


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/get/")
async def getStocksDataForDay(params:SearchStocksValue):
    api_alpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    #Stocks Code
    code_stock = params.stockCode
    time = params.time
    date_begin = datetime.now() - timedelta(days=2)

    if time == '1D':
        timeframe = TimeFrame.Hour
        date_end = date_begin - timedelta(days=1)
    elif time == '1W':
        timeframe = TimeFrame(12, TimeFrameUnit.Hour )
        date_end = date_begin - timedelta(weeks=1)

    elif time == '1M':
        timeframe = TimeFrame.Day
        date_end = date_begin - timedelta(days=30)
    elif time == '3M':
        timeframe = TimeFrame.Week
        date_end = date_begin - timedelta(days=60)
    elif time == '1Y':
        timeframe = TimeFrame.Month
        date_end = date_begin - timedelta(weeks=54)
    elif time == '3Y':
        timeframe = TimeFrame.Month
        date_end = date_begin - timedelta(weeks=(54*3))
    try:
        request = api_alpaca.get_bars(code_stock, timeframe, date_end.strftime('%Y-%m-%d'), date_begin.strftime('%Y-%m-%d'), adjustment='raw').df
        return request['close'].to_dict()
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")

@router.get("/select/StocksForDataGrid")
async def getSelectedStockForDataGrid(params:StockCode, session: Session = Depends(get_db)):
    api_alpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    code = params.code
    selectCodes = session.query(Company.id, Company.name).filter(Company.code == code)
    for code in selectCodes:
        date_begin = datetime.now() - timedelta(days=2)
        request = api_alpaca.get_bars(code_stock, timeframe, date_end.strftime('%Y-%m-%d'),date_begin.strftime('%Y-%m-%d'), adjustment='raw').df
