from app.test.main_test import client


def test_random_company():
    response = client.post(url="/company/random", json={"limit": 5})
    assert response.status_code == 200
    assert len(response.json()) == 5

    response = client.post(url="/company/random", json={"limit": 0})
    assert response.status_code == 200
    assert response.json() == []
