from fastapi import FastAPI
import uvicorn
import api.services.datetimeStocksServices as datetimeStocksServices

app = FastAPI()
app.include_router(datetimeStocksServices.RouterDatetimeStocksServices)


if __name__ == "__main__":
    uvicorn.run(app)