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

def search_csv(filename, target):
    with open(filename, 'r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        for row in reader:
            for cell in row:
                if cell == target:
                    return row
    return None

list_of_codes_not_found = []

query = """SELECT code FROM company"""

cursor.execute(query)
rows = cursor.fetchall()
result = [item[0] for item in rows]

for code in all_codes:
    if code not in result:
        list_of_codes_not_found.append(code)
        print(code)


for code in list_of_codes_not_found:
    row = search_csv('C:\\Users\\francisco_conceicao\\Documents\\Finance\\Stock-Finance\\Backend\\utils\\companies.csv', code)
    if row != None:
        values = (row[0], row[1], 'us','usd', "NULL",row[4], row[5],  '-1', "1000-12-31","199",row[13].upper())

        query = """INSERT INTO company (code, name, locate, currency_name, address, description, url, number_employees, list_date, sic_code, sic_description) VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"""

        cursor.execute(query, values)
        connection.commit()
        print(f"Foi inserido na bd - {code}")

    else:
        print(f"Não foi inserido na bd - {code}")

