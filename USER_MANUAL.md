# GROW MORE AND STABLE LIFE - USER MANUAL & OPERATOR'S GUIDE
**The Complete Platform Guide for Wealth Investors, Financial Analysts & Administrators**  
**Web Application**: `https://growmore.pk` (Local: `http://localhost:3000`)  

---

## 1. Introduction & Welcome

**Grow More and Stable Life** is a full-featured financial intelligence, portfolio management, and wealth accumulation platform. Designed to match and exceed the capabilities of platforms like Portfolio360, it delivers multi-market financial data across Pakistan (PSX), the United States (NYSE/NASDAQ), Saudi Arabia (Tadawul), Cryptocurrencies, Precious Metals (Spot Gold & APGJSA Local Sarafa Bullion), and Pakistan Mutual Funds.

---

## 2. Navigation & User Interface

### 2.1 The Global Workspace Layout
- **Top Header**:
  - **Market Selector**: Toggle instantaneously between Pakistan (PK / PKR), United States (US / USD), and Saudi Arabia (SA / SAR).
  - **Live Search Bar**: Search listed companies, mutual funds, and ticker symbols in real time.
  - **Theme Toggle**: Switch seamlessly between Dark Mode and Light Mode.
  - **Live Market Indicator**: Displays active market status (e.g., PSX Live, US Pre-market).
- **Sidebar**: Access all core modules:
  - Markets Overview
  - Fundamentals360
  - Technicals360
  - Portfolio360
  - Mutual Funds Directory
  - Financial Tools & Calculators (32+ calculators)
  - PSX Corporate Announcements
  - Market News Syndication
  - Pakistan Macroeconomic Signal
  - Admin & Operations Center
- **Live Ticker Tape**: Continuously scrolls real-time prices, day changes, and index performance across KSE-100, S&P 500, TASI, Bitcoin, Gold, and USD/PKR.

---

## 3. Module Guide

### 3.1 Markets Overview & Dashboard
- **Market Snapshot Cards**: View high-level indices, advancing vs declining scrips, total trading volume, and market turnover value.
- **Interactive Candlestick & Area Charts**: Select timeframes (`1W`, `1M`, `3M`, `1Y`, `5Y`) to inspect price trends.
- **Market Movers Table**: Filter between Top Gainers, Top Losers, Most Active stocks, and 52-Week Extremes.
- **Fear & Greed Sentiment Gauge**: Gauge market psychology with our 5-factor weighted sentiment index (Momentum, Breadth, Volume, Volatility, 52-Week Strength) scoring 0–100 from Extreme Fear to Extreme Greed.

### 3.2 Portfolio360 Management
- **Multiple Portfolios**: Create segregated workspaces for Dividend Portfolios, Growth Stocks, Retirement, or Family Wealth.
- **FIFO Cost-Basis Engine**: When you record sells, the system automatically allocates against your oldest purchase lots to calculate exact realized gains/losses.
- **Multi-Currency Support**: Hold assets in PKR, USD, SAR, EUR, or GBP with automatic cross-rate conversion.
- **XIRR & CAGR Returns**: View your true annualized internal rate of return accounting for irregular deposits, buys, sells, and dividends.
- **Liability & Net Worth Tracking**: Add mortgages, auto loans, or personal debts. Net Worth is dynamically computed as:
  $$\text{Net Worth} = \text{Total Market Value of Assets} - \text{Total Outstanding Liabilities}$$
- **Dividend Purification Log**: When recording dividends from Shariah-compliant equities, log the required purification percentage to maintain compliance.

### 3.3 Fundamentals360
- **Financial Statements**: Inspect audited Annual and Quarterly Income Statements, Balance Sheets, and Cash Flow Statements.
- **5-Factor Scoring Model**:
  1. *Financial Health*: Current ratio, debt coverage, and solvency.
  2. *Business Quality*: ROE, ROA, and operating margins.
  3. *Earnings Growth*: FCF and revenue growth trajectories.
  4. *Balance Sheet Stability*: Low leverage and liquidity buffers.
  5. *Valuation Attractiveness*: P/E, P/B, and EV/EBITDA multiples.
- **2-Stage DCF Valuation Calculator**: Customize cost of capital (WACC), growth stages, and perpetual terminal growth rates to estimate intrinsic fair value with margin of safety.
- **Peter Lynch Heuristic**: PEG-ratio-based fair value assessment ($P/E = \text{Growth Rate}$).

### 3.4 Technicals360
- **Algorithmic Trend Indicators**: 20, 50, and 200-period Simple and Exponential Moving Averages with Golden Cross and Death Cross detection.
- **Momentum Oscillators**: 14-period RSI (Relative Strength Index) with overbought/oversold bands and MACD (12, 26, 9) with histogram.
- **Volatility Bands**: Bollinger Bands (20 periods, 2 standard deviations) with bandwidth analysis.
- **Support & Resistance**: Pivot point levels computed via Classic Standard, Fibonacci, and Camarilla equations.
- **Automated Technical Verdict**: Algorithmically synthesized verdict (Strong Buy, Buy, Neutral, Sell, Strong Sell) with conviction score (0–100) and suggested entry, target, and stop-loss levels.

### 3.5 Pakistan Macroeconomic Signal & Economy Dashboard
- **SBP Policy Rate Tracker**: Official policy rates, historic monetary policy decisions, and regime cycle overlays comparing KSE-100 returns during easing vs tightening cycles.
- **Headline CPI Inflation**: Month-on-month and year-on-year inflation from Pakistan Bureau of Statistics (PBS).
- **External Reserves & Currency**: Liquid FX reserves held by SBP and commercial banks, alongside real-time USD/PKR interbank rates.

### 3.6 Financial Tools & Islamic Wealth Calculators (32+ Tools)
- **Zakat Calculator**: Automatically tracks live Silver Nisab ($52.5\text{ tolas}$ threshold) and computes $2.5\%$ liability across cash, gold, tradeable shares, and debts.
- **Dividend Purification Tool**: Directory of Meezan Bank published purification percentages for KMI-30 scrips.
- **Sarafa Bullion Converter**: Live converter for 24K and 22K gold and silver between Pakistani Tolas, Grams, and Troy Ounces.
- **FIRE Retirement Planner**: Computes Lean, Standard, and Fat Financial Independence targets using Safe Withdrawal Rates (SWR).
- **Loan EMI & Mortgage Amortization**: Reducing-balance loan schedule showing exact monthly principal and interest allocations.
- **SIP Wealth Accumulator**: Step-up compounding calculator for monthly investment plans.

---

## 4. Administrator Operations Center

Administrators (`role="admin"`) have access to `/admin`:
- **Market Operations**: Real-time status of all 9 data adapters, sliding window rate limits, and circuit breakers.
- **Circuit Breaker Override**: Manually reset tripped provider circuit breakers from `OPEN` to `CLOSED`.
- **Cache Management**: One-click central cache flush or background cache warming.
- **Valuation Governance**: Adjust platform-wide defaults for the 10Y PKRV risk-free rate, equity risk premium, and Shariah screening bounds.
- **Audit Logs**: Inspect security records, user modifications, and state change history with timestamps and IP addresses.

---

## 5. Security & Account Protection

- **Password Best Practices**: Use at least 8 characters with numbers and symbols.
- **Session Tokens**: JWT tokens expire after 7 days; refresh tokens allow seamless renewal.
- **Multi-Tenant Protection**: Your portfolios, transactions, and net worth calculations are cryptographically isolated and never accessible by other users.
