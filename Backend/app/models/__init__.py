"""Importing this package registers every table on Base.metadata (used by Alembic and the tests)."""

from app.models.Company.Company import CompanyTable
from app.models.Company.NewsCompany.NewsCompany import NewsCompanyTable
from app.models.News.DateNews import NewsTable
from app.models.News.Publisher.Publisher import PublisherTable
from app.models.Stocks.Stocks import StocksTable
from app.models.User.User import UserTable
from app.models.Wallet.Wallet import WalletPositionTable, WalletTransactionTable
from app.models.Watchlist.Watchlist import WatchlistTable

__all__ = [
    "CompanyTable",
    "NewsCompanyTable",
    "NewsTable",
    "PublisherTable",
    "StocksTable",
    "UserTable",
    "WalletPositionTable",
    "WalletTransactionTable",
    "WatchlistTable",
]
