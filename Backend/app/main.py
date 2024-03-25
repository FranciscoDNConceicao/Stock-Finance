from fastapi import FastAPI
import uvicorn
import api.services.datetimeStocksServices as serviceStockDate
from fastapi.middleware.cors import CORSMiddleware
import api.services.companyLogo as companyLogoService

app = FastAPI()
app.include_router(serviceStockDate.RouterDatetimeStocksServices)
app.include_router(companyLogoService.RouterCompanyLogo)

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