import psycopg2
from colorthief import ColorThief
import os
def find_dominant_color(file):
    color_thief = ColorThief(file)
    dominant_color = color_thief.get_color(quality=1)
    palette = color_thief.get_palette(color_count=6, quality=1)
    return palette
def get_files_in_folder(folder_path):
    files = []
    # Iterate through all the files in the folder
    for file_name in os.listdir(folder_path):
        # Check if the path is a file (not a sub-directory)
        if os.path.isfile(os.path.join(folder_path, file_name)):
            files.append(file_name.replace(".png", ""))
    return files
def rgb_to_hex(r, g, b):
    return '{:02x}{:02x}{:02x}'. format(r, g, b)

file_to_folder = 'C:\\Users\\jorge\\OneDrive\\Documentos\\Eu\\Projetos\\Stock-Finance\\Frontend\\finance-app-frontend\\public\\images\\logos'

all_codes = get_files_in_folder(file_to_folder)
connection = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="1234567",
    host="localhost",
    port="5431"
)
cursor = connection.cursor()
for code in all_codes:
    file_to_folder_temp = file_to_folder
    file_to_folder_temp += "\\" + code + '.png'
    dominant_color = find_dominant_color(file_to_folder_temp)
    query = """UPDATE company set color = '"""+ rgb_to_hex(dominant_color[0][0], dominant_color[0][1], dominant_color[0][2]) + """' where code = '""" + code + """';"""
    cursor.execute(query)
    connection.commit()
    print(f"Foi inserido na bd - {code}- {rgb_to_hex(dominant_color[0][0], dominant_color[0][1], dominant_color[0][2]) }")