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

connection = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="1234567",
    host="localhost",
    port="5431"
)
cursor = connection.cursor()

list_of_codes_not_found = []

query = """SELECT code FROM company"""

cursor.execute(query)
rows = cursor.fetchall()
result = [item[0] for item in rows]

for code in all_codes:
    if code not in result:
        list_of_codes_not_found.append(code)
        print(code)
