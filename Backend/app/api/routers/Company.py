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
async def getDiscount(params: CompanyLogo):
    apiAlpaca = REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)

    # Look back a week of daily bars so weekends/holidays still leave two closes to compare
    dateEnd = datetime.now() - timedelta(days=1)
    dateStart = dateEnd - timedelta(days=7)
    try:
        results = apiAlpaca.get_bars(params.stockCode, TimeFrame.Day,
                                     dateStart.strftime('%Y-%m-%d'), dateEnd.strftime('%Y-%m-%d')).df
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")
    if 'close' not in results:
        return False
    closes = results['close'].to_list()
    if len(closes) < 2 or closes[-2] <= 0:
        return False

    previousClose, lastClose = closes[-2], closes[-1]
    discount = round((lastClose - previousClose) / previousClose, 4)
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
                       .order_by(StocksTable.date.desc()).limit(2)).all()
        # Need today's and the previous close, both valid, to compute the variation
        if len(selectCodeStock) < 2 or selectCodeStock[0][1] <= 0 or selectCodeStock[1][1] <= 0:
            continue
        stockCode, stockToday = selectCodeStock[0]
        stockYesterday = selectCodeStock[1][1]

        discount = round((stockToday - stockYesterday) / stockYesterday, 4)

        response["data"].append({
            'code': stockCode,
            'discount': discount,
        })

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
        response = requests.get(api_url, headers={'X-Api-Key': settings.API_NINJA_KEY}, timeout=10)
        logos = response.json()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Logo service unavailable")
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")

    # On errors (bad key, rate limit) API Ninjas returns a dict instead of a list
    if isinstance(logos, list) and logos and logos[0].get('image'):
        return logos[0]['image']
    return ' '
