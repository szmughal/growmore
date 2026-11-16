# API INTEGRATION PLAN: Grow More and Stable Life
**Central Market Data Ingestion & Service Architecture**

---

## 1. Architectural Overview

To deliver high-availability, low-latency financial intelligence while guaranteeing data accuracy and strict compliance with external provider terms, the ingestion subsystem follows an **Asynchronous Modular Adapter Architecture**.

```
                   +---------------------------------------------+
                   |           Scheduled Worker Engine           |
                   |      (Cron / Asyncio Background Tasks)      |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |       Central Market Gateway Service        |
                   +---------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
     +--------------------+    +--------------------+    +--------------------+
     |    PSX Adapter     |    | Yahoo / FX Adapter |    |  CoinGecko Adapter |
     +--------------------+    +--------------------+    +--------------------+
                |                         |                         |
                +-------------------------+-------------------------+
                                          |
                                          v
                            +---------------------------+
                            | Validation & Sanitization |
                            +---------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             +--------------------+               +--------------------+
             |    Redis Cache     |               | PostgreSQL Storage |
             |   (Hot Key/Val)    |               |  (Persistent Snap) |
             +--------------------+               +--------------------+
                        |                                   |
                        +-----------------+-----------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |          FastAPI REST / WS Endpoints        |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |           Frontend Client (Next.js)         |
                   +---------------------------------------------+
```

---

## 2. Adapter Pattern Specification

Each data category implements a standardized interface inheriting from `BaseMarketAdapter`:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class BaseMarketAdapter(ABC):
    name: str
    rate_limit_per_min: int
    cache_ttl_seconds: int

    @abstractmethod
    async def fetch_snapshot(self) -> Dict[str, Any]:
        """Fetch current market snapshot or index overview."""
        pass

    @abstractmethod
    async def fetch_bars(self, symbol: str, resolution: str, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        """Fetch historical candlestick / OHLCV price series."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify API upstream responsiveness and latency."""
        pass
```

### 2.1 Concrete Adapters
1. **`PSXPortalAdapter`**:
   - Primary: Ingests market watch, sector summaries, and corporate announcements directly from PSX Data Portal.
   - Secondary: Yahoo Finance `.KA` symbols for historical OHLCV chart bars.
2. **`YahooFinanceAdapter`**:
   - Covers US indices (`^GSPC`, `^DJI`, `^IXIC`), Saudi equities (`.SR`), global commodities (`GC=F`, `CL=F`), and Forex cross pairs (`USDPKR=X`, `EURPKR=X`).
3. **`CoinGeckoAdapter`**:
   - Pulls real-time crypto prices, 24h market metrics, circulating supply, market cap rankings, and sparkline series.
4. **`MUFAPAdapter`**:
   - Ingests daily NAVs, AUM figures, category classifications, and return metrics for all active mutual funds in Pakistan.
5. **`MacroeconomicAdapter`**:
   - Pulls official inflation, interest rate, reserve, and trade figures from SBP and PBS publications.
6. **`BullionSarafaAdapter`**:
   - Calculates spot-derived gold/silver rates in PKR and parses official daily closing bulletins from the All Pakistan Sarafa Gems and Jewellers Association (APGJSA).

---

## 3. Background Job Schedules & Ingestion Cadence

Scheduled tasks are coordinated using an asynchronous scheduler (such as APScheduler or Celery with Redis broker):

| Task Identifier | Target Dataset | Frequency / Schedule | Description |
|---|---|---|---|
| `job_psx_live_ticks` | PSX Equities & Indices | Every 60 seconds (Mon–Thu 09:15–15:30 PKT, Fri 09:15–12:00, 14:30–16:30) | Update active stock prices, volumes, gainers, losers, and index points. |
| `job_psx_eod_close` | PSX Daily Closing | Mon–Fri 17:00 PKT | Reconcile final official closing prices, traded values, and 52-week highs/lows. |
| `job_us_market_ticks` | US Equities & Indices | Every 60 seconds (Mon–Fri 09:30–16:00 EST) | Update S&P 500, Dow Jones, NASDAQ, and US watchlist stocks. |
| `job_saudi_ticks` | Saudi Tadawul (TASI) | Every 120 seconds (Sun–Thu 10:00–15:00 AST) | Update TASI index, top traded Saudi stocks, and sector movements. |
| `job_crypto_snapshot` | Cryptocurrencies | Every 120 seconds, 24/7 | Ingest top 100 cryptocurrencies, volume, dominance, and market cap. |
| `job_forex_commodities` | Forex & Global Commodities | Every 5 minutes, 24/5 | Update USD/PKR, EUR/USD, Gold, Silver, Crude Oil, and Natural Gas. |
| `job_mufap_eod_nav` | Pakistan Mutual Funds | Daily at 21:30 PKT | Ingest published daily NAVs and recompute 1W, 1M, YTD returns. |
| `job_psx_announcements` | Corporate Announcements | Every 5 minutes (Mon–Fri 09:00–18:00 PKT) | Poll for new exchange notices, dividend declarations, and financial results. |
| `job_sentiment_recalc` | Fear & Greed Indices | Every 15 minutes during trading hours | Recompute composite sentiment scores for Pakistan, US, and Saudi markets. |
| `job_news_syndication` | Financial News Feeds | Every 15 minutes | Pull authorized RSS feeds, extract summaries, and tag relevant symbols. |
| `job_macro_check` | Macroeconomic Data | Daily at 08:00 PKT | Check for newly announced SBP policy rates, CPI inflation, or reserve updates. |

---

## 4. Caching Hierarchy & Redis Key Convention

Redis provides sub-millisecond data delivery to client applications while shielding upstream providers from rate exhaustion.

### 4.1 Key Naming Convention
* **Market Snapshots**: `market:snapshot:{region}:core` (e.g. `market:snapshot:pk:core`, `market:snapshot:us:core`, `market:snapshot:sa:core`). TTL: 60–120s.
* **Index Detail**: `market:index:{symbol}` (e.g. `market:index:KSE100`). TTL: 60s.
* **Stock Real-Time Quote**: `stock:quote:{market}:{symbol}` (e.g. `stock:quote:psx:OGDC`). TTL: 60s.
* **Mutual Funds Snapshot**: `funds:snapshot:all`. TTL: 3,600s (1 hour).
* **Forex Snapshot**: `forex:snapshot:all`. TTL: 300s.
* **Commodities Snapshot**: `commodity:snapshot:all`. TTL: 300s.
* **Crypto Snapshot**: `crypto:snapshot:all`. TTL: 120s.
* **Gold & Silver PKR**: `bullion:rates:pkr`. TTL: 300s.
* **Sentiment Score**: `sentiment:{region}` (e.g. `sentiment:PK`). TTL: 900s.
* **Corporate Announcements**: `announcements:recent:{market}`. TTL: 300s.

### 4.2 Cache Invalidation & Warming
* When an active background job successfully finishes an ingestion cycle, it updates the Redis cache directly (**Cache Warming**) and emits an event for connected WebSocket clients.
* If a background job encounters an upstream error, the existing cache entry remains valid until its grace period expires (serving stale data with a clear `is_stale: true` indicator).

---

## 5. Rate Limiting, Failure Handling & Alerting

1. **Provider Quota Management**:
   - In-memory sliding window counters track API requests per minute and per day for each provider.
   - If an adapter reaches 85% of its allocated tier quota, polling frequency is dynamically scaled back (e.g., from 60s to 180s) to prevent quota exhaustion.
2. **Circuit Breaker Configuration**:
   - Consecutive failures threshold: 3 errors.
   - Circuit open duration: 300 seconds.
   - Half-open test: 1 probe request before restoring full traffic.
3. **Audit Logging & Admin Alerts**:
   - Every failed external request is recorded in `api_logs` with HTTP status, response body, latency, and timestamp.
   - High-severity failures (e.g. market feed down during trading hours for > 15 minutes) trigger an admin alert visible on `/admin/market-ops`.
