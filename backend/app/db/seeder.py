import asyncio
import logging
from datetime import datetime, date, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal, init_db
from backend.app.models.user import User, UserSettings
from backend.app.models.portfolio import Portfolio, PortfolioAsset, Transaction, Dividend, Liability
from backend.app.models.market import Company, FinancialRatio, FinancialStatement
from backend.app.models.funds import MutualFund, FundNAVHistory
from backend.app.models.macro import MacroIndicatorRecord
from backend.app.models.tools import Watchlist, WatchlistItem, PriceAlert

logger = logging.getLogger(__name__)

async def seed_database(session: AsyncSession):
    """Seeds baseline data required for initial system operation."""

    # 1. Check if already seeded
    existing_user = await session.execute(select(User).filter_by(email="admin@growmore.app"))
    if existing_user.scalars().first():
        logger.info("Database already seeded. Skipping initial seeding.")
        return

    logger.info("Starting baseline financial database seeding...")

    # 2. Seed Admin & Demo Users
    admin_user = User(
        email="admin@growmore.app",
        hashed_password="pbkdf2_sha256$mockhash$adminpassword", # Will be replaced with bcrypt in Auth Phase
        full_name="System Administrator",
        role="superadmin",
        is_active=True,
        is_verified=True
    )
    demo_user = User(
        email="investor@growmore.app",
        hashed_password="pbkdf2_sha256$mockhash$investorpassword",
        full_name="Fatima Khan",
        role="user",
        is_active=True,
        is_verified=True,
        country_code="PK"
    )
    session.add_all([admin_user, demo_user])
    await session.flush()

    # User Settings
    demo_settings = UserSettings(
        user_id=demo_user.id,
        base_currency="PKR",
        theme_mode="dark",
        color_palette="emerald",
        default_market="PK"
    )
    admin_settings = UserSettings(
        user_id=admin_user.id,
        base_currency="PKR",
        theme_mode="system",
        color_palette="default",
        default_market="PK"
    )
    session.add_all([demo_settings, admin_settings])

    # 3. Seed Demo Portfolio
    portfolio = Portfolio(
        user_id=demo_user.id,
        name="Long-Term Wealth & Growth",
        description="Core equity, mutual funds, and bullion portfolio",
        base_currency="PKR",
        is_primary=True,
        is_public=False
    )
    session.add(portfolio)
    await session.flush()

    # Portfolio Assets
    ogdc_asset = PortfolioAsset(
        portfolio_id=portfolio.id,
        asset_type="stock",
        symbol="OGDC",
        name="Oil & Gas Development Company",
        market="PK",
        currency="PKR",
        quantity=5000,
        average_buy_price=280.50,
        total_cost_basis=1402500.0,
        current_market_price=315.87,
        current_market_value=1579350.0,
        unrealized_pnl=176850.0,
        unrealized_pnl_percent=12.61,
        realized_pnl=0.0
    )
    miif_asset = PortfolioAsset(
        portfolio_id=portfolio.id,
        asset_type="mutual_fund",
        symbol="MIIF",
        name="Meezan Islamic Income Fund",
        market="PK",
        currency="PKR",
        quantity=15000,
        average_buy_price=54.20,
        total_cost_basis=813000.0,
        current_market_price=56.241,
        current_market_value=843615.0,
        unrealized_pnl=30615.0,
        unrealized_pnl_percent=3.76,
        realized_pnl=0.0
    )
    gold_asset = PortfolioAsset(
        portfolio_id=portfolio.id,
        asset_type="commodity",
        symbol="GOLD_24K_TOLA",
        name="Physical Gold 24K (Bars)",
        market="COMMODITY",
        currency="PKR",
        quantity=3.0,
        average_buy_price=380000.0,
        total_cost_basis=1140000.0,
        current_market_price=403197.0,
        current_market_value=1209591.0,
        unrealized_pnl=69591.0,
        unrealized_pnl_percent=6.10,
        realized_pnl=0.0
    )
    session.add_all([ogdc_asset, miif_asset, gold_asset])
    await session.flush()

    # Initial Transactions
    t1 = Transaction(
        portfolio_id=portfolio.id,
        portfolio_asset_id=ogdc_asset.id,
        transaction_type="buy",
        transaction_date=date(2026, 8, 15),
        quantity=5000,
        unit_price=280.50,
        total_amount=1402500.0,
        fees=701.25,
        taxes=0.0,
        net_amount=1403201.25,
        currency="PKR",
        exchange_rate_to_base=1.0
    )
    session.add(t1)

    # 4. Seed Core Companies
    companies = [
        Company(
            symbol="OGDC",
            market="PK",
            name="Oil & Gas Development Company Limited",
            sector="Oil & Gas Exploration",
            industry="Oil & Gas Extraction",
            description="The largest oil and gas exploration company in Pakistan.",
            is_shariah_compliant=True,
            shariah_screening_authority="Meezan Shariah Board",
            is_active=True
        ),
        Company(
            symbol="SYS",
            market="PK",
            name="Systems Limited",
            sector="Technology & Communication",
            industry="IT Services & Consulting",
            description="Premier global technology consulting firm.",
            is_shariah_compliant=True,
            shariah_screening_authority="Meezan Shariah Board",
            is_active=True
        ),
        Company(
            symbol="ENGRO",
            market="PK",
            name="Engro Corporation",
            sector="Fertilizer / Conglomerates",
            industry="Diversified Chemicals & Energy",
            description="Leading Pakistani conglomerate with subsidiaries in energy and agriculture.",
            is_shariah_compliant=True,
            shariah_screening_authority="Meezan Shariah Board",
            is_active=True
        ),
        Company(
            symbol="AAPL",
            market="US",
            name="Apple Inc.",
            sector="Technology",
            industry="Consumer Electronics",
            description="Global technology leader in hardware, software, and cloud services.",
            is_active=True
        ),
        Company(
            symbol="2222",
            market="SA",
            name="Saudi Arabian Oil Co. (Aramco)",
            sector="Energy",
            industry="Integrated Oil & Gas",
            description="One of the largest integrated energy and chemicals companies in the world.",
            is_active=True
        )
    ]
    session.add_all(companies)
    await session.flush()

    # Core Financial Ratios for OGDC
    ogdc_ratios = FinancialRatio(
        company_id=companies[0].id,
        as_of_date=date(2026, 9, 30),
        pe_ratio=5.8,
        pb_ratio=1.2,
        roe_pct=24.5,
        roa_pct=16.8,
        debt_to_equity=0.05,
        current_ratio=3.8,
        dividend_yield_pct=7.9,
        health_score=88.5,
        quality_score=92.0,
        growth_score=78.0,
        stability_score=85.0,
        value_score=90.0,
        estimated_intrinsic_dcf=365.0,
        peter_lynch_fair_value=385.0
    )
    session.add(ogdc_ratios)

    # 5. Seed Core Mutual Funds
    mf1 = MutualFund(
        fund_symbol="MIIF",
        fund_name="Meezan Islamic Income Fund",
        amc_name="Al Meezan Investment Management",
        category="Shariah Compliant Income",
        shariah_status="Shariah Compliant",
        inception_date=date(2007, 1, 15),
        currency="PKR",
        expense_ratio_pct=1.45,
        latest_nav=56.2410,
        nav_date=date.today(),
        aum_pkr=85400000000.0,
        ytd_return_pct=18.2,
        one_year_return_pct=18.5,
        dividend_yield_pct=18.2
    )
    mf2 = MutualFund(
        fund_symbol="AGHP",
        fund_name="Alfalah GHP Cash Fund",
        amc_name="Alfalah Asset Management",
        category="Money Market",
        shariah_status="Conventional",
        inception_date=date(2010, 3, 12),
        currency="PKR",
        expense_ratio_pct=1.25,
        latest_nav=512.4500,
        nav_date=date.today(),
        aum_pkr=42300000000.0,
        ytd_return_pct=17.5,
        one_year_return_pct=17.8,
        dividend_yield_pct=17.5
    )
    session.add_all([mf1, mf2])

    # 6. Seed Macro Indicators
    macro_items = [
        MacroIndicatorRecord(
            indicator_code="CPI_INFLATION_YOY",
            indicator_name="Headline Inflation (CPI YoY)",
            category="inflation",
            country_code="PK",
            report_date=date(2026, 10, 31),
            reported_value=7.2,
            previous_value=6.9,
            unit="%",
            data_frequency="Monthly",
            source_agency="Pakistan Bureau of Statistics"
        ),
        MacroIndicatorRecord(
            indicator_code="SBP_POLICY_RATE",
            indicator_name="SBP Policy Rate",
            category="monetary_policy",
            country_code="PK",
            report_date=date(2026, 11, 4),
            reported_value=15.0,
            previous_value=17.5,
            unit="%",
            data_frequency="Periodic (MPC Meetings)",
            source_agency="State Bank of Pakistan"
        )
    ]
    session.add_all(macro_items)

    await session.commit()
    logger.info("Baseline database seeding completed successfully.")
