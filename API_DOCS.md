# REST API DOCUMENTATION & INTEGRATION REFERENCE
**Platform**: Grow More and Stable Life  
**Base URL**: `http://localhost:8000/api/v1` (Production: `https://growmore.pk/api/v1`)  
**Interactive Swagger Docs**: `http://localhost:8000/docs`  
**OpenAPI Specification**: `http://localhost:8000/openapi.json`  

---

## 1. Authentication & Security

All private endpoints require a Bearer token in the HTTP `Authorization` header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### 1.1 User Registration
* **Endpoint**: `POST /auth/register`
* **Request Body**:
  ```json
  {
    "email": "investor@growmore.pk",
    "password": "StrongPassword123!",
    "full_name": "Tariq Mahmood",
    "country_code": "PK",
    "base_currency": "PKR"
  }
  ```
* **Response** (`201 Created`):
  ```json
  {
    "id": "uuid-v4-string",
    "email": "investor@growmore.pk",
    "full_name": "Tariq Mahmood",
    "role": "user",
    "is_active": true,
    "is_verified": false
  }
  ```

### 1.2 User Login (Token Generation)
* **Endpoint**: `POST /auth/login`
* **Request Body** (`application/x-www-form-urlencoded` or JSON):
  ```json
  {
    "username": "investor@growmore.pk",
    "password": "StrongPassword123!"
  }
  ```
* **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 604800
  }
  ```

### 1.3 Authenticated User Profile
* **Endpoint**: `GET /auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Response** (`200 OK`): Full user profile and customized settings.

---

## 2. Multi-Asset Portfolio Management

### 2.1 List Portfolios
* **Endpoint**: `GET /portfolios`
* **Response** (`200 OK`): Array of portfolios with nested asset holdings and liabilities.

### 2.2 Create Portfolio
* **Endpoint**: `POST /portfolios`
* **Request Body**:
  ```json
  {
    "name": "PSX Dividend Aristocrats",
    "description": "High dividend yield blue-chips listed on KSE-100",
    "base_currency": "PKR",
    "is_primary": true,
    "is_public": false
  }
  ```

### 2.3 Portfolio Performance & Net Worth Summary
* **Endpoint**: `GET /portfolios/{portfolio_id}/summary`
* **Response** (`200 OK`):
  ```json
  {
    "portfolio_id": "port-uuid",
    "name": "PSX Dividend Aristocrats",
    "base_currency": "PKR",
    "total_market_value": 15400000.0,
    "total_cost_basis": 12000000.0,
    "unrealized_pnl": 3400000.0,
    "unrealized_pnl_percent": 28.33,
    "total_realized_pnl": 450000.0,
    "total_dividends": 680000.0,
    "total_liabilities": 2500000.0,
    "net_worth": 12900000.0,
    "xirr_percent": 18.42,
    "cagr_percent": 15.65,
    "asset_allocation": {
      "equity": 12000000.0,
      "mutual_fund": 2400000.0,
      "gold": 1000000.0
    }
  }
  ```

### 2.4 Add Asset Holding
* **Endpoint**: `POST /portfolios/{portfolio_id}/assets`
* **Request Body**:
  ```json
  {
    "symbol": "SYS",
    "market": "PK",
    "asset_type": "equity",
    "name": "Systems Limited",
    "currency": "PKR"
  }
  ```

### 2.5 Record Transaction (FIFO Engine)
* **Endpoint**: `POST /portfolios/{portfolio_id}/transactions`
* **Request Body**:
  ```json
  {
    "asset_id": "asset-uuid",
    "transaction_type": "buy",
    "transaction_date": "2026-11-14",
    "quantity": 500,
    "unit_price": 420.50,
    "fees": 250.0,
    "taxes": 35.0,
    "currency": "PKR",
    "notes": "Purchased on breakout above 200 EMA"
  }
  ```

### 2.6 Record Dividend (Shariah Purification Tracking)
* **Endpoint**: `POST /portfolios/{portfolio_id}/dividends`
* **Request Body**:
  ```json
  {
    "asset_id": "asset-uuid",
    "payment_date": "2026-11-14",
    "dividend_per_share": 6.00,
    "gross_amount": 30000.00,
    "withholding_tax": 4500.00,
    "zakat_deduction": 0.00,
    "net_amount": 25500.00,
    "purification_rate_pct": 0.85,
    "purification_amount": 255.00,
    "currency": "PKR"
  }
  ```

---

## 3. Market Data & Streaming

### 3.1 Market Regional Snapshot
* **Endpoint**: `GET /market/snapshot?region=PK` (Options: `PK`, `US`, `SA`)
* **Response** (`200 OK`): Top gainers, losers, most active stocks, index quotes, advances/declines market breadth.

### 3.2 Live Historical Candlesticks / OHLCV Bars
* **Endpoint**: `GET /market/history/{symbol}?market=PK&timeframe=1M&resolution=1D`
* **Response** (`200 OK`):
  ```json
  {
    "symbol": "KSE100",
    "market": "PK",
    "resolution": "1D",
    "count": 30,
    "data": [
      {
        "time": "2026-11-14T16:00:00Z",
        "open": 93200.0,
        "high": 93850.0,
        "low": 93100.0,
        "close": 93500.0,
        "volume": 125000000
      }
    ]
  }
  ```

### 3.3 Server-Sent Events (SSE) Live Ticks
* **Endpoint**: `GET /market/stream`
* **Header**: `Accept: text/event-stream`
* **Protocol**: Real-time event stream broadcasting price updates and market breadth every 2 seconds.

---

## 4. Fundamentals360 & Technicals360

### 4.1 Company Fundamentals & 5-Factor Scoring
* **Endpoint**: `GET /fundamentals/{symbol}?market=PK`
* **Response** (`200 OK`): Profile, financial statements, ratios, Peter Lynch fair value, and 5-factor scores (Health, Quality, Growth, Stability, Value 0–100).

### 4.2 Interactive DCF Intrinsic Valuation
* **Endpoint**: `POST /fundamentals/{symbol}/dcf`
* **Request Body**: Custom WACC, growth rates, terminal growth, debt, cash.
* **Response**: Step-by-step cash flow projections, terminal value, enterprise value, and margin of safety.

### 4.3 Algorithmic Technical Analysis
* **Endpoint**: `GET /technicals/{symbol}?market=PK&resolution=1D`
* **Response** (`200 OK`): SMA/EMA (20, 50, 200), RSI (14), MACD (12, 26, 9), Bollinger Bands, ATR, Pivots (Standard, Fibonacci, Camarilla), Technical Verdict, Conviction Score (0–100), and Trade Scenarios.

---

## 5. Islamic Wealth & Financial Calculators

### 5.1 Zakat Calculator (Live Silver Nisab)
* **Endpoint**: `POST /tools/zakat`
* **Request Body**:
  ```json
  {
    "cash_in_hand_and_banks": 1000000.0,
    "gold_value_pkr": 500000.0,
    "shares_market_value": 750000.0,
    "immediate_debts_and_liabilities": 250000.0
  }
  ```
* **Response**: Silver Nisab threshold, net zakatable wealth, and zakat payable.

### 5.2 Meezan Dividend Purification
* **Endpoint**: `POST /tools/purification`
* **Request Body**:
  ```json
  {
    "symbol": "SYS",
    "dividend_gross_amount": 50000.0
  }
  ```
* **Response**: Meezan official rate, amount payable to charity, and net halal dividend.

### 5.3 Reducing-Balance Loan EMI
* **Endpoint**: `POST /tools/loan-emi`
* **Request Body**:
  ```json
  {
    "loan_amount": 2500000.0,
    "annual_interest_rate_pct": 14.5,
    "loan_tenure_months": 36
  }
  ```
* **Response**: Monthly EMI, total interest, and full monthly amortization schedule.

---

## 6. Administration & Operations

All `/admin/*` routes require `role in ("admin", "superadmin")`.

* `GET /admin/dashboard`: Overall system statistics and database table counts.
* `GET /admin/market-ops`: 9 provider telemetry, circuit breakers, rate limits, cache stats.
* `POST /admin/market-ops/circuit-breakers/{service_name}/reset`: Reset tripped breaker.
* `POST /admin/market-ops/cache/clear`: Flush central cache.
* `POST /admin/market-ops/cache/warm`: Trigger immediate cache warming.
* `GET /admin/users`: List users with search and role filters.
* `PATCH /admin/users/{user_id}`: Update user role or toggle active status.
* `GET /admin/governance`: Get valuation baseline and Shariah screening parameters.
* `PUT /admin/governance`: Update valuation governance parameters with audit log.
* `GET /admin/audit-logs`: Query administrative audit trail records.
