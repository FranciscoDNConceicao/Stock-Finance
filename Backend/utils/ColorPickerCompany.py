"""Step 3 - store each company's dominant logo colour in company.color.

Requires: python -m pip install colorthief
"""

from colorthief import ColorThief
from db import LOGOS_DIR, get_connection


def dominant_hex(path):
    r, g, b = ColorThief(str(path)).get_palette(color_count=6, quality=1)[0]
    return f"{r:02x}{g:02x}{b:02x}"


def main():
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT code FROM company ORDER BY code")
    codes = [row[0] for row in cursor.fetchall()]

    for code in codes:
        logo = LOGOS_DIR / f"{code}.png"
        if not logo.exists():
            print(f"{code}: sem logo")
            continue
        try:
            color = dominant_hex(logo)
        except Exception as e:
            print(f"{code}: erro - {e}")
            continue
        cursor.execute("UPDATE company SET color = %s WHERE code = %s", (color, code))
        print(f"{code}: {color}")

    connection.commit()
    cursor.close()
    connection.close()


if __name__ == "__main__":
    main()
