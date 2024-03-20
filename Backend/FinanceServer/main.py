from fastapi import FastAPI
import requests

app = FastAPI()
API_KEY = ''
@app.get("/")
async def root():
    url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=' + API_KEY
    r = requests.get(url)
    data = r.json()
    print(data)
    return r.json()
