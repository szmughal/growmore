from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class IndexQuote(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    code: str
    symbol: str
    name: str
    current: float
    high: Optional[float] = None
    low: Optional[float] = None
    open_price: Optional[float] = Field(default=None, alias="open")
    previous_close: Optional[float] = Field(default=None, alias="previousClose")
    change: float
    change_percent: float = Field(alias="changePercent")
    direction: str = "flat"  # "up", "down", "flat"
    volume: Optional[float] = None
    value_traded: Optional[float] = Field(default=None, alias="value")
    pe_ratio: Optional[float] = Field(default=None, alias="peRatio")
    dividend_yield: Optional[float] = Field(default=None, alias="dividendYield")
    market_cap: Optional[float] = Field(default=None, alias="marketCap")
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")

class StockQuote(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    symbol: str
    name: str
    market: str = "PK"
    sector: Optional[str] = None
    current_price: float = Field(alias="price")
    change: float
    change_percent: float = Field(alias="changePercent")
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    previous_close: Optional[float] = None
    volume: float = 0
    value: Optional[float] = None
    pe_ratio: Optional[float] = None
    market_cap: Optional[float] = None
    is_shariah: Optional[bool] = None
    last_updated: Optional[str] = None

class MarketBreadth(BaseModel):
    advances: int = 0
    declines: int = 0
    unchanged: int = 0
    total_scrips: int = 0
    advance_decline_ratio: Optional[float] = None

class MarketSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    region: str  # "PK", "US", "SA"
    indices: List[IndexQuote] = []
    gainers: List[StockQuote] = []
    losers: List[StockQuote] = []
    most_active: List[StockQuote] = []
    breadth: Optional[MarketBreadth] = None
    source: str
    generated_at: str
    is_market_closed: bool = False
    is_stale: bool = False

class HistoricalBarPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class HistoricalSeriesResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    symbol: str
    market: str
    resolution: str
    count: int
    data: List[HistoricalBarPoint]
