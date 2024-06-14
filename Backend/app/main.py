from fastapi import FastAPI
import uvicorn
from functools import lru_cache
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.settings import settings
#Routers
from app.api.main import api_router

origins = settings.originCORS

app = FastAPI(
    title="Stock Finance"
)
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app)
