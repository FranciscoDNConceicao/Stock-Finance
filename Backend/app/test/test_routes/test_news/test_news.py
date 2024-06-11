from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.News.Publisher.Publisher import PublisherTable
from app.test.main_test import client, session


def test_get_news_per_company(session: Session):
    number_of_news = 10
    subquery = session.query(NewsCompanyTable.company_id, func.count(NewsCompanyTable.id).label('news_count')
                             ).group_by(NewsCompanyTable.company_id).subquery()

    # Main query to filter companies with at least 10 news articles
    result = (session.query(CompanyTable.id, CompanyTable.code)
              .join(subquery, CompanyTable.id == subquery.c.company_id)
              .filter(subquery.c.news_count >= number_of_news)
              .order_by(func.random())
              .limit(1).all())
    idCompany = result[0][0] if result else None

    data_request = {
        'id': str(idCompany),
        'initPage': "0",
        'endPage': str(number_of_news)
    }
    response = client.post(url='/news/perCompany/get', json=data_request)

    assert response.status_code == 200
    result_json = response.json()
    if 'data' in result_json and 'num_Rows':
        assert len(result_json['data']) <= result_json['num_Rows']
        assert len(result_json['data']) <= number_of_news
        for row in result_json['data']:
            assert 'author' in row and 'date_published' in row and 'id' in row and 'title' in row and 'url_image' in row

    else:
        assert False

    response = client.post(url='/news/perCompany/get', json={})
    assert response.status_code == 422


def test_get_related_company(session: Session):
    test_codes = (session.query(CompanyTable.id)
                  .order_by(func.random())
                  .limit(3).all())
    companies = [code[0] for code in test_codes]

    newUsed = (session.query(NewsTable.id)
               .join(NewsCompanyTable, NewsCompanyTable.news_id == NewsTable.id)
               .filter(NewsCompanyTable.company_id.in_(companies))
               .order_by(func.random())
               .limit(1).all())[0][0]

    companies = [{'id': code[0]} for code in test_codes]
    result_request_data = {
        'id': str(newUsed),
        'companies': companies,
        'limit': 10,
        'label': 'News Today'
    }

    response = client.post(url="/news/get/related/company", json=result_request_data)

    assert response.status_code == 200


def test_get_all_values_from_news(session: Session):
    random_publisher_query = (session.query(PublisherTable.id).order_by(func.random()).limit(1).all())
    random_publisher = random_publisher_query[0][0] if random_publisher_query else None

    news_value = NewsTable(
        id=99999999,
        publisher_id=random_publisher,
        title="LAST NEWS Elon musk just announce this",
        description="Elon musk just bought twitter and moved to X",
        author="Me",
        article_url="bbc.com",
        date_published="2024-06-11",
        image_url="example.jpg",
    )
    session.add(news_value)
    session.flush()

    response = client.get(url="/news/get/all/" + str(news_value.id))
    news_response = response.json()

    assert response.status_code == 200
    assert 'title' in news_response and news_value.title == news_response['title']
    assert 'author' in news_response and news_value.author == news_response['author']
    assert 'description' in news_response and news_value.description == news_response['description']
    assert 'article_url' in news_response and news_value.article_url == news_response['article_url']
    assert 'image_url' in news_response and news_value.image_url == news_response['image_url']
    assert 'date_published' in news_response and news_value.date_published == news_response['date_published']


def test_get_essential_separated_date_news(session : Session):

    limits = [10, 5, 0]

    for limit in limits:
        data_response = {
            'limit': limit
        }

        response = client.post(url="/news/get/essential/SeparatedDate", json=data_response)
        news_separated = response.json()

        assert response.status_code == 200
        assert 'This day' in news_separated and len(news_separated['This day']) == limit
        assert 'This week' in news_separated and len(news_separated['This week']) == limit
        assert 'This year' in news_separated and len(news_separated['This year']) == limit






