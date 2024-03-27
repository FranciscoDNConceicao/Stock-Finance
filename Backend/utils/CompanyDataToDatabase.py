import requests
import os
import csv
import time
import psycopg2

file_to_folder = 'C:\\Users\\francisco_conceicao\\Documents\\Finance\\Stock-Finance\\Frontend\\finance-app-frontend\\public\\images\\logos'

def get_files_in_folder(folder_path):
    files = []
    # Iterate through all the files in the folder
    for file_name in os.listdir(folder_path):
        # Check if the path is a file (not a sub-directory)
        if os.path.isfile(os.path.join(folder_path, file_name)):
            files.append(file_name.replace(".png", ""))
    return files
all_codes = get_files_in_folder(file_to_folder)
print(all_codes)
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

list_of_codes_not_found = []
start_time = time.time()
for code in all_codes:

    if cont_init != 0:
        try:
            url = f"https://api.polygon.io/v3/reference/tickers/{code}?apiKey=p1ZovTNZa6Flx6uSxg0J64a4oDPdTdkS"
            response = requests.get(url)
            data = response.json()
            if 'status_code' in data and data['status_code'] == 404:
                print(f'Não Foi inserido na bd - {code}')
            else:
                data = data['results']
                address = str(data['address']['address1'] + ' - ' + data['address']['city'] + ' - ' + data['address']['state'])

                values = (data['ticker'], data['name'], data['locale'], data['currency_name'], address, data['description'], data['homepage_url'], str(data['total_employees']), data['list_date'], data['sic_code'], data['sic_description'])

                query = """INSERT INTO company (code, name, locate, currency_name, address, description, url, number_employees, list_date, sic_code, sic_description) VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"""

                cursor.execute(query, values)
                connection.commit()
                print(f"Foi inserido na bd - {code}")

        except Exception as e:
            if 'message' in data:
                print(data['message'])
                list_of_codes_not_found.append(code)
            print(code)
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


