"""Step 2 - load stock prices from Alpaca for every company.

For each company it stores:
  * company.high_max - highest daily close since 2018
  * stockclose       - the last DAYS_TO_KEEP daily closes (the API needs at
                       least two to compute the daily variation)

Safe to re-run: a company's closes are replaced on each run.
"""

import time
from datetime import datetime, timedelta

from alpaca_trade_api import REST, TimeFrame
from db import env, get_connection

HISTORY_START = "2018-01-01"
DAYS_TO_KEEP = 30
PAUSE_SECONDS = 0.4  # Alpaca free plan allows 200 requests/minute


def main():
    api = REST(key_id=env["APCA_API_KEY_ID"], secret_key=env["APCA_API_SECRET_KEY"])
    end = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, code FROM company ORDER BY code")
    companies = cursor.fetchall()

    failed = []
    for index, (company_id, code) in enumerate(companies, start=1):
        try:
            bars = api.get_bars(code, TimeFrame.Day, HISTORY_START, end).df
        except Exception as e:
            bars = None
            print(f"[{index}/{len(companies)}] {code}: erro na Alpaca - {e}")

        cursor.execute("DELETE FROM stockclose WHERE company_id = %s", (company_id,))
        if bars is None or bars.empty or "close" not in bars:
            # -1 is what the API/frontend treat as "no value"
            cursor.execute("UPDATE company SET high_max = -1 WHERE id = %s", (company_id,))
            failed.append(code)
        else:
            cursor.execute("UPDATE company SET high_max = %s WHERE id = %s", (float(bars["close"].max()), company_id))
            for timestamp, close in bars["close"].tail(DAYS_TO_KEEP).items():
                cursor.execute(
                    "INSERT INTO stockclose (company_id, value, date) VALUES (%s, %s, %s)",
                    (company_id, float(close), timestamp.date()),
                )
            print(f"[{index}/{len(companies)}] {code}: ok")
        connection.commit()
        time.sleep(PAUSE_SECONDS)

    cursor.close()
    connection.close()
    print(f"Concluído. Sem dados ({len(failed)}): {', '.join(failed)}")


if __name__ == "__main__":
    main()
