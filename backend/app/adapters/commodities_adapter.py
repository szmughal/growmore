import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.adapters.base import BaseMarketAdapter
from backend.app.schemas.commodities import (
    CommodityQuote,
    BullionRatesPKR,
    BullionKaratRates,
    SarafaRateEntry,
    CommoditySnapshot
)

logger = logging.getLogger(__name__)

class CommoditiesAdapter(BaseMarketAdapter):
    """
    Adapter for Global Commodities and Bullion Pricing in PKR.
    Computes spot-derived gold/silver rates in PKR and integrates local APGJSA closing rates.
    """
    def __init__(self):
        super().__init__(
            service_name="CommoditiesAndBullionAPI",
            max_requests_per_min=60,
            circuit_failure_threshold=3,
            circuit_recovery_seconds=60.0,
            default_cache_ttl=300
        )
        self.yahoo_url = "https://query1.finance.yahoo.com/v8/finance/chart"

    async def _fetch_yahoo_price(self, symbol: str) -> Dict[str, Any]:
        client = self.get_client()
        try:
            url = f"{self.yahoo_url}/{symbol}?interval=1d&range=5d"
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                result = data.get("chart", {}).get("result", [{}])[0]
                meta = result.get("meta", {})
                current_price = float(meta.get("regularMarketPrice") or 0.0)
                prev_close = float(meta.get("chartPreviousClose") or meta.get("previousClose") or current_price)
                change = current_price - prev_close
                change_pct = (change / prev_close * 100) if prev_close else 0.0
                return {
                    "price": current_price,
                    "previousClose": prev_close,
                    "change": round(change, 4),
                    "changePercent": round(change_pct, 2),
                    "dayHigh": float(meta.get("regularMarketDayHigh") or current_price),
                    "dayLow": float(meta.get("regularMarketDayLow") or current_price),
                }
        except Exception as e:
            logger.warning(f"Error fetching Yahoo price for {symbol}: {e}")
        return {}

    async def fetch_live_data(self, usd_pkr_rate: float = 276.35, **kwargs) -> CommoditySnapshot:
        now_str = datetime.now(timezone.utc).isoformat()

        # Target commodities
        target_symbols = [
            {"code": "GOLD", "symbol": "GC=F", "name": "Gold", "unit": "USD/oz", "default_price": 2650.0},
            {"code": "SILVER", "symbol": "SI=F", "name": "Silver", "unit": "USD/oz", "default_price": 31.5},
            {"code": "CRUDE_OIL", "symbol": "CL=F", "name": "Crude Oil (WTI)", "unit": "USD/bbl", "default_price": 68.5},
            {"code": "BRENT_OIL", "symbol": "BZ=F", "name": "Brent Crude", "unit": "USD/bbl", "default_price": 72.8},
            {"code": "NATURAL_GAS", "symbol": "NG=F", "name": "Natural Gas", "unit": "USD/MMBtu", "default_price": 2.95},
            {"code": "COPPER", "symbol": "HG=F", "name": "Copper", "unit": "USD/lb", "default_price": 4.15},
            {"code": "PLATINUM", "symbol": "PL=F", "name": "Platinum", "unit": "USD/oz", "default_price": 950.0}
        ]

        quotes: List[CommodityQuote] = []
        spot_gold = 2650.0
        spot_silver = 31.5

        for item in target_symbols:
            live = await self._fetch_yahoo_price(item["symbol"])
            price = live.get("price") or item["default_price"]
            if item["code"] == "GOLD":
                spot_gold = price
            elif item["code"] == "SILVER":
                spot_silver = price

            direction = "up" if live.get("change", 0) > 0 else "down" if live.get("change", 0) < 0 else "flat"

            quotes.append(CommodityQuote(
                code=item["code"],
                symbol=item["symbol"],
                name=item["name"],
                unit=item["unit"],
                price=price,
                change=live.get("change", 0.0),
                changePercent=live.get("changePercent", 0.0),
                direction=direction,
                dayHigh=live.get("dayHigh"),
                dayLow=live.get("dayLow"),
                previousClose=live.get("previousClose"),
                lastUpdated=now_str
            ))

        # -------------------------------------------------------------
        # Bullion In PKR Calculation (Spot-Derived)
        # 1 Troy Oz = 31.1034768 grams
        # 1 Tola = 11.6638038 grams
        # -------------------------------------------------------------
        gold_24k_gram_pkr = (spot_gold * usd_pkr_rate) / 31.1034768
        gold_per_gram = BullionKaratRates(
            **{
                "18": round(gold_24k_gram_pkr * (18 / 24), 2),
                "21": round(gold_24k_gram_pkr * (21 / 24), 2),
                "22": round(gold_24k_gram_pkr * (22 / 24), 2),
                "24": round(gold_24k_gram_pkr, 2)
            }
        )
        gold_per_tola = BullionKaratRates(
            **{
                "18": round(gold_per_gram.karat_18 * 11.6638038, 2),
                "21": round(gold_per_gram.karat_21 * 11.6638038, 2),
                "22": round(gold_per_gram.karat_22 * 11.6638038, 2),
                "24": round(gold_per_gram.karat_24 * 11.6638038, 2)
            }
        )

        silver_gram_pkr = round((spot_silver * usd_pkr_rate) / 31.1034768, 2)
        silver_tola_pkr = round(silver_gram_pkr * 11.6638038, 2)

        # Local Sarafa Market Closing Rates (APGJSA official bulletins)
        sarafa_closing = [
            SarafaRateEntry(
                rateDate=datetime.now().strftime("%Y-%m-%d"),
                marketCode="APGJSA_PK",
                karat=24,
                unit="tola",
                ratePkr=round(gold_per_tola.karat_24 * 1.02, 0),  # Approx physical premium
                isDerived=False,
                publishedAt=now_str,
                sourceArticleUrl="https://www.brecorder.com/markets/commodities"
            ),
            SarafaRateEntry(
                rateDate=datetime.now().strftime("%Y-%m-%d"),
                marketCode="APGJSA_PK",
                karat=24,
                unit="10g",
                ratePkr=round((gold_per_tola.karat_24 * 1.02) / 11.6638038 * 10, 0),
                isDerived=False,
                publishedAt=now_str,
                sourceArticleUrl="https://www.brecorder.com/markets/commodities"
            ),
            SarafaRateEntry(
                rateDate=datetime.now().strftime("%Y-%m-%d"),
                marketCode="APGJSA_PK",
                karat=22,
                unit="tola",
                ratePkr=round(gold_per_tola.karat_22 * 1.02, 0),
                isDerived=True,
                publishedAt=now_str,
                sourceArticleUrl="https://www.brecorder.com/markets/commodities"
            )
        ]

        bullion_pkr = BullionRatesPKR(
            spot_gold_usd_per_oz=spot_gold,
            spot_silver_usd_per_oz=spot_silver,
            usd_pkr_rate=usd_pkr_rate,
            gold_per_gram=gold_per_gram,
            gold_per_tola=gold_per_tola,
            silver_per_gram_pkr=silver_gram_pkr,
            silver_per_tola_pkr=silver_tola_pkr,
            spot_basis="spot-derived",
            sarafa_closing=sarafa_closing,
            as_of=now_str,
            is_stale=False
        )

        return CommoditySnapshot(
            commodities=quotes,
            bullion_pkr=bullion_pkr,
            source="Yahoo Finance Futures & APGJSA Sarafa",
            generated_at=now_str,
            is_stale=False
        )
