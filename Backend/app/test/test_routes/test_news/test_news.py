from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.News.Publisher.Publisher import PublisherTable
from app.test.main_test import client, count_queries


def test_news_article(session: Session):
    publisher_id = session.scalar(select(PublisherTable.id).limit(1))

    news_value = NewsTable(
        id=99999999,
        publisher_id=publisher_id,
        title="LAST NEWS Elon musk just announce this",
        description="Elon musk just bought twitter and moved to X",
        author="Me",
        article_url="bbc.com",
        date_published="2024-06-11",
        image_url="example.jpg",
    )
    session.add(news_value)
    session.flush()

    response = client.get(f"/news/{news_value.id}")
    news_response = response.json()

    assert response.status_code == 200
    assert news_response["title"] == news_value.title
    assert news_response["author"] == news_value.author
    assert news_response["description"] == news_value.description
    assert news_response["article_url"] == news_value.article_url
    assert news_response["image_url"] == news_value.image_url
    assert news_response["date_published"] == news_value.date_published
    assert news_response["publisher"]["id"] == publisher_id
    assert news_response["Companies"] == []


def test_news_article_not_found():
    assert client.get("/news/987654321").status_code == 404


def test_related_news(session: Session):
    # A news item linked to at least two companies
    linked = (
        select(NewsCompanyTable.news_id)
        .group_by(NewsCompanyTable.news_id)
        .having(func.count(NewsCompanyTable.company_id) >= 2)
        .limit(1)
    )
    news_id = session.scalar(linked)
    assert news_id is not None, "needs a news item linked to two companies in the database"

    with count_queries() as queries:
        response = client.get(f"/news/{news_id}/related", params={"limit": 10})
    assert response.status_code == 200
    related = response.json()
    assert 0 < len(related) <= 10
    ids = [item["id"] for item in related]
    assert len(ids) == len(set(ids))
    assert str(news_id) not in ids
    for item in related:
        assert {"id", "Image", "Description", "Publisher", "Date"} <= item.keys()
    # existence check + companies + one query for every company's news (no query per company)
    assert len(queries) == 3

    assert client.get("/news/987654321/related").status_code == 404


def test_news_highlights():
    for limit in (10, 5):
        response = client.get("/news/highlights", params={"limit": limit})
        news_separated = response.json()

        assert response.status_code == 200
        assert set(news_separated) == {"This day", "This week", "This year"}
        for items in news_separated.values():
            assert len(items) <= limit
            for item in items:
                assert {"id", "Image", "Description", "Publisher", "Date"} <= item.keys()
        assert len(news_separated["This year"]) == limit

    assert client.get("/news/highlights", params={"limit": 0}).status_code == 422
