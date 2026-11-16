import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import date
from backend.app.main import app
from backend.app.db.session import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_full_portfolio_lifecycle_and_calculations():
    import uuid
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register a dedicated user for portfolio tests
        user_email = f"portfolio_{uuid.uuid4().hex[:8]}@growmore.pk"
        reg_resp = await ac.post("/api/v1/auth/register", json={
            "email": user_email,
            "password": "PasswordLifecycle2026!",
            "full_name": "Portfolio Test User",
            "country_code": "PK",
            "base_currency": "PKR"
        })
        assert reg_resp.status_code == 201

        # 2. Login
        login_resp = await ac.post("/api/v1/auth/login", json={
            "email": user_email,
            "password": "PasswordLifecycle2026!"
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Create a secondary portfolio
        create_p_resp = await ac.post("/api/v1/portfolios", json={
            "name": "High Growth Equities",
            "description": "Tech and Energy focus",
            "base_currency": "PKR",
            "is_primary": False
        }, headers=headers)
        assert create_p_resp.status_code == 201
        portfolio_id = create_p_resp.json()["id"]

        # 4. Add an asset (e.g. Systems Limited - SYS)
        asset_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/assets", json={
            "asset_type": "stock",
            "symbol": "SYS",
            "name": "Systems Limited",
            "market": "PK",
            "currency": "PKR",
            "initial_quantity": 0,
            "initial_price": 0,
            "notes": "Core tech holding"
        }, headers=headers)
        assert asset_resp.status_code == 201
        asset_id = asset_resp.json()["id"]

        # 5. Execute BUY transaction 1: 100 shares @ 400 PKR + 100 fee
        buy1_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/transactions", json={
            "asset_id": asset_id,
            "transaction_type": "buy",
            "transaction_date": "2024-01-15",
            "quantity": 100,
            "unit_price": 400.0,
            "fees": 100.0,
            "taxes": 0.0,
            "currency": "PKR",
            "exchange_rate_to_base": 1.0
        }, headers=headers)
        assert buy1_resp.status_code == 201

        # 6. Execute BUY transaction 2: 100 shares @ 450 PKR + 100 fee
        buy2_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/transactions", json={
            "asset_id": asset_id,
            "transaction_type": "buy",
            "transaction_date": "2024-06-15",
            "quantity": 100,
            "unit_price": 450.0,
            "fees": 100.0,
            "taxes": 0.0,
            "currency": "PKR",
            "exchange_rate_to_base": 1.0
        }, headers=headers)
        assert buy2_resp.status_code == 201

        # Check asset state: Total 200 shares, Cost = (40000+100) + (45000+100) = 85200 PKR
        assets_list = await ac.get(f"/api/v1/portfolios/{portfolio_id}/assets", headers=headers)
        asset_data = next(a for a in assets_list.json() if a["id"] == asset_id)
        assert float(asset_data["quantity"]) == 200.0
        assert float(asset_data["total_cost_basis"]) == 85200.0
        assert float(asset_data["average_buy_price"]) == 426.0

        # 7. Execute SELL transaction (FIFO): Sell 150 shares @ 500 PKR
        # Depletes 100 shares from Lot 1 (cost 400) + 50 shares from Lot 2 (cost 450)
        # Cost of sold = (100 * 400) + (50 * 450) = 40000 + 22500 = 62500
        # Proceeds = 150 * 500 = 75000 - 150 fee = 74850
        # Realized P&L = 74850 - 62500 = +12350
        sell_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/transactions", json={
            "asset_id": asset_id,
            "transaction_type": "sell",
            "transaction_date": "2024-09-01",
            "quantity": 150,
            "unit_price": 500.0,
            "fees": 150.0,
            "taxes": 0.0,
            "currency": "PKR",
            "exchange_rate_to_base": 1.0
        }, headers=headers)
        assert sell_resp.status_code == 201
        sell_data = sell_resp.json()
        assert float(sell_data["realized_gain_loss"]) == 12350.0

        # Remaining shares = 50
        assets_list_after_sell = await ac.get(f"/api/v1/portfolios/{portfolio_id}/assets", headers=headers)
        asset_after = next(a for a in assets_list_after_sell.json() if a["id"] == asset_id)
        assert float(asset_after["quantity"]) == 50.0
        assert float(asset_after["realized_pnl"]) == 12350.0

        # 8. Record Dividend with Shariah purification
        div_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/dividends", json={
            "asset_id": asset_id,
            "payment_date": "2024-10-15",
            "dividend_per_share": 5.0,
            "gross_amount": 250.0,
            "withholding_tax": 37.5,
            "zakat_deduction": 0.0,
            "net_amount": 212.5,
            "purification_rate_pct": 2.5,
            "purification_amount": 5.31,
            "currency": "PKR",
            "notes": "Q3 Interim Dividend"
        }, headers=headers)
        assert div_resp.status_code == 201

        # 9. Add Liability (e.g. margin loan)
        liab_resp = await ac.post(f"/api/v1/portfolios/{portfolio_id}/liabilities", json={
            "liability_name": "Broker Margin Loan",
            "liability_type": "other",
            "original_principal": 10000.0,
            "outstanding_balance": 5000.0,
            "interest_rate_annual": 16.5,
            "monthly_payment_emi": 500.0,
            "start_date": "2024-01-01",
            "currency": "PKR"
        }, headers=headers)
        assert liab_resp.status_code == 201

        # 10. Fetch Portfolio Summary
        summary_resp = await ac.get(f"/api/v1/portfolios/{portfolio_id}/summary", headers=headers)
        assert summary_resp.status_code == 200
        summary = summary_resp.json()
        assert summary["portfolio_id"] == portfolio_id
        assert float(summary["total_realized_pnl"]) == 12350.0
        assert float(summary["total_dividend_income"]) == 212.5
        assert float(summary["total_liabilities"]) == 5000.0
        assert "net_worth" in summary

        # 11. Delete Portfolio
        del_resp = await ac.delete(f"/api/v1/portfolios/{portfolio_id}", headers=headers)
        assert del_resp.status_code == 204
