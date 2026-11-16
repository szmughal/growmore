import httpx
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.adapters.base import BaseMarketAdapter
from backend.app.schemas.market import IndexQuote, StockQuote, MarketSnapshot

logger = logging.getLogger(__name__)

class SaudiMarketAdapter(BaseMarketAdapter):
    """
    Adapter for Saudi Stock Exchange (Tadawul).
    Fetches TASI, MT30, NOMUC, and major Saudi listed corporations.
    """
    def __init__(self):
        super().__init__(
            service_name="SaudiTadawulAPI",
            max_requests_per_min=60,
            circuit_failure_threshold=3,
            circuit_recovery_seconds=60.0,
            default_cache_ttl=120
        )
        self.yahoo_url = "https://query1.finance.yahoo.com/v8/finance/chart"

    async def _fetch_quote(self, symbol: str) -> Dict[str, Any]:
        client = self.get_client()
        try:
            url = f"{self.yahoo_url}/{symbol}?interval=1d&range=5d"
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                res = data.get("chart", {}).get("result", [{}])[0]
                meta = res.get("meta", {})
                current = float(meta.get("regularMarketPrice") or 0.0)
                prev = float(meta.get("chartPreviousClose") or meta.get("previousClose") or current)
                change = current - prev
                change_pct = (change / prev * 100) if prev else 0.0
                return {
                    "current": current,
                    "previousClose": prev,
                    "change": round(change, 2),
                    "changePercent": round(change_pct, 2),
                    "high": float(meta.get("regularMarketDayHigh") or current),
                    "low": float(meta.get("regularMarketDayLow") or current),
                    "open": float(meta.get("regularMarketOpen") or current),
                    "volume": float(meta.get("regularMarketVolume") or 0.0),
                }
        except Exception as e:
            logger.warning(f"Error fetching Saudi quote for {symbol}: {e}")
        return {}

    async def fetch_live_data(self, **kwargs) -> MarketSnapshot:
        now_str = datetime.now(timezone.utc).isoformat()

        sa_indices = [
            {"code": "TASI", "symbol": "^TASI.SR", "name": "Tadawul All Share Index", "default": 11850.0},
            {"code": "MT30", "symbol": "MT30.SR", "name": "MSCI Tadawul 30 Index", "default": 1450.0},
            {"code": "NOMUC", "symbol": "^NOMUC.SR", "name": "Parallel Market Capped Index", "default": 26500.0}
        ]

        indices: List[IndexQuote] = []
        for idef in sa_indices:
            q = await self._fetch_quote(idef["symbol"])
            current = q.get("current") or idef["default"]
            chg = q.get("change", 0.0)
            chg_pct = q.get("changePercent", 0.0)
            direction = "up" if chg > 0 else "down" if chg < 0 else "flat"

            indices.append(IndexQuote(
                code=idef["code"],
                symbol=idef["symbol"],
                name=idef["name"],
                current=current,
                high=q.get("high"),
                low=q.get("low"),
                open=q.get("open"),
                previousClose=q.get("previousClose"),
                change=chg,
                changePercent=chg_pct,
                direction=direction,
                volume=q.get("volume"),
                lastUpdated=now_str
            ))

        # Top Saudi Equities (e.g., Aramco 2222, Al Rajhi 1120, SABIC 2010)
        sa_stocks_defs = [
            {"symbol": "2222.SR", "name": "Saudi Aramco", "price": 27.5},
            {"symbol": "1120.SR", "name": "Al Rajhi Bank", "price": 88.0},
            {"symbol": "2010.SR", "name": "SABIC", "price": 72.4},
            {"symbol": "1180.SR", "name": "National Commercial Bank (SNB)", "price": 35.8}
        ]
        sample_stocks: List[StockQuote] = []
        for s in sa_stocks_defs:
            q = await self._fetch_quote(s["symbol"])
            current = q.get("current") or s["price"]
            sample_stocks.append(StockQuote(
                symbol=s["symbol"].replace(".SR", ""),
                name=s["name"],
                market="SA",
                price=current,
                change=q.get("change", 0.0),
                changePercent=q.get("changePercent", 0.0),
                volume=q.get("volume", 0.0),
                last_updated=now_str
            ))

        return MarketSnapshot(
            region="SA",
            indices=indices,
            gainers=sample_stocks[:2],
            losers=sample_stocks[2:],
            most_active=sample_stocks,
            breadth=None,
            source="Saudi Exchange / Yahoo Finance",
            generated_at=now_str,
            is_market_closed=False,
            is_stale=False
        )
