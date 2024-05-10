from datetime import datetime, timedelta

import requests
from fastapi import APIRouter
from sqlalchemy import func

from app.database import SessionLocal
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.CompanyLogo import LimitRandom, PaginationNewsCompanyTable
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
async def getNewsPerCompany(data: PaginationNewsCompanyTable, session: Session = Depends(get_db)):
    initPage = data.initPage
    endPage = data.endPage
    id = data.id
    result = {'data': [],
              'num_Rows': session.query(func.count(NewsTable.id)).join(NewsCompanyTable,
                                                                       NewsTable.id == NewsCompanyTable.id).filter(
                  NewsCompanyTable.company_id == id).scalar()}
    selectedNewsCompany = (session.query(NewsTable.id,
                                         NewsTable.title,
                                         NewsTable.image_url,
                                         NewsTable.author,
                                         NewsTable.date_published).join(NewsCompanyTable,
                                                                        NewsTable.id == NewsCompanyTable.id)
                           .filter(NewsCompanyTable.company_id == id).order_by(NewsTable.date_published.desc()).slice(
        initPage, endPage))

    for selectedNewCompany in selectedNewsCompany:
        result['data'].append({
            'id': selectedNewCompany[0],
            'title': selectedNewCompany[1],
            'url_image': selectedNewCompany[2],
            'author': selectedNewCompany[3],
            'date_published': selectedNewCompany[4]
        })

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
