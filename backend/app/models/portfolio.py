import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.models.user import generate_uuid_str, utc_now

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    base_currency = Column(String(10), default="PKR", nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    share_token = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="portfolios")
    assets = relationship("PortfolioAsset", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")
    dividends = relationship("Dividend", back_populates="portfolio", cascade="all, delete-orphan")
    liabilities = relationship("Liability", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioAsset(Base):
    __tablename__ = "portfolio_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # stock, mutual_fund, crypto, forex, commodity, real_estate, cash, etc.
    symbol = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    market = Column(String(20), default="PK", nullable=False)
    currency = Column(String(10), default="PKR", nullable=False)
    quantity = Column(Numeric(24, 8), default=0, nullable=False)
    average_buy_price = Column(Numeric(20, 6), default=0, nullable=False)
    total_cost_basis = Column(Numeric(20, 6), default=0, nullable=False)
    current_market_price = Column(Numeric(20, 6), default=0, nullable=False)
    current_market_value = Column(Numeric(20, 6), default=0, nullable=False)
    unrealized_pnl = Column(Numeric(20, 6), default=0, nullable=False)
    unrealized_pnl_percent = Column(Numeric(10, 4), default=0, nullable=False)
    realized_pnl = Column(Numeric(20, 6), default=0, nullable=False)
    last_price_updated_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    portfolio = relationship("Portfolio", back_populates="assets")
    transactions = relationship("Transaction", back_populates="asset", cascade="all, delete-orphan")
    dividends = relationship("Dividend", back_populates="asset", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("portfolio_id", "asset_type", "symbol", "market", name="uq_portfolio_asset"),
        Index("idx_asset_lookup", "portfolio_id", "symbol", "market"),
    )

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    portfolio_asset_id = Column(String(36), ForeignKey("portfolio_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(30), nullable=False)  # buy, sell, dividend, bonus, split, deposit, withdrawal, fee
    transaction_date = Column(Date, nullable=False, index=True)
    quantity = Column(Numeric(24, 8), nullable=False)
    unit_price = Column(Numeric(20, 6), nullable=False)
    total_amount = Column(Numeric(20, 6), nullable=False)
    fees = Column(Numeric(20, 6), default=0, nullable=False)
    taxes = Column(Numeric(20, 6), default=0, nullable=False)
    net_amount = Column(Numeric(20, 6), nullable=False)
    currency = Column(String(10), default="PKR", nullable=False)
    exchange_rate_to_base = Column(Numeric(18, 8), default=1.0, nullable=False)
    realized_gain_loss = Column(Numeric(20, 6), default=0, nullable=True)
    notes = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("PortfolioAsset", back_populates="transactions")

class Dividend(Base):
    __tablename__ = "dividends"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    portfolio_asset_id = Column(String(36), ForeignKey("portfolio_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    ex_date = Column(Date, nullable=True)
    payment_date = Column(Date, nullable=False)
    dividend_per_share = Column(Numeric(20, 6), nullable=False)
    gross_amount = Column(Numeric(20, 6), nullable=False)
    withholding_tax = Column(Numeric(20, 6), default=0, nullable=False)
    zakat_deduction = Column(Numeric(20, 6), default=0, nullable=False)
    net_amount = Column(Numeric(20, 6), nullable=False)
    purification_rate_pct = Column(Numeric(8, 4), default=0, nullable=True)
    purification_amount = Column(Numeric(20, 6), default=0, nullable=True)
    currency = Column(String(10), default="PKR", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    portfolio = relationship("Portfolio", back_populates="dividends")
    asset = relationship("PortfolioAsset", back_populates="dividends")

class Liability(Base):
    __tablename__ = "liabilities"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    liability_name = Column(String(255), nullable=False)
    liability_type = Column(String(50), nullable=False)  # mortgage, personal_loan, auto_loan, credit_card, other
    original_principal = Column(Numeric(20, 6), nullable=False)
    outstanding_balance = Column(Numeric(20, 6), nullable=False)
    interest_rate_annual = Column(Numeric(8, 4), nullable=False)
    monthly_payment_emi = Column(Numeric(20, 6), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    currency = Column(String(10), default="PKR", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    portfolio = relationship("Portfolio", back_populates="liabilities")
