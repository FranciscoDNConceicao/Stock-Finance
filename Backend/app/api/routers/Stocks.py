from fastapi import HTTPException
from sqlalchemy import func
from app.models.CompanyLogo import StockCode, DataGridPagination
from app.database import SessionLocal
from app.models.Stocks.Stocks import StocksTable
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

@router.post("/select/StockForDataGrid")
async def getSelectedStockForDataGrid(params:DataGridPagination, session: Session = Depends(get_db)):

    data = []

    Initpage = params.initPage
    Endlimit = params.endPage

    subquery = (session.query(StocksTable.id)
                .filter(StocksTable.company_id == Company.id)
                .order_by(StocksTable.date.desc())
                .limit(1)
                .correlate(Company).as_scalar())

    selectCodes = (session.query(Company.id, Company.code, Company.name, Company.currency_name, StocksTable.value, StocksTable.date, Company.high_max)
                            .join(StocksTable, StocksTable.id == subquery)
                            .order_by(Company.high_max.desc(), StocksTable.date.desc())
                            .slice(Initpage, Endlimit))

    for code in selectCodes:
        discount = 0
        getLastValue = (session.query(StocksTable.value)
                       .filter(StocksTable.date < code[5])
                       .order_by(StocksTable.date.desc()).limit(1))[0]
        if getLastValue and selectCodes:
            discount = round((code[4] - getLastValue[0]) / getLastValue[0],2)

        data.append({
            'id': code[0],
            'icon': code[1],
            'stockName': code[2],
            'code': code[1],
            'unit': code[3],
            'priceLast': code[4],
            'percentage': discount,
            'priceHigh': code[6],
            'lastUpdate': code[5]
        })

    return data