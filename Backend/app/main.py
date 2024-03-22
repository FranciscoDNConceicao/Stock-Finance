from fastapi import FastAPI
import uvicorn
import api.services.datetimeStocksServices as datetimeStocksServices
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(datetimeStocksServices.RouterDatetimeStocksServices)

origins = [
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    uvicorn.run(app)