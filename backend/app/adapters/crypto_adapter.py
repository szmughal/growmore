import httpx
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.adapters.base import BaseMarketAdapter
from backend.app.schemas.crypto import CryptoCoin, CryptoOverview, CryptoSnapshot

logger = logging.getLogger(__name__)

class CryptoAdapter(BaseMarketAdapter):
    """
    Adapter for CoinGecko Public Cryptocurrency API.
    Provides live prices, market cap, 24h volume, sparklines, and market dominance.
    """
    def __init__(self):
        super().__init__(
            service_name="CoinGeckoCrypto",
            max_requests_per_min=30,  # CoinGecko Demo/Public limit is 30/min
            circuit_failure_threshold=3,
            circuit_recovery_seconds=60.0,
            default_cache_ttl=120
        )
        self.base_url = "https://api.coingecko.com/api/v3"

    async def fetch_live_data(self, **kwargs) -> CryptoSnapshot:
        client = self.get_client()
        
        # 1. Fetch Global Metrics (Total Market Cap, Dominance)
        global_resp = await client.get(f"{self.base_url}/global")
        global_data = global_resp.json().get("data", {}) if global_resp.status_code == 200 else {}
        
        # 2. Fetch Top Coins with Sparklines
        coins_resp = await client.get(
            f"{self.base_url}/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 20,
                "page": 1,
                "sparkline": "true",
                "price_change_percentage": "24h"
            }
        )
        coins_resp.raise_for_status()
        coins_raw = coins_resp.json()

        now_str = datetime.now(timezone.utc).isoformat()

        # Parse overview
        total_mcap = global_data.get("total_market_cap", {}).get("usd", 0.0)
        total_vol = global_data.get("total_volume", {}).get("usd", 0.0)
        mcap_pct = global_data.get("market_cap_percentage", {})
        btc_dom = mcap_pct.get("btc", 0.0)
        eth_dom = mcap_pct.get("eth", 0.0)

        overview = CryptoOverview(
            marketCapUsd=float(total_mcap),
            volumeUsd=float(total_vol),
            btcDominance=float(btc_dom),
            ethDominance=float(eth_dom),
            fear_greed_score=None,
            lastUpdated=now_str
        )

        parsed_coins: List[CryptoCoin] = []
        for c in coins_raw:
            sparkline_prices = c.get("sparkline_in_7d", {}).get("price", [])
            # Downsample sparkline to ~35 points for frontend efficiency
            if len(sparkline_prices) > 35:
                step = len(sparkline_prices) // 35
                sampled_sparkline = [sparkline_prices[i] for i in range(0, len(sparkline_prices), step)][:35]
            else:
                sampled_sparkline = sparkline_prices

            parsed_coins.append(CryptoCoin(
                id=c.get("id", ""),
                symbol=c.get("symbol", "").upper(),
                name=c.get("name", ""),
                price=float(c.get("current_price") or 0.0),
                marketCap=float(c.get("market_cap") or 0.0),
                volume24h=float(c.get("total_volume") or 0.0),
                change24h=float(c.get("price_change_percentage_24h") or 0.0),
                high24h=float(c.get("high_24h")) if c.get("high_24h") is not None else None,
                low24h=float(c.get("low_24h")) if c.get("low_24h") is not None else None,
                circulatingSupply=float(c.get("circulating_supply")) if c.get("circulating_supply") is not None else None,
                image=c.get("image"),
                sparkline=sampled_sparkline,
                lastUpdated=c.get("last_updated") or now_str
            ))

        return CryptoSnapshot(
            overview=overview,
            coins=parsed_coins,
            source="CoinGecko Public API",
            generated_at=now_str,
            is_stale=False
        )
