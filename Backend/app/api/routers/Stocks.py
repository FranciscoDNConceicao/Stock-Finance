from datetime import datetime, timedelta, timezone

import requests
from alpaca_trade_api import REST, TimeFrame, TimeFrameUnit
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.CompanyLogo import DataGridPagination
from app.models.Company.Company import CompanyTable as Company
from app.models.SearchStocksValueTime import SearchStocksValue
from app.models.Stocks.Stocks import StocksTable
from app.settings import settings

router = APIRouter()

# range -> (Alpaca timeframe, Polygon "multiplier/timespan/", how far back to look)
TIME_RANGES = {
    '1D': (TimeFrame.Hour, '1/hour/', timedelta(days=1)),
    '1W': (TimeFrame(12, TimeFrameUnit.Hour), '12/hour/', timedelta(weeks=1)),
    '1M': (TimeFrame.Day, '1/day/', timedelta(days=30)),
    '3M': (TimeFrame.Week, '1/week/', timedelta(days=60)),
    '1Y': (TimeFrame.Month, '1/month/', timedelta(weeks=54)),
    '3Y': (TimeFrame.Month, '1/month/', timedelta(weeks=54 * 3)),
}


def getPolygonCloses(code_stock: str, polygon_timeframe: str, start: str, end: str):
    url = (f'https://api.polygon.io/v2/aggs/ticker/{code_stock}/range/'
           f'{polygon_timeframe}{start}/{end}')
    try:
        response = requests.get(url, params={'apiKey': settings.POLYGON_API_KEY}, timeout=10)
        response.raise_for_status()
        results = response.json().get('results') or []
    except (requests.RequestException, ValueError):
        return None
    if not results:
        return None
    # Polygon gives each bar's start as epoch milliseconds in 't' and the close in 'c'
    return {datetime.fromtimestamp(bar['t'] / 1000, tz=timezone.utc).isoformat(): bar['c']
            for bar in results}


@router.post("/get/")
async def getStocksDataForDay(params: SearchStocksValue):
    api_alpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    code_stock = params.stockCode
    timeframe, polygon_timeframe, lookback = TIME_RANGES[params.time]
    end_date = datetime.now() - timedelta(days=3)
    start_date = end_date - lookback
    start, end = start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

    try:
        request = api_alpaca.get_bars(code_stock, timeframe, start, end, adjustment='raw').df
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")

    if 'close' not in request:
        return getPolygonCloses(code_stock, polygon_timeframe, start, end)
    return request['close'].to_dict()


@router.post("/select/StockForDataGrid")
async def getSelectedStockForDataGrid(params: DataGridPagination, session: Session = Depends(get_db)):
    data = []
    Initpage = params.initPage
    Endlimit = params.endPage
    subquery = (session.query(StocksTable.id)
                .filter(StocksTable.company_id == Company.id)
                .order_by(StocksTable.date.desc())
                .limit(1)
                .correlate(Company).as_scalar())

    selectCodes = (session.query(Company.id, Company.code, Company.name, Company.currency_name, StocksTable.value,
                                 StocksTable.date, Company.high_max, Company.color)
                   .join(StocksTable, StocksTable.id == subquery)
                   .order_by(Company.high_max.desc(), StocksTable.date.desc())
                   .slice(Initpage, Endlimit))

    for code in selectCodes:
        discount = 0
        getLastValue = (session.query(StocksTable.value)
                        .filter(StocksTable.company_id == code[0], StocksTable.date < code[5])
                        .order_by(StocksTable.date.desc()).first())
        if getLastValue and getLastValue[0] > 0 and code[4] >= 0:
            discount = round((code[4] - getLastValue[0]) / getLastValue[0], 2)

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
