import math
import random
from datetime import datetime, timedelta

import requests
from fastapi import APIRouter
from sqlalchemy import func

from app.database import SessionLocal
from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.CompanyLogo import LimitRandom, PaginationNewsCompanyTable, NewsCompanyDataSetRelated
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.News.Publisher.Publisher import PublisherTable

from sqlalchemy import *


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

@router.post('/get/related/company')
async def getRelatedNews(data : NewsCompanyDataSetRelated,session: Session = Depends(get_db)):
    result = {
        data.label: []
    }
    companiesIds = data.companies
    numIdsCompanies = len(data.companies)
    if numIdsCompanies > data.limit:
        companiesIds = random.sample(companiesIds, data.limit)

    if len(companiesIds) == 0:
        numCompanies = 1
    else:
        numCompanies = len(companiesIds)
    chooseNewsPerCompanies = math.floor(data.limit / numCompanies)

    idsUsed = [str(data.id)]

    for companyId in companiesIds:
        if 'id' in companyId:
            queryNewsCompanies = (session.query(NewsTable.id,
                                                NewsTable.image_url,
                                                NewsTable.title,
                                                NewsTable.author,
                                                NewsTable.date_published)
                                  .join(NewsCompanyTable, NewsCompanyTable.news_id == NewsTable.id)
                                  .filter(
                                        and_(
                                            NewsCompanyTable.company_id == int(companyId['id']),
                                            NewsCompanyTable.news_id.notin_(idsUsed)
                                        )
                                  )
                                  .limit(chooseNewsPerCompanies))

        else:
            queryNewsCompanies = (session.query(NewsTable.id,
                                                NewsTable.image_url,
                                                NewsTable.title,
                                                NewsTable.author,
                                                NewsTable.date_published)
                                  .join(NewsCompanyTable, NewsCompanyTable.news_id == NewsTable.id)
                                  .filter(NewsCompanyTable.news_id.notin_(idsUsed))
                                  .limit(chooseNewsPerCompanies))
        for queryNewsCompany in queryNewsCompanies:
            idsUsed.append(queryNewsCompany[0])
            result[data.label].append({
                'id': queryNewsCompany[0],
                'Image': queryNewsCompany[1],
                'Description': queryNewsCompany[2],
                'Publisher': queryNewsCompany[3],
                'Date': queryNewsCompany[4]
            })

    return result

@router.get('/get/all/{id}')
async def getAllValuesFromNews(id: str, session: Session = Depends(get_db)):
    result = {}
    queryNews = (session.query(NewsTable.title,
                               NewsTable.description,
                               NewsTable.author,
                               NewsTable.article_url,
                               NewsTable.date_published,
                               NewsTable.image_url,
                               PublisherTable.id,
                               PublisherTable.name,
                               PublisherTable.url,
                               PublisherTable.logo_url
                               ).join(PublisherTable, PublisherTable.id == NewsTable.publisher_id
                                      ).filter(NewsTable.id == id))

    for queryNewsResult in queryNews:
        result = {
            'title': queryNewsResult[0],
            'description': queryNewsResult[1],
            'author': queryNewsResult[2],
            'article_url': queryNewsResult[3],
            'date_published': queryNewsResult[4],
            'image_url': queryNewsResult[5],
            'publisher': {
                'id': queryNewsResult[6],
                'name': queryNewsResult[7],
                'url': queryNewsResult[8],
                'logo_url': queryNewsResult[9]
            },
            'Companies': []
        }
    if result:
        queryNewsCompanies = (session.query(CompanyTable.id,
                                            CompanyTable.code,
                                            CompanyTable.color)
                              .join(NewsCompanyTable, CompanyTable.id == NewsCompanyTable.company_id)
                              .filter(NewsCompanyTable.news_id == int(id)))

        for queryNewsCompaniesResult in queryNewsCompanies:
            result['Companies'].append({
                'id': queryNewsCompaniesResult[0],
                'code': queryNewsCompaniesResult[1],
                'color': queryNewsCompaniesResult[2],
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
                                         NewsTable.date_published,
                                         NewsTable.id)
    .join(PublisherTable, PublisherTable.id == NewsTable.publisher_id)
    .filter(func.date(NewsTable.date_published) == dateNow).order_by(func.random()).limit(
        limit.limit))
    for selectedNewThisDay in selectedNewsThisDay:
        data['This day'].append({
            'id': str(selectedNewThisDay[4]),
            'Image': selectedNewThisDay[1],
            'Description': selectedNewThisDay[0],
            'Publisher': selectedNewThisDay[2],
            'Date': selectedNewThisDay[3]
        })

    selectedNewsThisWeek = (session.query(NewsTable.title,
                                          NewsTable.image_url,
                                          PublisherTable.name,
                                          NewsTable.date_published,
                                          NewsTable.id)
                            .join(PublisherTable, NewsTable.publisher_id == PublisherTable.id)
                            .filter(func.date(NewsTable.date_published) <= dateNow,
                                    func.date(NewsTable.date_published) >= dateWeekBefore)
                            .order_by(func.random())
                            .limit(limit.limit))
    for selectedNewsThisWeek in selectedNewsThisWeek:
        data['This week'].append({
            'id': str(selectedNewsThisWeek[4]),
            'Image': selectedNewsThisWeek[1],
            'Description': selectedNewsThisWeek[0],
            'Publisher': selectedNewsThisWeek[2],
            'Date': selectedNewsThisWeek[3]
        })
    selectedNewsThisYear = (session.query(NewsTable.title,
                                          NewsTable.image_url,
                                          PublisherTable.name,
                                          NewsTable.date_published,
                                          NewsTable.id)
                            .join(PublisherTable, NewsTable.publisher_id == PublisherTable.id)
                            .filter(func.date(NewsTable.date_published) <= dateNow,
                                    func.date(NewsTable.date_published) >= dateYearBefore)
                            .order_by(func.random())
                            .limit(limit.limit))
    for selectedNewThisYear in selectedNewsThisYear:
        data['This year'].append({
            'id': str(selectedNewThisYear[4]),
            'Image': selectedNewThisYear[1],
            'Description': selectedNewThisYear[0],
            'Publisher': selectedNewThisYear[2],
            'Date': selectedNewThisYear[3]
        })

    return data
