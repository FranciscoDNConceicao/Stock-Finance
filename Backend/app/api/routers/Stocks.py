from fastapi import HTTPException
from sqlalchemy import func
from app.database import get_db
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
import time

router = APIRouter()


@router.post("/get/")
async def getStocksDataForDay(params:SearchStocksValue):
    api_alpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    #Stocks Code
    code_stock = params.stockCode
    timestamp = params.time
    date_begin = datetime.now() - timedelta(days=3)

    if timestamp == '1D':
        timeframe = TimeFrame.Hour
        alternative_timeframe = '1/hour/'
        calculate_timeframe = timedelta(hours=1)
        date_end = date_begin - timedelta(days=1)
    elif timestamp == '1W':
        timeframe = TimeFrame(12, TimeFrameUnit.Hour )
        calculate_timeframe = timedelta(hours=12)
        alternative_timeframe = '12/hour/'
        date_end = date_begin - timedelta(weeks=1)
    elif timestamp == '1M':
        timeframe = TimeFrame.Day
        alternative_timeframe = '1/day/'
        calculate_timeframe = timedelta(days=1)
        date_end = date_begin - timedelta(days=30)
    elif timestamp == '3M':
        timeframe = TimeFrame.Week
        alternative_timeframe = '1/week/'
        calculate_timeframe = timedelta(days=7)
        date_end = date_begin - timedelta(days=60)
    elif timestamp == '1Y':
        timeframe = TimeFrame.Month
        alternative_timeframe = '1/month/'
        calculate_timeframe = timedelta(weeks=4)
        date_end = date_begin - timedelta(weeks=54)
    elif timestamp == '3Y':
        timeframe = TimeFrame.Month
        alternative_timeframe = '1/month/'
        calculate_timeframe = timedelta(weeks=4)
        date_end = date_begin - timedelta(weeks=(54*3))
    try:
        request = api_alpaca.get_bars(code_stock, timeframe, date_end.strftime('%Y-%m-%d'), date_begin.strftime('%Y-%m-%d'), adjustment='raw').df
        if 'close' not in request:
            url = f'https://api.polygon.io/v2/aggs/ticker/{code_stock}/range/{alternative_timeframe}{date_end.strftime('%Y-%m-%d')}/{date_begin.strftime('%Y-%m-%d')}?apiKey=p1ZovTNZa6Flx6uSxg0J64a4oDPdTdkS'
            requestData = request.get(url)
            if requestData and 'results' in requestData:
                result_dict = {}
                date_temp = date_end
                for dictResults in 'results':
                    result_dict[date_temp.isoformat()] = dictResults['c']
                    date_temp += calculate_timeframe

                return result_dict
            return
        end_time = time.time()
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

    selectCodes = (session.query(Company.id, Company.code, Company.name, Company.currency_name, StocksTable.value, StocksTable.date, Company.high_max, Company.color)
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
            'stockName': [code[2], code[1], code[7]],
            'unit': code[3],
            'priceLast': [str(round(code[4], 2) if code[4] >= 0 else '-') + '  ', code[3].upper()],
            'percentage': discount,
            'priceHigh': [str(round(code[6], 2) if code[6] >= 0 else '-') + '  ', code[3].upper()],
            'lastUpdate': code[5].strftime("%B %d, %Y")
        })

    return data