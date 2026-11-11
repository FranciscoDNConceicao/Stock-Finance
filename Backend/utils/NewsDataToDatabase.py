"""Step 4 - load news from Polygon for every company.

Fills publisher, news and newscompany (which companies each news mentions).
The Polygon free plan allows 5 requests/minute, so this takes about
13 seconds per company (~1h30 for ~420 companies).

Safe to re-run: news that already exist (same Polygon id) are skipped.
"""

import time

import requests
from db import env, get_connection

NEWS_PER_COMPANY = 100
PAUSE_SECONDS = 12.5


def get_publisher_id(cursor, publishers, publisher):
    name = publisher["name"]
    if name not in publishers:
        cursor.execute(
            "INSERT INTO publisher (name, url, logo_url, favicon_url) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, publisher.get("homepage_url"), publisher.get("logo_url"), publisher.get("favicon_url")),
        )
        publishers[name] = cursor.fetchone()[0]
    return publishers[name]


def main():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT code, id FROM company ORDER BY code")
    companies = dict(cursor.fetchall())
    cursor.execute("SELECT name, id FROM publisher")
    publishers = dict(cursor.fetchall())
    cursor.execute("SELECT news_api_id FROM news WHERE news_api_id IS NOT NULL")
    existing_news = {row[0] for row in cursor.fetchall()}

    for index, code in enumerate(companies, start=1):
        started = time.time()
        inserted = 0
        try:
            response = requests.get(
                "https://api.polygon.io/v2/reference/news",
                params={"ticker": code, "limit": NEWS_PER_COMPANY, "apiKey": env["POLYGON_API_KEY"]},
                timeout=30,
            )
            data = response.json()
            if "results" not in data:
                print(f"[{index}/{len(companies)}] {code}: {data.get('error') or data.get('message') or data}")
            for item in data.get("results", []):
                related = [ticker for ticker in set(item.get("tickers", [])) if ticker in companies]
                if item["id"] in existing_news or not related:
                    continue

                publisher_id = get_publisher_id(cursor, publishers, item["publisher"])
                cursor.execute(
                    """INSERT INTO news (publisher_id, title, description, author, article_url,
                                         date_published, image_url, news_api_id)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                    (
                        publisher_id,
                        item["title"],
                        item.get("description", "No description"),
                        item.get("author"),
                        item.get("article_url"),
                        item["published_utc"][:10],
                        item.get("image_url"),
                        item["id"],
                    ),
                )
                news_id = cursor.fetchone()[0]
                for ticker in related:
                    cursor.execute(
                        "INSERT INTO newscompany (news_id, company_id) VALUES (%s, %s)", (news_id, companies[ticker])
                    )
                existing_news.add(item["id"])
                inserted += 1
            connection.commit()
            print(f"[{index}/{len(companies)}] {code}: {inserted} notícias novas")
        except Exception as e:
            connection.rollback()
            print(f"[{index}/{len(companies)}] {code}: erro - {e}")

        time.sleep(max(0.0, PAUSE_SECONDS - (time.time() - started)))

    cursor.close()
    connection.close()
    print("Concluído.")


if __name__ == "__main__":
    main()
