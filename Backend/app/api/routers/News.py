from datetime import datetime, timedelta

import requests
from fastapi import APIRouter
from sqlalchemy import func

from app.database import SessionLocal
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.CompanyLogo import LimitRandom
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

from app.models.News.Publisher.Publisher import PublisherTable


# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter()


@router.post('/perCompany/get')
async def getNewsPerCompany(id: str, initPage: int, endPage:int, session: Session = Depends(get_db)):
    selectedNewsCompany = (session.query(NewsTable.title,
                                         NewsTable.image_url,
                                         NewsTable.author,
                                         NewsTable.date_published).join(NewsCompanyTable,
                                                                        NewsTable.id == NewsCompanyTable.id)
                           .filter(NewsCompanyTable.company_id == id).order_by(NewsTable.date_published).slice(initPage, endPage))

    data = []
    for selectedNewCompany in selectedNewsCompany:
        data.append({
            'title': selectedNewCompany[0],
            'image_url': selectedNewCompany[1],
            'author': selectedNewCompany[2],
            'date_published': selectedNewsCompany[3]
        })
    result = {
        'data': data
    }
    return result


@router.post('/get/essential/SeparatedDate')
async def getEssentialSeparatedDateNews(limit: LimitRandom, session: Session = Depends(get_db)):
    dateNow = datetime(2024, 3, 29)
    dateWeekBefore = dateNow - timedelta(weeks=1)
    dateYearBefore = dateNow - timedelta(weeks=54)

    data = {
        'This day': [],
        'This week': [],
        'This year': []
    }
    selectedNewsThisDay = (session.query(NewsTable.title,
                                         NewsTable.image_url,
                                         PublisherTable.name,
                                         NewsTable.date_published)
                           .join(PublisherTable, PublisherTable.id == NewsTable.publisher_id)
                           .filter(func.date(NewsTable.date_published) == dateNow).order_by(func.random()).limit(
        limit.limit))
    for selectedNewThisDay in selectedNewsThisDay:
        data['This day'].append({
            'Image': selectedNewThisDay[1],
            'Description': selectedNewThisDay[0],
            'Publisher': selectedNewThisDay[2],
            'Date': selectedNewThisDay[3]
        })

    selectedNewsThisWeek = (session.query(NewsTable.title,
                                          NewsTable.image_url,
                                          PublisherTable.name,
                                          NewsTable.date_published)
                            .join(PublisherTable, NewsTable.publisher_id == PublisherTable.id)
                            .filter(func.date(NewsTable.date_published) <= dateNow,
                                    func.date(NewsTable.date_published) >= dateWeekBefore)
                            .order_by(func.random())
                            .limit(limit.limit))
    for selectedNewsThisWeek in selectedNewsThisWeek:
        data['This week'].append({
            'Image': selectedNewsThisWeek[1],
            'Description': selectedNewsThisWeek[0],
            'Publisher': selectedNewsThisWeek[2],
            'Date': selectedNewsThisWeek[3]
        })
    selectedNewsThisYear = (session.query(NewsTable.title,
                                          NewsTable.image_url,
                                          PublisherTable.name,
                                          NewsTable.date_published)
                            .join(PublisherTable, NewsTable.publisher_id == PublisherTable.id)
                            .filter(func.date(NewsTable.date_published) <= dateNow,
                                    func.date(NewsTable.date_published) >= dateYearBefore)
                            .order_by(func.random())
                            .limit(limit.limit))
    for selectedNewThisYear in selectedNewsThisYear:
        data['This year'].append({
            'Image': selectedNewThisYear[1],
            'Description': selectedNewThisYear[0],
            'Publisher': selectedNewThisYear[2],
            'Date': selectedNewThisYear[3]
        })

    return data
