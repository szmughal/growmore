from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class CommodityQuote(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    code: str
    symbol: str
    name: str
    unit: str
    price: float
    change: float = 0.0
    change_percent: float = Field(default=0.0, alias="changePercent")
    direction: str = "flat"
    day_high: Optional[float] = Field(default=None, alias="dayHigh")
    day_low: Optional[float] = Field(default=None, alias="dayLow")
    previous_close: Optional[float] = Field(default=None, alias="previousClose")
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")

class BullionKaratRates(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    karat_18: float = Field(alias="18")
    karat_21: float = Field(alias="21")
    karat_22: float = Field(alias="22")
    karat_24: float = Field(alias="24")

class SarafaRateEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    rate_date: str = Field(alias="rateDate")
    market_code: str = Field(default="APGJSA_PK", alias="marketCode")
    karat: int
    unit: str  # "tola" or "10g"
    rate_pkr: float = Field(alias="ratePkr")
    is_derived: bool = Field(default=False, alias="isDerived")
    published_at: Optional[str] = Field(default=None, alias="publishedAt")
    source_article_url: Optional[str] = Field(default=None, alias="sourceArticleUrl")

class BullionRatesPKR(BaseModel):
    spot_gold_usd_per_oz: float
    spot_silver_usd_per_oz: float
    usd_pkr_rate: float
    gold_per_gram: BullionKaratRates
    gold_per_tola: BullionKaratRates
    silver_per_gram_pkr: float
    silver_per_tola_pkr: float
    spot_basis: str = "spot-derived"
    sarafa_closing: List[SarafaRateEntry] = []
    as_of: str
    is_stale: bool = False

class CommoditySnapshot(BaseModel):
    commodities: List[CommodityQuote]
    bullion_pkr: Optional[BullionRatesPKR] = None
    source: str
    generated_at: str
    is_stale: bool = False
