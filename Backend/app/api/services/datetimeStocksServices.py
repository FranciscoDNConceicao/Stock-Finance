import requests
from fastapi import APIRouter, HTTPException
from app.api.models.SearchStocksValueTime import SearchStocksValue
from app.const import headers
import asyncio
import aiohttp
from datetime import datetime, timedelta

RouterDatetimeStocksServices = APIRouter()

@RouterDatetimeStocksServices.post("/stock/get/")
async def getStocksDataForDay(params:SearchStocksValue):

    #Stocks Code
    code_stock = params.stockCode
    time = params.time
    date_begin = datetime.now() - timedelta(days=1)

    if time == '1D':
        timeframe = '1H'
        date_end = date_begin - timedelta(days=1)
    elif time == '1W':
        timeframe = '12H'
        date_end = date_begin - timedelta(weeks=1)

    elif time == '1M':
        timeframe = '1D'
        date_end = date_begin - timedelta(days=30)
    elif time == '3M':
        timeframe = '1W'
        date_end = date_begin - timedelta(days=60)
    elif time == '1Y':
        timeframe = '1M'
        date_end = date_begin - timedelta(weeks=54)
    try:
        #Request to Alpaca API to get all stock information
        url = f'https://data.alpaca.markets/v2/stocks/bars?symbols={code_stock}&timeframe={timeframe}&start={date_end.strftime('%Y-%m-%d')}&end={date_begin.strftime('%Y-%m-%d')}&limit=1000&adjustment=raw&feed=sip&sort=asc'
        r = requests.get(url, headers=headers)
        data = r.json()
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")

    response = {}
    # Organize the data
    for values in data["bars"][code_stock]:
        date = values['t'].replace('T', ' ').replace('Z', '')
        response[date] = values['c']

    return response
