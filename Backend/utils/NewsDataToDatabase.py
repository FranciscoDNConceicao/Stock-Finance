import requests
import os
import csv
import time
import psycopg2

file_to_folder = 'C:\\Users\\francisco_conceicao\\Documents\\Finance\\Stock-Finance\\Frontend\\finance-app-frontend\\public\\images\\logos'


cont_init = 0
iteration_time = 0
cont_temp = 1

connection = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="1234567",
    host="localhost",
    port="5431"
)
cursor = connection.cursor()

query = """SELECT code FROM company"""
cursor.execute(query)
rows = cursor.fetchall()
all_codes = [item[0] for item in rows]

query = """SELECT name FROM Publisher"""
cursor.execute(query)
rows = cursor.fetchall()
all_publishers = [item[0] for item in rows]

for code in all_codes:
    start_time = time.time()
    try:
        url = f"https://api.polygon.io/v2/reference/news?ticker={code}&limit=100&apiKey=p1ZovTNZa6Flx6uSxg0J64a4oDPdTdkS"
        response = requests.get(url)
        data = response.json()

        data = data['results']

        for new in data:

            query_Existing = """Select id from News where news_api_id = '""" + new['id'] + """'"""
            cursor.execute(query_Existing)
            newsExistingId = cursor.fetchall()

            if len(set(new['tickers']) & set(all_codes)) > 0 and newsExistingId in (None, False, []):

                publisher = new['publisher']
                # Publisher create
                if publisher['name'] not in all_publishers:

                    values_publisher = (publisher['name'], publisher['homepage_url'], publisher['logo_url'], publisher['favicon_url'])
                    query_publisher = """INSERT INTO Publisher (name, url, logo_url, favicon_url) VALUES (%s, %s, %s, %s) RETURNING id"""
                    cursor.execute(query_publisher, values_publisher)
                    publisher_id = cursor.fetchone()[0]
                    connection.commit()
                    print(f'Foi criado o publisher {publisher['name']}')
                    all_publishers.append(publisher['name'])
                else:
                    query_publisher = """SELECT id from Publisher where name = '"""+ str(publisher['name']) + """'"""
                    cursor.execute(query_publisher)
                    publisher_id = cursor.fetchone()[0]

                if 'description' in new:
                    description = new['description']
                else:
                    description = 'No description'
                #CREATE NEWS
                values_news = (str(publisher_id), new['title'], description, new['author'], new['article_url'], new['published_utc'].replace('T', ' ').replace('Z', ' '), new['image_url'], new['id'])
                query_news = """INSERT INTO News (publisher_id, title, description, author, article_url, date_published, image_url, news_api_id) VALUES (%s, %s, %s, %s,%s, %s, %s, %s) RETURNING id"""
                cursor.execute(query_news, values_news)
                new_id = cursor.fetchone()[0]
                connection.commit()
                print(f'Foi criado a noticia {new['title']}')

                existingTickers = set(all_codes).intersection(new['tickers'])

                for existingTicker in existingTickers:
                    query_code = """SELECT id from Company where code = '""" + existingTicker + """'"""
                    cursor.execute(query_code)
                    code_id = cursor.fetchone()[0]

                    values_NewsCompany = (str(new_id), str(code_id))
                    query_NewsCompany = """INSERT INTO NewsCompany (news_id, company_id) VALUES (%s, %s)"""
                    cursor.execute(query_NewsCompany, values_NewsCompany)
                    connection.commit()

    except Exception as e:
        if 'message' in data:
            print(data['message'])
        print(e)
    print(cont_temp)
    cont_temp += 1
    if cont_temp == 5 and ((time.time() - start_time)) > 60:
        print("Mais que 1 minuto")
        print((time.time() - start_time))
        interation_time = 0
        start_time = time.time()
        cont_temp = 0
    elif cont_temp == 5 and ((time.time() - start_time)) <= 60:
        cont_temp = 0
        print("Menos que 1 minuto")
        print(60-(-(start_time - time.time())))
        time.sleep(60-(-(start_time - time.time())))
        start_time = time.time()
        cont_temp = 0
    cont_init += 1

cursor.close()
connection.close()





