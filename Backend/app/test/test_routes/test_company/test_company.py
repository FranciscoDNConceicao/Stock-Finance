from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.test.main_test import client, count_queries


def test_random_companies():
    response = client.get("/companies/random", params={"limit": 5})
    assert response.status_code == 200
    companies = response.json()
    assert len(companies) == 5
    assert len({company["id"] for company in companies}) == 5
    for company in companies:
        assert isinstance(company["id"], int)
        assert {"id", "code", "color"} <= company.keys()

    assert client.get("/companies/random", params={"limit": 0}).status_code == 422
    assert client.get("/companies/random", params={"limit": 101}).status_code == 422


def test_random_companies_skip_order_by_random():
    with count_queries() as queries:
        assert client.get("/companies/random", params={"limit": 3}).status_code == 200
    assert not any("random()" in statement for statement in queries)


def test_get_company_details(session: Session):
    new_company = CompanyTable(
        id=1222,
        code="AAA",
        name="Company Example",
        locate="portugal",
        currency_name="eur",
        address="Street Example",
        description="Company example for tests",
        list_date="2024-05-27",
        sic_code="4242",
        url="google.com",
        number_employees=1,
        high_max=31.32,
        color="ffffff",
    )

    session.add(new_company)
    session.flush()

    response = client.get("/companies/1222")
    assert response.status_code == 200
    assert response.json() == {
        "code": "AAA",
        "name": "Company Example",
        "locate": "portugal",
        "currency_name": "eur",
        "address": "Street Example",
        "description": "Company example for tests",
        "num_employees": 1,
        "URL": "google.com",
        "color": "ffffff",
        "highMax": 31.32,
        "dateList": "2024-05-27",
        "sicCode": "4242",
    }


def test_get_company_details_not_found():
    assert client.get("/companies/987654321").status_code == 404
    assert client.get("/companies/not-a-number").status_code == 422


def test_company_news(session: Session):
    number_of_news = 10
    news_count = (
        select(NewsCompanyTable.company_id, func.count(NewsCompanyTable.id).label("news_count"))
        .group_by(NewsCompanyTable.company_id)
        .subquery()
    )
    company_id = session.scalar(
        select(news_count.c.company_id).where(news_count.c.news_count >= number_of_news + 5).limit(1)
    )
    assert company_id is not None, "needs a company with at least 15 news in the database"

    first_page = client.get(f"/companies/{company_id}/news", params={"offset": 0, "limit": number_of_news})
    assert first_page.status_code == 200
    body = first_page.json()
    assert len(body["data"]) == number_of_news
    assert body["num_Rows"] >= number_of_news + 5
    for row in body["data"]:
        assert {"id", "title", "url_image", "author", "date_published"} <= row.keys()
    dates = [row["date_published"] for row in body["data"]]
    assert dates == sorted(dates, reverse=True)

    second_page = client.get(f"/companies/{company_id}/news", params={"offset": 5, "limit": 5}).json()
    assert [row["id"] for row in second_page["data"]] == [row["id"] for row in body["data"][5:10]]

    assert client.get(f"/companies/{company_id}/news", params={"limit": 0}).status_code == 422
