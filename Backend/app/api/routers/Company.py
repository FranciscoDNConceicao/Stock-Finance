from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.sampling import random_company_ids
from app.database import get_db
from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.Responses import CompanyDetails, CompanyNewsItem, CompanyNewsPage, CompanySummary

router = APIRouter()

NOT_FOUND = {404: {"description": "Company not found"}}


@router.get("/random", response_model=list[CompanySummary])
def random_companies(limit: int = Query(20, ge=1, le=100), session: Session = Depends(get_db)):
    """Up to `limit` distinct companies in random order."""
    ids = random_company_ids(session, limit)
    if not ids:
        return []
    rows = session.execute(
        select(CompanyTable.id, CompanyTable.code, CompanyTable.color).where(CompanyTable.id.in_(ids))
    ).all()
    by_id = {row.id: row for row in rows}
    return [CompanySummary.model_validate(by_id[company_id]) for company_id in ids if company_id in by_id]


@router.get("/{company_id}", response_model=CompanyDetails, responses=NOT_FOUND)
def company_details(company_id: int, session: Session = Depends(get_db)):
    company = session.get(CompanyTable, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyDetails.model_validate(company)


@router.get("/{company_id}/news", response_model=CompanyNewsPage)
def company_news(
    company_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_db),
):
    """The company's news, most recent first, with the total for pagination."""
    total = session.scalar(
        select(func.count(NewsTable.id))
        .join(NewsCompanyTable, NewsCompanyTable.news_id == NewsTable.id)
        .where(NewsCompanyTable.company_id == company_id)
    )
    rows = session.execute(
        select(NewsTable.id, NewsTable.title, NewsTable.image_url, NewsTable.author, NewsTable.date_published)
        .join(NewsCompanyTable, NewsCompanyTable.news_id == NewsTable.id)
        .where(NewsCompanyTable.company_id == company_id)
        .order_by(NewsTable.date_published.desc(), NewsTable.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return CompanyNewsPage(data=[CompanyNewsItem.model_validate(row) for row in rows], total=total)
