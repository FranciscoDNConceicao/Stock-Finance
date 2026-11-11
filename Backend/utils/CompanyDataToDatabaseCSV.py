"""Step 1 - create one company per logo in the frontend, using companies.csv.

Safe to re-run: companies that already exist are skipped.
"""
import csv

from db import COMPANIES_CSV, get_connection, logo_codes


def load_csv():
    with open(COMPANIES_CSV, newline="", encoding="utf-8") as file:
        return {row["ticker"]: row for row in csv.DictReader(file)}


def main():
    companies = load_csv()
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT code FROM company")
    existing = {row[0] for row in cursor.fetchall()}

    inserted, missing = 0, []
    for code in logo_codes():
        if code in existing:
            continue
        row = companies.get(code)
        if row is None:
            missing.append(code)
            continue

        cursor.execute(
            """INSERT INTO company (code, name, locate, currency_name, description, url, sic_description)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (code, row["company name"][:100], "us", "usd", row["description"], row["website"],
             row["industry"] or row["tag 3"]),
        )
        inserted += 1

    connection.commit()
    cursor.close()
    connection.close()

    print(f"Inseridas {inserted} empresas ({len(existing)} já existiam).")
    if missing:
        print(f"Sem dados no CSV ({len(missing)}): {', '.join(missing)}")


if __name__ == "__main__":
    main()
