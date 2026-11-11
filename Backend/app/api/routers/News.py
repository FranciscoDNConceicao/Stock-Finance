import random
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.News.Publisher.Publisher import PublisherTable
from app.models.Responses import CompanySummary, NewsArticle, NewsItem, NewsSections, Publisher

router = APIRouter()

NOT_FOUND = {404: {"description": "News not found"}}

# Section label -> how far back from the most recent news it reaches
SECTIONS = {
    "This day": timedelta(0),
    "This week": timedelta(weeks=1),
    "This year": timedelta(weeks=54),
}


def _random_news(session: Session, since: date, until: date, limit: int) -> list[NewsItem]:
    # The random pick runs on ids only, inside the date window (indexed on date_published);
    # the full rows are fetched afterwards for the `limit` picked ids.
    picked = (
        select(NewsTable.id)
        .where(NewsTable.date_published.between(since, until), NewsTable.publisher_id.is_not(None))
        .order_by(func.random())
        .limit(limit)
        .subquery()
    )
    rows = session.execute(
        select(
            NewsTable.id,
            NewsTable.image_url,
            NewsTable.title,
            PublisherTable.name.label("publisher"),
            NewsTable.date_published,
        )
        .join(picked, picked.c.id == NewsTable.id)
        .join(PublisherTable, PublisherTable.id == NewsTable.publisher_id)
    ).all()
    return [
        NewsItem(
            id=str(row.id),
            image_url=row.image_url,
            title=row.title,
            publisher=row.publisher,
            date_published=row.date_published,
        )
        for row in rows
    ]


@router.get("/highlights", response_model=NewsSections)
def news_highlights(limit: int = Query(6, ge=1, le=50), session: Session = Depends(get_db)):
    """Random news from the last day, week and year, each section with up to `limit` items."""
    # Anchor on the most recent news, so the sections aren't empty just because the data
    # was loaded a few days ago
    anchor = session.scalar(select(func.max(NewsTable.date_published))) or date.today()
    return {label: _random_news(session, anchor - span, anchor, limit) for label, span in SECTIONS.items()}


@router.get("/{news_id}", response_model=NewsArticle, responses=NOT_FOUND)
def news_article(news_id: int, session: Session = Depends(get_db)):
    row = session.execute(
        select(NewsTable, PublisherTable)
        .join(PublisherTable, PublisherTable.id == NewsTable.publisher_id)
        .where(NewsTable.id == news_id)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="News not found")
    news, publisher = row

    companies = session.execute(
        select(CompanyTable.id, CompanyTable.code, CompanyTable.color)
        .join(NewsCompanyTable, NewsCompanyTable.company_id == CompanyTable.id)
        .where(NewsCompanyTable.news_id == news_id)
    ).all()
    return NewsArticle(
        title=news.title,
        description=news.description,
        author=news.author,
        article_url=news.article_url,
        date_published=news.date_published,
        image_url=news.image_url,
        publisher=Publisher.model_validate(publisher),
        companies=[CompanySummary.model_validate(company) for company in companies],
    )


@router.get("/{news_id}/related", response_model=list[NewsItem], responses=NOT_FOUND)
def related_news(news_id: int, limit: int = Query(10, ge=1, le=50), session: Session = Depends(get_db)):
    """Recent news about the same companies, split evenly between them (at most `limit` companies)."""
    if session.get(NewsTable, news_id) is None:
        raise HTTPException(status_code=404, detail="News not found")

    company_ids = session.scalars(select(NewsCompanyTable.company_id).where(NewsCompanyTable.news_id == news_id)).all()
    if not company_ids:
        return []
    if len(company_ids) > limit:
        company_ids = random.sample(company_ids, limit)
    per_company = limit // len(company_ids)

    # Each company's most recent news in one query (ROW_NUMBER), instead of one query per company.
    # `limit` candidates per company leave room for news already picked for an earlier company.
    ranked = (
        select(
            NewsCompanyTable.company_id,
            NewsTable.id,
            NewsTable.image_url,
            NewsTable.title,
            NewsTable.author,
            NewsTable.date_published,
            func.row_number()
            .over(
                partition_by=NewsCompanyTable.company_id,
                order_by=(NewsTable.date_published.desc(), NewsTable.id.desc()),
            )
            .label("rn"),
        )
        .join(NewsTable, NewsTable.id == NewsCompanyTable.news_id)
        .where(NewsCompanyTable.company_id.in_(company_ids), NewsTable.id != news_id)
        .subquery()
    )
    rows = session.execute(select(ranked).where(ranked.c.rn <= limit).order_by(ranked.c.company_id, ranked.c.rn)).all()

    picked: list[NewsItem] = []
    seen: set[int] = set()
    taken: dict[int, int] = {}
    for row in rows:
        if row.id in seen or taken.get(row.company_id, 0) >= per_company:
            continue
        seen.add(row.id)
        taken[row.company_id] = taken.get(row.company_id, 0) + 1
        picked.append(
            NewsItem(
                id=str(row.id),
                image_url=row.image_url,
                title=row.title,
                # Related cards show the author where the dashboard shows the publisher
                publisher=row.author,
                date_published=row.date_published,
            )
        )
    return picked
