import requests
from fastapi import APIRouter
from ..models.SearchStocksValueTime import SearchStocksValue
from ....main import API_KEY_alpha_vantage

RouterDatetimeStocksServices = APIRouter()

@RouterDatetimeStocksServices.post("/stock/get/day")
async def getStocksDataForDay(params:SearchStocksValue):

    code_stock = params.stockCode
    function = 'TIME_SERIES_INTRADAY'
    timestamp = '60min'
    url = f'https://www.alphavantage.co/query?function={function}&symbol={code_stock}&interval={timestamp}&apikey={API_KEY_alpha_vantage}'
    r = requests.get(url)
    data = r.json()
    response = {}
    cont = 0
    for timestamps, values in data["Time Series (60min)"].items():
        print(timestamps, values)
        response[timestamps] = values['4. close']
        if cont == 24:
            break
        cont += 1
    return response
