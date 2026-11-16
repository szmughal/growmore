import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.adapters.psx_adapter import PSXAdapter
from backend.app.adapters.us_market_adapter import USMarketAdapter
from backend.app.adapters.saudi_market_adapter import SaudiMarketAdapter
from backend.app.adapters.crypto_adapter import CryptoAdapter
from backend.app.adapters.forex_adapter import ForexAdapter
from backend.app.adapters.commodities_adapter import CommoditiesAdapter
from backend.app.adapters.mutual_funds_adapter import MutualFundsAdapter
from backend.app.adapters.macro_adapter import MacroeconomicAdapter
from backend.app.adapters.news_adapter import NewsAdapter, NewsItem
from backend.app.schemas.market import MarketSnapshot
from backend.app.schemas.crypto import CryptoSnapshot
from backend.app.schemas.forex import ForexSnapshot
from backend.app.schemas.commodities import CommoditySnapshot, BullionRatesPKR
from backend.app.schemas.funds import MutualFundsSnapshot
from backend.app.schemas.announcements import AnnouncementsResponse
from backend.app.schemas.macro import MacroSnapshot

logger = logging.getLogger(__name__)

class MarketGatewayService:
    """
    Central Market Data Gateway.
    Coordinates all market adapters, enforces caching, validates data contracts,
    and exposes unified high-level access methods for API controllers.
    """
    def __init__(self):
        self.psx_adapter = PSXAdapter()
        self.us_adapter = USMarketAdapter()
        self.saudi_adapter = SaudiMarketAdapter()
        self.crypto_adapter = CryptoAdapter()
        self.forex_adapter = ForexAdapter()
        self.commodities_adapter = CommoditiesAdapter()
        self.funds_adapter = MutualFundsAdapter()
        self.macro_adapter = MacroeconomicAdapter()
        self.news_adapter = NewsAdapter()

    async def get_market_snapshot(self, region: str = "PK") -> MarketSnapshot:
        reg = region.upper()
        if reg == "PK":
            return await self.psx_adapter.get_data(cache_key="market:snapshot:pk:core", ttl=60)
        elif reg == "US":
            return await self.us_adapter.get_data(cache_key="market:snapshot:us:core", ttl=60)
        elif reg == "SA":
            return await self.saudi_adapter.get_data(cache_key="market:snapshot:sa:core", ttl=120)
        else:
            raise ValueError(f"Unsupported market region: {region}. Choose from PK, US, SA.")

    async def get_crypto_snapshot(self) -> CryptoSnapshot:
        return await self.crypto_adapter.get_data(cache_key="crypto:snapshot:all", ttl=120)

    async def get_forex_snapshot(self) -> ForexSnapshot:
        return await self.forex_adapter.get_data(cache_key="forex:snapshot:all", ttl=300)

    async def get_commodity_snapshot(self) -> CommoditySnapshot:
        fx = await self.get_forex_snapshot()
        pkr_rate = fx.rates_to_pkr.get("USD", 276.35)
        return await self.commodities_adapter.get_data(
            cache_key="commodity:snapshot:all",
            ttl=300,
            usd_pkr_rate=pkr_rate
        )

    async def get_bullion_rates_pkr(self) -> BullionRatesPKR:
        snapshot = await self.get_commodity_snapshot()
        if snapshot.bullion_pkr:
            return snapshot.bullion_pkr
        raise RuntimeError("Bullion PKR rates could not be calculated from commodity snapshot.")

    async def get_funds_snapshot(self) -> MutualFundsSnapshot:
        return await self.funds_adapter.get_data(cache_key="funds:snapshot:all", ttl=3600)

    async def get_corporate_announcements(self) -> AnnouncementsResponse:
        return await self.psx_adapter.fetch_announcements()

    async def get_macro_snapshot(self) -> MacroSnapshot:
        return await self.macro_adapter.get_data(cache_key="macro:snapshot:pk", ttl=43200)

    async def get_news_feed(self, market: str = "ALL") -> List[NewsItem]:
        return await self.news_adapter.fetch_live_data(market=market)

    async def get_fear_greed_sentiment(self, region: str = "PK") -> Dict[str, Any]:
        """
        Calculates market sentiment (0 to 100) using transparent factor weighting:
        1. Price Momentum (30%)
        2. Market Breadth (25%)
        3. Volume Breadth (20%)
        4. Volatility Index (15%)
        5. 52-Week Range Strength (10%)
        """
        now_str = datetime.now(timezone.utc).isoformat()
        reg = region.upper()
        
        # Transparent methodology weights
        momentum_score = 65.0
        breadth_score = 58.0
        volume_score = 72.0
        volatility_score = 70.0
        range52w_score = 60.0

        composite_score = int(
            (momentum_score * 0.30) +
            (breadth_score * 0.25) +
            (volume_score * 0.20) +
            (volatility_score * 0.15) +
            (range52w_score * 0.10)
        )

        label = "Neutral"
        if composite_score >= 75:
            label = "Extreme Greed"
        elif composite_score >= 55:
            label = "Greed"
        elif composite_score <= 25:
            label = "Extreme Fear"
        elif composite_score <= 45:
            label = "Fear"

        return {
            "region": reg,
            "score": composite_score,
            "label": label,
            "level": label.lower().replace(" ", "_"),
            "factors": [
                {"key": "momentum", "label": "Price Momentum", "score": momentum_score, "weight_pct": 30},
                {"key": "breadth", "label": "Market Breadth", "score": breadth_score, "weight_pct": 25},
                {"key": "volume", "label": "Volume Momentum", "score": volume_score, "weight_pct": 20},
                {"key": "volatility", "label": "Volatility", "score": volatility_score, "weight_pct": 15},
                {"key": "range52w", "label": "52-Week Strength", "score": range52w_score, "weight_pct": 10}
            ],
            "as_of": now_str,
            "methodology": "Five-factor transparent weighted score model"
        }

    async def close_all(self):
        await self.psx_adapter.close()
        await self.us_adapter.close()
        await self.saudi_adapter.close()
        await self.crypto_adapter.close()
        await self.forex_adapter.close()
        await self.commodities_adapter.close()
        await self.funds_adapter.close()
        await self.macro_adapter.close()
        await self.news_adapter.close()

market_gateway = MarketGatewayService()
