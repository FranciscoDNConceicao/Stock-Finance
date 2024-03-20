from fastapi import FastAPI
import uvicorn
from api.services import datetimeStocksServices

app = FastAPI()
API_KEY_nasdaq = 'wJD7pCiR9fAspphHzKQz '
API_KEY_alpha_vantage = 'J3CDEYC1FR0PJ9SD'

app.include_router(datetimeStocksServices.RouterDatetimeStocksServices)


if __name__ == "__main__":
    uvicorn.run(app)