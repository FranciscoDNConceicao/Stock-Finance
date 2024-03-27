import openpyxl
import os


workbook = openpyxl.load_workbook('C:\\Users\\francisco_conceicao\\Documents\\Finance\\Stock-Finance\\Backend\\utils\\SP500.xlsx')


sheet = workbook.active
first_column_values = [cell.value for cell in sheet['A']]
file_to_folder = 'C:\\Users\\francisco_conceicao\\Documents\\Finance\\Stock-Finance\\Frontend\\finance-app-frontend\\public\\images\\logos'

def get_files_in_folder(folder_path):
    files = []
    # Iterate through all the files in the folder
    for file_name in os.listdir(folder_path):
        # Check if the path is a file (not a sub-directory)
        if os.path.isfile(os.path.join(folder_path, file_name)):
            files.append(file_name.replace(".png", ""))
    return files

all_files = get_files_in_folder(file_to_folder)

not_SP500_codes = [element for element in all_files if element not in first_column_values]
print(not_SP500_codes)

for not_SP500_code in not_SP500_codes:
    file_to_delete = file_to_folder + '\\' + not_SP500_code + '.png'
    print(file_to_delete)
    os.remove(file_to_delete)