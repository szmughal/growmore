import pytest
import uuid
from decimal import Decimal
from datetime import date, datetime, timezone
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal, init_db, engine, Base
from backend.app.db.seeder import seed_database
from backend.app.models.user import User, UserSettings
from backend.app.models.portfolio import Portfolio, PortfolioAsset, Transaction, Dividend, Liability
from backend.app.models.market import Company, FinancialStatement, FinancialRatio, HistoricalBar
from backend.app.models.funds import MutualFund, FundNAVHistory
from backend.app.models.macro import MacroIndicatorRecord, CorporateAnnouncementRecord
from backend.app.models.tools import Watchlist, WatchlistItem, PriceAlert
from backend.app.models.admin import APILog, AuditRecord

@pytest.mark.asyncio
async def test_database_initialization_and_seeder():
    # 1. Initialize DB tables
    await init_db()

    # Verify Base metadata contains all 20 tables
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {
        "users", "user_settings", "portfolios", "portfolio_assets",
        "transactions", "dividends", "liabilities", "companies",
        "historical_bars", "financial_statements", "financial_ratios",
        "mutual_funds", "fund_nav_history", "macro_indicators",
        "corporate_announcements", "watchlists", "watchlist_items",
        "price_alerts", "api_logs", "audit_records"
    }
    for expected in expected_tables:
        assert expected in table_names, f"Table '{expected}' missing from database metadata!"

    # 2. Run Database Seeder
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    # 3. Verify Seeded Records
    async with AsyncSessionLocal() as session:
        admin_res = await session.execute(select(User).filter_by(email="admin@growmore.app"))
        admin = admin_res.scalars().first()
        assert admin is not None
        assert admin.role == "superadmin"

        demo_res = await session.execute(select(User).filter_by(email="investor@growmore.app"))
        demo = demo_res.scalars().first()
        assert demo is not None
        assert demo.country_code == "PK"

        # Check Portfolio
        port_res = await session.execute(select(Portfolio).filter_by(user_id=demo.id))
        port = port_res.scalars().first()
        assert port is not None
        assert port.base_currency == "PKR"

        # Check Assets
        assets_res = await session.execute(select(PortfolioAsset).filter_by(portfolio_id=port.id))
        assets = assets_res.scalars().all()
        assert len(assets) == 3  # OGDC, MIIF, GOLD

        # Check Companies
        comp_res = await session.execute(select(Company).filter_by(symbol="OGDC"))
        ogdc = comp_res.scalars().first()
        assert ogdc is not None
        assert ogdc.is_shariah_compliant is True

        # Check Mutual Funds
        mf_res = await session.execute(select(MutualFund).filter_by(fund_symbol="MIIF"))
        miif = mf_res.scalars().first()
        assert miif is not None
        assert miif.latest_nav > 0

@pytest.mark.asyncio
async def test_user_cascade_deletion():
    async with AsyncSessionLocal() as session:
        test_email = f"test_delete_{uuid.uuid4().hex[:6]}@growmore.app"
        user = User(
            email=test_email,
            hashed_password="mockhashedpassword123",
            full_name="Temporary User"
        )
        session.add(user)
        await session.flush()

        settings = UserSettings(
            user_id=user.id,
            base_currency="USD",
            theme_mode="light"
        )
        session.add(settings)
        await session.commit()

        # Delete user
        await session.delete(user)
        await session.commit()

        # Check settings also deleted (cascade)
        st_res = await session.execute(select(UserSettings).filter_by(user_id=user.id))
        assert st_res.scalars().first() is None

@pytest.mark.asyncio
async def test_financial_decimal_precision():
    """Verify that financial quantities and transaction amounts maintain exact precision."""
    async with AsyncSessionLocal() as session:
        test_email = f"precision_{uuid.uuid4().hex[:6]}@growmore.app"
        user = User(
            email=test_email,
            hashed_password="mockhashprecision",
            full_name="Precision Tester"
        )
        session.add(user)
        await session.flush()

        port = Portfolio(
            user_id=user.id,
            name="Precision Test Portfolio",
            base_currency="PKR"
        )
        session.add(port)
        await session.flush()

        # Fractional crypto quantity (e.g. 0.12345678 BTC)
        asset = PortfolioAsset(
            portfolio_id=port.id,
            asset_type="crypto",
            symbol="BTC",
            name="Bitcoin",
            market="CRYPTO",
            currency="USD",
            quantity=Decimal("0.12345678"),
            average_buy_price=Decimal("64350.250000"),
            total_cost_basis=Decimal("7944.475904")
        )
        session.add(asset)
        await session.flush()

        tx = Transaction(
            portfolio_id=port.id,
            portfolio_asset_id=asset.id,
            transaction_type="buy",
            transaction_date=date(2026, 11, 14),
            quantity=Decimal("0.12345678"),
            unit_price=Decimal("64350.250000"),
            total_amount=Decimal("7944.475904"),
            net_amount=Decimal("7944.475904"),
            currency="USD",
            exchange_rate_to_base=Decimal("276.35000000")
        )
        session.add(tx)
        await session.commit()

        # Re-fetch from DB and verify exact decimal equality
        tx_fetched = await session.execute(select(Transaction).filter_by(id=tx.id))
        stored_tx = tx_fetched.scalars().first()
        assert stored_tx is not None
        assert stored_tx.quantity == Decimal("0.12345678")
        assert stored_tx.unit_price == Decimal("64350.250000")
        assert stored_tx.total_amount == Decimal("7944.475904")
