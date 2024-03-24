import requests
from fastapi import APIRouter, HTTPException
from app.api.models.SearchStocksValueTime import SearchStocksValue
from alpaca_trade_api import REST, TimeFrameUnit
import asyncio
import aiohttp
from datetime import datetime, timedelta
from alpaca_trade_api import TimeFrame
from fastapi import APIRouter

RouterDatetimeStocksServices = APIRouter()
@RouterDatetimeStocksServices.post("/stock/get/")
async def getStocksDataForDay(params:SearchStocksValue):
    api_alpaca = REST(key_id="PKWD0U5VC3Z0XB7QA09E", secret_key="SDs8F7vW2b1cyKWSqDLj3TJWwa5111FzbVH8RuAg")

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

        #Request to Alpaca API to get all stock information
        request = api_alpaca.get_bars(code_stock, timeframe, date_end.strftime('%Y-%m-%d'), date_begin.strftime('%Y-%m-%d'), adjustment='raw').df
        return request['close'].to_dict()
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")
