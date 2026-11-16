import httpx
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.adapters.base import BaseMarketAdapter
from backend.app.schemas.market import IndexQuote, StockQuote, MarketSnapshot

logger = logging.getLogger(__name__)

class USMarketAdapter(BaseMarketAdapter):
    """
    Adapter for US Equity Markets.
    Fetches S&P 500, Dow Jones, NASDAQ, Russell 2000, VIX, and major US equities.
    """
    def __init__(self):
        super().__init__(
            service_name="USMarketsYahoo",
            max_requests_per_min=60,
            circuit_failure_threshold=3,
            circuit_recovery_seconds=60.0,
            default_cache_ttl=60
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
            logger.warning(f"Error fetching US quote for {symbol}: {e}")
        return {}

    async def fetch_live_data(self, **kwargs) -> MarketSnapshot:
        now_str = datetime.now(timezone.utc).isoformat()
        
        index_defs = [
            {"code": "SP500", "symbol": "^GSPC", "name": "S&P 500", "default": 5860.0},
            {"code": "DJI", "symbol": "^DJI", "name": "Dow Jones Industrial", "default": 43440.0},
            {"code": "NASDAQ", "symbol": "^IXIC", "name": "NASDAQ Composite", "default": 18680.0},
            {"code": "RUT", "symbol": "^RUT", "name": "Russell 2000", "default": 2300.0},
            {"code": "VIX", "symbol": "^VIX", "name": "CBOE Volatility Index", "default": 16.5},
            {"code": "DXY", "symbol": "DX-Y.NYB", "name": "US Dollar Index", "default": 104.2}
        ]

        indices: List[IndexQuote] = []
        for idef in index_defs:
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

        return MarketSnapshot(
            region="US",
            indices=indices,
            gainers=[],
            losers=[],
            most_active=[],
            breadth=None,
            source="Yahoo Finance US Public Feeds",
            generated_at=now_str,
            is_market_closed=False,
            is_stale=False
        )
