from datetime import datetime, timedelta

import requests
from alpaca_trade_api import REST, TimeFrame, TimeFrameUnit
from fastapi import HTTPException, Depends

from app.database import get_db
from app.models.CompanyLogo import CompanyLogo, LimitRandom
from app.models.Company.Company import CompanyTable as Company
from fastapi import APIRouter
from app.database import SessionLocal, engine
from app.models.Stocks.Stocks import StocksTable
from app.settings import settings
from sqlalchemy import select, MetaData, func
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/random")
async def getRandomCode(limit: LimitRandom, session: Session = Depends(get_db)):
    selectCodes = session.query(Company.code, Company.id).order_by(func.random()).limit(limit.limit)
    codes = [{'code': code[0], 'id': str(code[1])} for code in selectCodes]
    return codes


@router.post("/discount")
async def getDiscount(params: CompanyLogo, session: Session = Depends(get_db)):
    apiAlpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    dateToday = datetime.now() - timedelta(days=1)
    dateOneDayBefore = dateToday - timedelta(days=2)
    selectCodes = session.query(Company.code).order_by(func.random()).limit(24)
    results = apiAlpaca.get_bars(selectCodes[0], TimeFrame(23, TimeFrameUnit.Hour),
                                 dateOneDayBefore.strftime('%Y-%m-%d'), dateToday.strftime('%Y-%m-%d'), limit=2).df
    if 'close' not in results:
        return False
    results = results['close'].to_list()

    discount = round((results[1] - results[0]) / results[0], 4)
    return discount


@router.get("/ticker")
async def getCompanyTicker(session: Session = Depends(get_db)):
    response = {
        "data": []
    }
    selectCodes = session.query(Company.id).order_by(func.random()).limit(24)
    for selectCode in selectCodes:
        selectCodeStock = (session.query(Company.code, StocksTable.value)
                       .join(StocksTable, StocksTable.company_id == Company.id)
                       .filter(Company.id == selectCode[0])
                       .order_by(Company.list_date.desc()).limit(2))
        cont = True
        for selectCode in selectCodeStock:
            if cont:
                stockToday = selectCode[1]
                stockCode = selectCode[0]
                cont = False
            else:
                stockYesterday = selectCode[1]

        discount = round((stockToday - stockYesterday) / stockToday, 4)

        dict_temp = {
            'code': stockCode,
            'discount': discount,
        }
    response["data"].append(dict_temp)

    return response


@router.get("/get/random")
async def CompanyRightLeftValues(session: Session = Depends(get_db)):
    result = {}
    resultsQuery = session.query(Company.id, Company.code, Company.color).order_by(func.random()).limit(1)
    for resultQuery in resultsQuery:
        result = {
            'id': resultQuery[0],
            'code': resultQuery[1],
            'color': resultQuery[2],
        }
    return result


@router.get("/get/all/{id}")
async def CompanyAllValues(id: str, session: Session = Depends(get_db)):
    companyDict = {}
    companysSelect = session.query(Company.code, Company.name, Company.locate, Company.currency_name,
                                   Company.address, Company.description, Company.number_employees, Company.url,
                                   Company.color, Company.high_max, Company.list_date, Company.sic_code).filter(
        Company.id == int(id)).limit(1)
    for companySelect in companysSelect:
        companyDict = {
            'code': companySelect[0],
            'name': companySelect[1],
            'locate': companySelect[2],
            'currency_name': companySelect[3],
            'address': companySelect[4],
            'description': companySelect[5],
            'num_employees': companySelect[6],
            'URL': companySelect[7],
            'color': companySelect[8],
            'highMax': companySelect[9],
            'dateList': companySelect[10],
            'sicCode': companySelect[11]
        }
    return companyDict


@router.post("/logo/get/")
async def getCompanyImage(params: CompanyLogo):
    code = params.stockCode
    api_url = f'https://api.api-ninjas.com/v1/logo?ticker={code}'
    try:
        response = requests.get(api_url, headers={'X-Api-Key': settings.API_NINJA_KEY})
        if len(response.json()) > 0 and response.json()[0]['image']:
            return response.json()[0]['image']
        else:
            return ' '

    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")
