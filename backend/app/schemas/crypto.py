from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class SparklinePoint(BaseModel):
    index: int
    value: float

class CryptoCoin(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    symbol: str
    name: str
    price: float
    market_cap: float = Field(alias="marketCap")
    volume_24h: float = Field(alias="volume24h")
    change_24h: float = Field(alias="change24h")
    high_24h: Optional[float] = Field(default=None, alias="high24h")
    low_24h: Optional[float] = Field(default=None, alias="low24h")
    circulating_supply: Optional[float] = Field(default=None, alias="circulatingSupply")
    image: Optional[str] = None
    sparkline: List[float] = []
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")

class CryptoOverview(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    total_market_cap_usd: float = Field(alias="marketCapUsd")
    total_volume_usd: float = Field(alias="volumeUsd")
    btc_dominance: float = Field(alias="btcDominance")
    eth_dominance: float = Field(alias="ethDominance")
    fear_greed_score: Optional[int] = None
    fear_greed_label: Optional[str] = None
    last_updated: Optional[str] = Field(default=None, alias="lastUpdated")

class CryptoSnapshot(BaseModel):
    overview: CryptoOverview
    coins: List[CryptoCoin]
    source: str = "CoinGecko"
    generated_at: str
    is_stale: bool = False
