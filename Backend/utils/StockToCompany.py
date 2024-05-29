from datetime import datetime, timedelta
import requests
import psycopg2
from alpaca_trade_api import REST, TimeFrame

connection = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="1234567",
    host="localhost",
    port="5430"
)

cursor = connection.cursor()
query = """SELECT code, id FROM company"""
cursor.execute(query)
all_codes = cursor.fetchall()

for code in all_codes:
    try:
        api_alpaca = REST(key_id="PKWD0U5VC3Z0XB7QA09E", secret_key="SDs8F7vW2b1cyKWSqDLj3TJWwa5111FzbVH8RuAg")
        last_day = datetime(2024, 5, 24) - timedelta(days=1)
        init_day = datetime(2018, 4, 5)


        #request = api_alpaca.get_bars(code[0], TimeFrame.Day, (init_day).strftime('%Y-%m-%d'),
        #                              last_day.strftime('%Y-%m-%d'), limit=1).df
        #if 'close' in request:
        #    high_max = request['close'].max()
        #    #query = ""UPDATE company set high_max = """ + high_max.astype(str) + """ where id = "" + str(code[1])
        #  cursor.execute(query)
        #    connection.commit()
        #    print(code[0])

        request = api_alpaca.get_bars(code[0], TimeFrame.Hour, (last_day).strftime('%Y-%m-%d'), last_day.strftime('%Y-%m-%d'), limit=1).df

        if 'close' not in request:
            url = f"https://api.polygon.io/v2/aggs/ticker/{code[0]}/range/1/day/{last_day.strftime('%Y-%m-%d')}/{last_day.strftime('%Y-%m-%d')}?adjusted=true&sort=asc&limit=120&apiKey=p1ZovTNZa6Flx6uSxg0J64a4oDPdTdkS"
            response = requests.get(url)
            data = response.json()
            if 'results' in data:
                data = data['results']
                value = data['c']
            else:
                value = -1
        else:
            value = next(iter(request['close'].to_dict().values()))
        query_stock = """INSERT INTO StockClose (company_id, value, date) VALUES (%s, %s, %s) """
        valuesStockCompany = (str(code[1]), str(value), last_day.strftime('%Y-%m-%d'))
        cursor.execute(query_stock, valuesStockCompany)
        print(code[0])
        connection.commit()

    except Exception as e:
        print(e)
