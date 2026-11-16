from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class FundReturnMetrics(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    return_1w: Optional[float] = Field(default=None, alias="1w")
    return_1m: Optional[float] = Field(default=None, alias="1m")
    return_3m: Optional[float] = Field(default=None, alias="3m")
    return_6m: Optional[float] = Field(default=None, alias="6m")
    return_1y: Optional[float] = Field(default=None, alias="1y")
    return_ytd: Optional[float] = Field(default=None, alias="ytd")

class MutualFundQuote(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = None
    symbol: str
    name: str
    amc_name: Optional[str] = None
    nav: float
    nav_date: str = Field(alias="navDate")
    inception_date: Optional[str] = Field(default=None, alias="inceptionDate")
    change: float = 0.0
    change_percent: float = Field(default=0.0, alias="changePercent")
    category: str
    region: str = "Pakistan"
    currency: str = "PKR"
    net_assets_aum: Optional[float] = Field(default=None, alias="netAssets")
    returns: Optional[FundReturnMetrics] = None
    dividend_yield: Optional[float] = Field(default=None, alias="dividendYield")
    source: str = "MUFAP"
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")

class MutualFundsSnapshot(BaseModel):
    total_funds: int
    categories: List[str]
    funds: List[MutualFundQuote]
    source: str = "MUFAP / Capital Stake"
    generated_at: str
    is_stale: bool = False
