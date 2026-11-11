from typing import Literal

from pydantic import BaseModel

TimeRange = Literal['1D', '1W', '1M', '3M', '1Y', '3Y']


class SearchStocksValue(BaseModel):
    stockCode: str
    time: TimeRange
