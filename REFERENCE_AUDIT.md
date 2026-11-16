# REFERENCE AUDIT: Portfolio360 (portfolio360.app)
**Platform Audit & Technical Specification for Grow More and Stable Life**

---

## 1. Executive Summary

A comprehensive forensic audit of the reference application [Portfolio360](https://www.portfolio360.app/) was conducted by inspecting the production web client bundles, runtime network requests, public APIs, routing topology, data models, and backend endpoints hosted by `https://backend.capitalmarketsforall.com`.

Portfolio360 is a full-featured financial intelligence, portfolio tracking, and market analytics platform focusing primarily on the **Pakistan Stock Exchange (PSX)**, with supplementary deep coverage of **US Markets** (S&P 500, NASDAQ, Dow Jones), the **Saudi Exchange (Tadawul / TASI)**, global **Forex**, **Commodities**, **Cryptocurrencies**, and **Mutual Funds**.

---

## 2. Discovered Navigation Structure & Route Topology

The client application is built as a single-page application using modern React with code-splitting, lazy chunk resolution, and client-side routing. A total of **127 distinct route patterns** were identified and categorized:

### 2.1 Core Public & Market Pages
* `/` or `/home`: Main market overview dashboard with regional switcher (Pakistan, US, Saudi Arabia).
* `/markets`: Broad market indexes, heatmaps, and multi-market monitoring.
* `/markets/index/:code`: Detailed index breakdown (e.g. KSE100, KSE30, KMI30, SP500, TASI).
* `/markets/commodity/:code`: Commodity detailed view (e.g., Gold, Crude Oil, Silver, Natural Gas).
* `/markets/crypto/:code`: Cryptocurrency detail (e.g., Bitcoin, Ethereum, Solana).
* `/markets/daily-wrap`: Daily market summary and market recap.
* `/markets/insider-transactions`: Form 34 insider buy/sell transactions for PSX listed companies.
* `/markets/investor-flows`: NCCPL institutional and foreign investor portfolio investment (FIPI/LIPI) flows.
* `/markets/settlement`: Clearing and settlement delivery data.
* `/sector/:name`: Sector-specific dashboard with constituent performance and median valuations.

### 2.2 Fundamentals360 Module
* `/fundamentals`: Search hub, screener, capital scores, and valuation ranking across PSX/US/Saudi stocks.
* `/fundamentals/:market/:symbol`: In-depth company fundamental analysis:
  - Income statement, balance sheet, cash flow statement (annual & quarterly).
  - Financial ratios: P/E, P/B, ROE, ROA, Debt-to-Equity, Net Margin, Current Ratio.
  - Fair Value Estimator: DCF intrinsic value, Peter Lynch PEG=1 heuristic, Graham number.
  - Scoring Engine: Health Score, Quality Score, Growth Score, Stability Score, Value Score (0–100 scale).
  - Dividend history, yield, payout ratio, and historical dividend payments.
  - Peer comparison table within industry sector.
* `/funds/:symbol/fundamentals`: Mutual fund fundamental profile, AUM history, NAV history, asset allocation, and top equity holdings.

### 2.3 Technicals360 Module
* `/technicals`: Technical analysis hub, screener by technical verdict, breakout alerts, and momentum ranking.
* `/technicals/:market/:symbol`: Comprehensive technical dashboard:
  - Technical Verdict: Direction (Bullish, Bearish, Neutral), Conviction (Confirmed, Unconfirmed, Mixed), Regime (Trending, Range/Base, Breakout).
  - Technical Score (0–100): Composite of Trend (35%), Momentum (25%), Volume (15%), 52-Week Position (10%), and Relative Strength vs Benchmark (15%).
  - Key Price Levels: S1/S2/S3 support levels, R1/R2/R3 resistance levels, pivot point, stop-loss trigger, invalidation price.
  - Multi-Horizon Alignment: Daily, Weekly, and Monthly consensus.
  - Actionable Scenarios: Bullish breakout targets and bearish invalidation criteria.
* `/mychart`: Interactive charting environment with TradingView Lightweight Charts or Highcharts integration, indicators (RSI, MACD, EMA 20/50/200, Bollinger Bands).

### 2.4 Portfolio Management System (Portfolio360)
* `/portfolio`: Multi-currency, multi-asset portfolio dashboard.
* `/portfolio-manager`: Dedicated workspace for multiple separate investment accounts.
* `/portfolio/workspaces`: Workspace switcher (Personal, Business, Retirement, Family).
* `/portfolio/connections`: Read-only broker sync and API connectivity settings.
* `/portfolio/import`: Import statement wizard supporting CSV, broker statements, and trade logs.
* `/portfolio/import/:sessionId`: Active import session reconciliation and error resolution.
* Supported Asset Classes:
  - Listed Stocks (PSX, US, Saudi Tadawul).
  - Mutual Funds (Pakistan Open-End & Closed-End Funds).
  - Cryptocurrencies (Bitcoin, Altcoins, Stablecoins).
  - Forex Cash & Holdings (PKR, USD, SAR, EUR, GBP, AED, CAD).
  - Precious Metals & Commodities (Gold 24k/22k tola/grams, Silver, Crude Oil).
  - Real Estate (Properties, residential/commercial plots, rental income tracking).
  - Fixed Deposits, National Savings Schemes, and Investment Plans.
  - Bank Accounts and Cash Reserves.
  - Liabilities & Debts (Home loans, personal loans, credit cards, auto financing).
* Performance & Calculations:
  - Realized and Unrealized Profit/Loss.
  - Time-Weighted Returns (TWR) and Money-Weighted Returns (XIRR).
  - Compound Annual Growth Rate (CAGR).
  - Asset Allocation and Sector Exposure Breakdown.
  - Historical Net Worth trend chart.

### 2.5 Market News, Announcements & Economic Indicators
* `/news`: Categorized financial news covering Pakistan, US, and Saudi markets with original publisher attribution.
* `/announcements`: Real-time PSX corporate announcements, board meeting notices, financial results, dividend declarations, and downloadable official exchange PDF notices.
* `/tools?tool=psx-fear-greed`: Fear & Greed sentiment index (0–100) based on momentum, breadth, volume, volatility, and 52-week extremes.
* `/tools?tool=pakistan-macro-signal`: Macroeconomic overlay of State Bank of Pakistan (SBP) policy rate tightening/easing regimes with KSE-100 historical response.
* `/tools?tool=pakistan-profile`: Economic indicators dashboard (CPI Inflation, SBP Policy Rate, FX Reserves, Current Account, Trade Balance, GDP Growth).

### 2.6 Financial Calculators and Tools
A comprehensive suite of **30+ financial calculators and modeling tools**:
1. **Zakat Calculator**: Dual calculation methods using live Gold (24k/22k) and Silver rates in PKR to determine Nisab threshold, net zakatable assets, deductible liabilities, and 2.5% Zakat due.
2. **Dividend Purification Calculator**: Scrip-level purification calculation for PSX dividends based on Al Meezan / Meezan Shariah compliance non-halal income percentages.
3. **Published Rate Directory**: Live directory of Shariah dividend purification rates by symbol.
4. **SIP Calculator**: Monthly systematic investment planner with compounding frequency and start/end-of-month cash flow simulation.
5. **CAGR Calculator**: Compound annual growth rate and yearly growth projections.
6. **DCF Valuation Calculator**: 5 to 10 year Free Cash Flow forecasting, terminal growth rate, WACC discount rate, Enterprise & Equity Value per share.
7. **Project FCF Calculator**: Revenue growth and FCF margin projection modeling.
8. **Peter Lynch Fair Value Calculator**: Heuristic valuation using EPS, expected growth rate, P/E multiples, and dividend yield.
9. **FIRE Calculator**: Financial Independence, Retire Early modeling with inflation adjustments, rising savings, coast FIRE milestones, and years-to-financial-freedom.
10. **Financial Goal Planner**: Reverse calculation of required monthly savings to achieve target future capital.
11. **Stock Comparison Tool**: Side-by-side comparative analysis of up to 4 equities across valuation multiples, health scores, and technical signals.
12. **Mutual Fund Comparison Tool**: Side-by-side comparison of up to 4 funds with normalized historical return performance vs KSE-100 benchmark.
13. **Mutual Fund Favorites**: Shortlist tracking of open-end mutual funds with aggregate AUM and returns.
14. **Fund SIP Planner**: Fund-specific SIP projection using live NAV.
15. **Fund Allocation Planner**: Multi-fund portfolio basket allocation with equal-weight and budget distribution.
16. **Most-Held Equities by Funds**: Mutual fund equity portfolio holdings ranking, aggregate market value, and fund ownership count.
17. **Pivot Point Calculator**: Standard, Fibonacci, Camarilla, and Woodie pivot points with R1-R3 and S1-S3 calculations.
18. **Position Sizing (Pip-based)**: Forex position sizing based on stop-loss pips, account currency, and risk percentage.
19. **Position Sizing (Price-based)**: Position sizing based on dollar/rupee stop price distance.
20. **PSX Position Sizing Calculator**: Pakistan equity position sizing with commission, broker fees, and tax buffers.
21. **Forex Profit/Loss Calculator**: Trade P/L modeling with pip movement, lots, swap, and commission.
22. **Forex Margin Calculator**: Required margin, free margin, and margin level percentage.
23. **Drawdown & Recovery Calculator**: Percentage drawdown from peak and required breakeven return.
24. **Broker Rebate Calculator**: Monthly and annual rebate projection from lot volume.
25. **Effective Leverage Calculator**: Leverage exposure ratio and 1% price movement impact on equity.
26. **Pip Value Calculator**: Accurate pip value calculation across standard, mini, and micro lots.
27. **Depreciation Calculator**: Straight-line and reducing balance asset depreciation schedules.
28. **ROI Calculator**: Net return on investment accounting for transaction costs and taxes.
29. **Currency Converter / X-Rate**: Multi-currency spot conversion across PKR, USD, SAR, EUR, GBP, AED, etc.
30. **Gold & Silver PKR Converter**: Real-time bullion converter with spot-derived and Sarafa association market rates.

### 2.7 Administration & Market Operations (Admin Panel)
* `/admin/dashboard`: Central system administration portal.
* `/admin/market-ops`: Market data pipeline status, sync jobs, manual refresh triggers, and latency monitoring.
* `/admin/valuation-governance`: Valuation rule configuration, outlier detection, and DCF bounds management.
* `/admin/users`: User account management, subscription tiers, and permission assignment.
* `/admin/chart-health`: Data feed integrity and charting bar consistency verification.
* `/admin/email-ingestion`: Inbound financial statement parsing and email alert monitoring.
* `/admin/broker-research`: Research report upload, broker classification, and PDF document metadata.
* `/admin/feedback`: User feedback triage, issue tracking, and resolution logs.

---

## 3. Discovered Backend Architecture & API Contract

The reference platform connects to a high-performance RESTful API backend (`https://backend.capitalmarketsforall.com/api`):

### 3.1 Primary Market Endpoints
* `GET /market/snapshot?view=core`: KSE-100, KSE-30, KMI-30, KMIALLSHR, ALLSHR index levels, changes, P/E ratio, dividend yield, market cap, and trading volume.
* `GET /market/us/snapshot?view=core`: S&P 500, Dow Jones, NASDAQ Composite, Russell 2000, US Dollar Index (DXY), VIX.
* `GET /market/sa/snapshot?view=core`: Tadawul All Share (TASI), MSCI Tadawul 30 (MT30), Nomu Parallel Market.
* `GET /market/commodity/snapshot`: Gold, Silver, Brent Crude, WTI Crude Oil, Natural Gas, Platinum, Copper, Wheat, Corn, Soybeans, Coffee, Sugar, Cotton.
* `GET /market/crypto/snapshot`: Global crypto market cap, Bitcoin, Ethereum, BNB, Solana, 24h gainers/losers, volume, sparkline series, and Crypto Fear & Greed index.
* `GET /market/forex/snapshot`: USD/PKR, EUR/PKR, GBP/PKR, SAR/PKR, AED/PKR, EUR/USD, GBP/USD, USD/JPY, USD/SAR.
* `GET /market/gold-pkr`: Spot-derived gold prices (24k, 22k, 21k, 18k per tola and per gram) + APGJSA official closing sarafa market rates.
* `GET /market/silver-pkr`: Spot-derived and local market silver prices in PKR.
* `GET /market/sentiment`: Region-aware Fear & Greed sentiment score (0–100) with factor breakdowns (Momentum, Breadth, Volume, Volatility, 52W extremes).
* `GET /market/funds/snapshot`: Database of 1,970+ Pakistani mutual funds (NAV, daily change, YTD return, 1Y return, AUM, category, and historical prices).
* `GET /market/announcements`: Real-time PSX corporate announcements with official PDF document URLs from `psx.com.pk`.
* `GET /market/economic-events`: Upcoming macroeconomic releases (CPI inflation, monetary policy decisions, market holidays).
* `GET /market/policy-rate/regimes`: SBP historical policy rate decisions and monetary policy cycle regimes (Tightening, Easing, Neutral).
* `GET /market/analytics/t360-read`: Stock-level technical analysis verdict, score components, support/resistance levels, and scenarios.
* `GET /market/capital-scores/overview`: Valuation statistics across the PSX universe, percentage of stocks undervalued vs overvalued, and sector median gaps.

### 3.2 Authentication & Security Architecture
* Endpoint paths: `/auth/signup`, `/auth/signin`, `/auth/signin/2fa`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/me`.
* Two-Factor Authentication (2FA) support: TOTP-based authentication (`/auth/2fa/setup/initiate`, `/auth/2fa/setup/confirm`).
* Session Token Management: Cookie-based session tokens or Bearer tokens with strict CORS and origin verification.

---

## 4. Architectural Lessons for "Grow More and Stable Life"

1. **Independent Data Ingestion**: Do not rely on third-party private endpoints. We must build authorized, independent adapters directly connecting to public data providers:
   - PSX Official Public Data feeds for Pakistan Equities and Announcements.
   - Yahoo Finance API / Alpha Vantage / Twelve Data for US Markets, Saudi Exchange (TASI), Forex, and Commodities.
   - CoinGecko Free Public API for Cryptocurrencies and Global Crypto Metrics.
   - State Bank of Pakistan (SBP) & Pakistan Bureau of Statistics (PBS) for Pakistan Macro Indicators.
   - MUFAP (Mutual Funds Association of Pakistan) official data for Mutual Funds NAV and AUM.
2. **Multi-Tiered Caching & Snapshot Architecture**: Real-time financial dashboards must not query external providers on every client render. We will implement:
   - Redis caching with configurable TTL (e.g. 60 seconds for equities, 120 seconds for crypto, 300 seconds for forex/commodities, 1 hour for mutual funds, 24 hours for macro indicators).
   - Stored PostgreSQL historical price snapshots for charts and time-series analytics.
3. **Transparent Methodology**: Every calculated score (Technicals Verdict, Fundamentals Health & Value Score, Fear & Greed Index, Zakat & Purification) must expose its exact mathematical weighting and underlying formulas to the user.
4. **Multi-Currency Accounting**: Real-time FX conversion engine to calculate multi-currency portfolio net worth accurately while maintaining historical transaction purchase exchange rates.
