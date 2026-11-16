from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Grow More and Stable Life"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Secret Keys & Security
    SECRET_KEY: str = "growmore-insecure-dev-secret-key-change-in-production-1234567890"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_ENABLED: bool = False  # Falls back to in-memory cache if Redis is not running locally
    
    # External API Configs & Keys (Optional tiers / free tier defaults)
    COINGECKO_BASE_URL: str = "https://api.coingecko.com/api/v3"
    EXCHANGERATE_BASE_URL: str = "https://open.er-api.com/v6"
    PSX_DPS_BASE_URL: str = "https://dps.psx.com.pk"
    YAHOO_FINANCE_BASE_URL: str = "https://query1.finance.yahoo.com/v8/finance"
    
    # Ingestion Cache TTLs (in seconds)
    CACHE_TTL_LIVE_TICKS: int = 60
    CACHE_TTL_CRYPTO: int = 120
    CACHE_TTL_FOREX: int = 300
    CACHE_TTL_COMMODITY: int = 300
    CACHE_TTL_BULLION_PKR: int = 300
    CACHE_TTL_MUTUAL_FUNDS: int = 3600
    CACHE_TTL_ANNOUNCEMENTS: int = 300
    CACHE_TTL_MACRO: int = 43200  # 12 hours
    CACHE_TTL_SENTIMENT: int = 900

settings = Settings()
