from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.News.Publisher.Publisher import PublisherTable
from app.test.main_test import client, session

def test_get_Stocks_Data_For_Day(session: Session):

    timeframes = ['1D', '1W', '1M', '3M', '1Y', '3Y']