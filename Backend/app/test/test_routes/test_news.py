from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.test.main_test import client, session


def test_get_news_per_company(session : Session):

    number_of_news = 10

    subquery = session.query(NewsCompanyTable.company_id,func.count(NewsCompanyTable.id).label('news_count')
    ).group_by(NewsCompanyTable.company_id).subquery()

    # Main query to filter companies with at least 10 news articles
    result = (session.query(CompanyTable.id)
              .join(subquery,CompanyTable.id == subquery.c.company_id)
              .filter(subquery.c.news_count >= number_of_news)
              .order_by(func.random())
              .limit(1).all())
    idCompany = result[0][0] if result else None

    data_request = {
        'id': str(idCompany),
        'initPage': "0",
        'endPage': str(number_of_news)
    }
    response = client.post(url='/news/perCompany/get',json=data_request)

    assert response.status_code == 200
    result_json = response.json()
    if 'data' in result_json and 'num_Rows':
        assert len(result_json['data']) <= result_json['num_Rows']
        assert len(result_json['data']) == number_of_news
    else:
        assert False

    response = client.post(url='/news/perCompany/get', json={})
    assert response.status_code == 422

def test_get_related_company(session : Session):
    test_codes = (session.query(CompanyTable.code)
              .order_by(func.random())
              .limit(3).all())
    companies = [code[0] for code in test_codes]

    newUsed = (session.query(NewsTable.id)
               .join(NewsCompanyTable.news_id == NewsTable.id)
               .filter(NewsCompanyTable.company_id in companies)
               .order_by(func.random())
               .limit(1).all)[0][0]

    result_request_data = {
        'id': newUsed,
        'companies': companies,
        'limit': 10,
        'label': 'News Today'
    }

    response = client.post(url="/news/get/related/company", )

