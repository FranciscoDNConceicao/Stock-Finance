import pytest
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.test.main_test import client, session


def test_get_Stocks_Data_For_Day(session: Session):
    timeframes = ['1D', '1W', '1M', '3M', '1Y', '3Y']

    for timeframe in timeframes:
        response_random = client.get("/company/get/random")
        assert response_random.status_code == 200
        assert 'id' in response_random.json()
        assert 'code' in response_random.json()
        assert 'color' in response_random.json()

        code = response_random.json()['code']

        request_data = {
            'stockCode': code,
            'time': timeframe
        }

        request_get_stocks = client.post(url="/stock/get/", json=request_data)
        assert request_get_stocks.status_code == 200


def test_get_selected_stock_for_datagrid(session: Session):
    response = client.post(url='stock/select/StockForDataGrid', json={
        'initPage': 0,
        'endPage': 10
    })
    assert response.status_code == 200
    assert len(response.json()) == 10
    for row in response.json():
        assert ('id' in row and 'icon' in row and 'stockName' in row and 'unit' in row
                and 'priceLast' in row and 'percentage' in row and 'priceHigh' in row and 'lastUpdate' in row)

    response = client.post(url="/stock/select/StockForDataGrid", json={
        'initPage': 7,
        'endPage': 12
    })
    assert response.status_code == 200
    assert len(response.json()) == 5
    for row in response.json():
        assert ('id' in row and 'icon' in row and 'stockName' in row and 'unit' in row
                and 'priceLast' in row and 'percentage' in row and 'priceHigh' in row and 'lastUpdate' in row)

     response = client.post(url="/stock/select/StockForDataGrid", json={
        'initPage': 10,
        'endPage': 10
    })
    assert response.status_code == 200
    assert len(response.json()) == 0
