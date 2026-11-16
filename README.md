# Grow More — Pakistan Stock Exchange (PSX) Financial Intelligence & Portfolio Operating System

Grow More is a financial analytics, real-time market tracking, and wealth management platform built specifically for the **Pakistan Stock Exchange (PSX)**.

---

## 🌟 Key Features

- **Real-Time Market Streaming**: Continuous 1.6s order-book micro-tick engine with dynamic bid/ask spreads, dynamic index updates (KSE 100, KMI 30 Shariah, KSE 30), and executed trade streaming.
- **Top Ticker Tape Marquee**: Seamless infinite marquee ticker with interactive pause toggle and live green/red price flash indicators.
- **Interactive Financial Charts**: Clean SVG vector chart interpolation with real-time intraday tip beacon across 1D, 1W, 1M, 1Y, and 5Y timeframes.
- **Full 14 Institutional Tools & Modules**:
  1. **Markets (`/markets`)**: Sector comparisons, top gainers, losers, and most active scrips.
  2. **Technical Analysis (`/technicals`)**: Automated RSI, MACD, Bollinger Bands, and Moving Average triggers.
  3. **Fundamental Analysis (`/fundamentals`)**: Financial ratios, EPS, P/E multiples, dividend yields, and Shariah compliance statuses.
  4. **Portfolio Tracker (`/portfolio`)**: Multi-asset tracking, daily profit/loss, cost-basis calculations, and asset allocation breakdown.
  5. **Stock Screener (`/screener`)**: Multi-metric filtering for PSX equities.
  6. **Mutual Funds (`/funds`)**: Conventional and Islamic mutual fund NAV comparisons.
  7. **Financial Calculators (`/tools`)**: Systematic Investment Plan (SIP), Dividend Income, FBR Income Tax, and Loan EMI calculators.
  8. **Corporate Announcements (`/announcements`)**: Real-time board meetings, cash dividend payouts, and official SECP/PSX PDF filing links.
  9. **Financial News (`/news`)**: Curated Pakistan business and capital markets news.
  10. **Macroeconomics (`/macro`)**: SBP Policy Rate, inflation (CPI), PKR/USD exchange rates, and FX reserves.
  11. **Personal Expense Manager (`/expenses`)**: Household budget and savings rate planner.
  12. **Community Forum (`/community`)**: Market sentiment discussion board.
  13. **MyChart (`/mychart`)**: Custom technical charting workbench.
  14. **Admin Dashboard (`/admin`)**: Gateway health, cache invalidation, and data ingestion telemetry.
- **White Editorial Design System**: Ultra-clean, distraction-free typography and contrast (`#f8fafc` canvas, `#ffffff` card surfaces, `#0F172A` headings, `#059669` institutional emerald gains, `#E11D48` crimson pullbacks).

---

## 🏗️ Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|  FRONTEND: Next.js 14.2 (App Router) | React 18 | TypeScript | Tailwind CSS 3.4   |
|  STATE: React Context (ThemeContext) Real-Time Tick & Order-Book Stream           |
+-----------------------------------------------------------------------------------+
                                        |  REST / Async Polling
                                        v
+-----------------------------------------------------------------------------------+
|  BACKEND: FastAPI (Python 3.11+) | Uvicorn ASGI | Pydantic V2 Validation          |
|  SECURITY: OWASP Headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type)      |
+-----------------------------------------------------------------------------------+
        |                                                 |
        v                                                 v
+-------------------------------+               +-----------------------------------+
|  PERSISTENCE: SQLAlchemy 2.0  |               |  INGESTION: BaseMarketAdapter     |
|  AsyncIO (aiosqlite / Postgres|               |  Circuit Breakers + In-Memory TTL |
+-------------------------------+               +-----------------------------------+
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.11 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/szmughal/growmore.git
cd growmore
```

### 2. Backend Setup (FastAPI)
```bash
# Optional: create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt  # Or install fastapi, uvicorn, sqlalchemy, aiosqlite, httpx, pydantic

# Run the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running the Test Suite
```bash
pytest backend/tests -v
```

---

## 📚 Documentation & Specifications

The repository includes documentation and PDFs:
- [Grow_More_Technical_Architecture_and_Data_Specification.pdf](./Grow_More_Technical_Architecture_and_Data_Specification.pdf) — Complete engineering architecture, data fetching pipelines, and PSX FIX integration roadmap.
- [Grow_More_User_Guide_and_UI_Walkthrough.pdf](./Grow_More_User_Guide_and_UI_Walkthrough.pdf) — Complete user guide and walkthrough in simple English for investors.
- [API_DOCS.md](./API_DOCS.md) — REST API endpoints and data schemas.
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment with Docker & Nginx.

---

## 📄 License
This project is licensed under the MIT License.
