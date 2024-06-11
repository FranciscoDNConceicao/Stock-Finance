from fastapi import Depends

from sqlalchemy.orm import Session
from app.test.main_test import client, session
from app.models.Company.Company import CompanyTable


def test_random_company():
    response = client.post(url="/company/random", json={"limit": 5})
    assert response.status_code == 200
    assert len(response.json()) == 5

    response = client.post(url="/company/random", json={"limit": 0})
    assert response.status_code == 200
    assert response.json() == []


def test_ticker_company():
    response = client.get(url="/company/ticker")
    assert response.status_code == 200
    assert 'data' in response.json()
    assert isinstance(response.json()['data'], list)


def test_only_random_company():
    response = client.get("/company/get/random")
    assert response.status_code == 200
    if response.json() != {}:
        assert 'id' in response.json()
        assert 'code' in response.json()
        assert 'color' in response.json()
    else:
        assert response.json() == {}


def test_get_all_company_values(session: Session):
    new_company = CompanyTable(id=1222,
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
                               color="ffffff")

    session.add(new_company)
    session.flush()

    response = client.get("/company/get/all/1222")
    assert response.status_code == 200
    assert response.json() == {
        'code': "AAA",
        'name': "Company Example",
        'locate': "portugal",
        'currency_name': "eur",
        'address': "Street Example",
        'description': "Company example for tests",
        'num_employees': 1,
        'URL': "google.com",
        'color': "ffffff",
        'highMax': 31.32,
        'dateList': "2024-05-27",
        'sicCode': "4242"
    }
