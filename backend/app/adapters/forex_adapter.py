import httpx
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.adapters.base import BaseMarketAdapter
from backend.app.schemas.forex import ForexPair, ForexSnapshot

logger = logging.getLogger(__name__)

class ForexAdapter(BaseMarketAdapter):
    """
    Adapter for real-time Forex exchange rates.
    Computes direct and cross currency pairs across USD, PKR, SAR, EUR, GBP, AED, CAD.
    """
    def __init__(self):
        super().__init__(
            service_name="ForexRatesAPI",
            max_requests_per_min=60,
            circuit_failure_threshold=3,
            circuit_recovery_seconds=60.0,
            default_cache_ttl=300  # 5 minutes
        )
        self.base_url = "https://open.er-api.com/v6/latest/USD"

    async def fetch_live_data(self, **kwargs) -> ForexSnapshot:
        client = self.get_client()
        resp = await client.get(self.base_url)
        resp.raise_for_status()
        data = resp.json()

        rates_to_usd = data.get("rates", {})
        now_str = datetime.now(timezone.utc).isoformat()
        
        # Base USD rates
        pkr_rate = float(rates_to_usd.get("PKR", 276.5))
        eur_rate = float(rates_to_usd.get("EUR", 0.95))
        gbp_rate = float(rates_to_usd.get("GBP", 0.79))
        sar_rate = float(rates_to_usd.get("SAR", 3.75))
        aed_rate = float(rates_to_usd.get("AED", 3.67))
        jpy_rate = float(rates_to_usd.get("JPY", 154.0))
        cad_rate = float(rates_to_usd.get("CAD", 1.40))

        # Rates to PKR
        rates_to_pkr = {
            "USD": pkr_rate,
            "EUR": pkr_rate / eur_rate if eur_rate else 0.0,
            "GBP": pkr_rate / gbp_rate if gbp_rate else 0.0,
            "SAR": pkr_rate / sar_rate if sar_rate else 0.0,
            "AED": pkr_rate / aed_rate if aed_rate else 0.0,
            "CAD": pkr_rate / cad_rate if cad_rate else 0.0,
            "JPY": pkr_rate / jpy_rate if jpy_rate else 0.0,
        }

        # Defined standard pairs
        pairs = [
            ForexPair(
                code="USDPKR",
                symbol="USDPKR=X",
                name="US Dollar / Pakistani Rupee",
                base="USD",
                quote="PKR",
                price=round(pkr_rate, 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=False
            ),
            ForexPair(
                code="EURPKR",
                symbol="EURPKR=X",
                name="Euro / Pakistani Rupee",
                base="EUR",
                quote="PKR",
                price=round(rates_to_pkr["EUR"], 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=True
            ),
            ForexPair(
                code="GBPPKR",
                symbol="GBPPKR=X",
                name="British Pound / Pakistani Rupee",
                base="GBP",
                quote="PKR",
                price=round(rates_to_pkr["GBP"], 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=True
            ),
            ForexPair(
                code="SARPKR",
                symbol="SARPKR=X",
                name="Saudi Riyal / Pakistani Rupee",
                base="SAR",
                quote="PKR",
                price=round(rates_to_pkr["SAR"], 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=True
            ),
            ForexPair(
                code="AEDPKR",
                symbol="AEDPKR=X",
                name="UAE Dirham / Pakistani Rupee",
                base="AED",
                quote="PKR",
                price=round(rates_to_pkr["AED"], 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=True
            ),
            ForexPair(
                code="EURUSD",
                symbol="EURUSD=X",
                name="Euro / US Dollar",
                base="EUR",
                quote="USD",
                price=round(1.0 / eur_rate if eur_rate else 1.05, 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=False
            ),
            ForexPair(
                code="GBPUSD",
                symbol="GBPUSD=X",
                name="British Pound / US Dollar",
                base="GBP",
                quote="USD",
                price=round(1.0 / gbp_rate if gbp_rate else 1.27, 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=False
            ),
            ForexPair(
                code="USDJPY",
                symbol="USDJPY=X",
                name="US Dollar / Japanese Yen",
                base="USD",
                quote="JPY",
                price=round(jpy_rate, 2),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=False
            ),
            ForexPair(
                code="USDSAR",
                symbol="USDSAR=X",
                name="US Dollar / Saudi Riyal",
                base="USD",
                quote="SAR",
                price=round(sar_rate, 4),
                change=0.0,
                changePercent=0.0,
                direction="flat",
                lastUpdated=now_str,
                isComputed=False
            )
        ]

        return ForexSnapshot(
            base_currency="USD",
            pairs=pairs,
            rates_to_usd={k: float(v) for k, v in rates_to_usd.items()},
            rates_to_pkr=rates_to_pkr,
            source="ExchangeRate-API & Interbank Calculations",
            generated_at=now_str,
            is_stale=False
        )
