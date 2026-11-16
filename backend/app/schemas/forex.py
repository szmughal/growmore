from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict

class ForexPair(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    code: str
    symbol: str
    name: str
    base_currency: str = Field(alias="base")
    quote_currency: str = Field(alias="quote")
    price: float
    change: float = 0.0
    change_percent: float = Field(default=0.0, alias="changePercent")
    direction: str = "flat"
    day_high: Optional[float] = Field(default=None, alias="dayHigh")
    day_low: Optional[float] = Field(default=None, alias="dayLow")
    previous_close: Optional[float] = Field(default=None, alias="previousClose")
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")
    is_computed: bool = Field(default=False, alias="isComputed")

class ForexSnapshot(BaseModel):
    base_currency: str = "USD"
    pairs: List[ForexPair]
    rates_to_usd: Dict[str, float] = {}
    rates_to_pkr: Dict[str, float] = {}
    source: str
    generated_at: str
    is_stale: bool = False
