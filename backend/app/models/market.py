import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Numeric, Text, Integer, JSON, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.models.user import generate_uuid_str, utc_now

class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    symbol = Column(String(50), nullable=False, index=True)
    market = Column(String(20), default="PK", nullable=False, index=True)
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    sector = Column(String(100), nullable=False, index=True)
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    ceo = Column(String(255), nullable=True)
    employees = Column(Integer, nullable=True)
    isin = Column(String(50), nullable=True)
    fiscal_year_end = Column(String(20), nullable=True)
    is_shariah_compliant = Column(Boolean, default=False, nullable=True)
    shariah_screening_authority = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    statements = relationship("FinancialStatement", back_populates="company", cascade="all, delete-orphan")
    ratios = relationship("FinancialRatio", back_populates="company", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("symbol", "market", name="uq_company_symbol_market"),
    )

class HistoricalBar(Base):
    __tablename__ = "historical_bars"

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(50), nullable=False, index=True)
    market = Column(String(20), nullable=False, index=True)
    resolution = Column(String(10), nullable=False)  # 1m, 5m, 15m, 1h, 1D, 1W, 1M
    bar_time = Column(DateTime(timezone=True), nullable=False, index=True)
    open_price = Column(Numeric(20, 6), nullable=False)
    high_price = Column(Numeric(20, 6), nullable=False)
    low_price = Column(Numeric(20, 6), nullable=False)
    close_price = Column(Numeric(20, 6), nullable=False)
    volume = Column(Numeric(24, 4), default=0, nullable=False)
    value_traded = Column(Numeric(24, 4), default=0, nullable=True)
    source = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("symbol", "market", "resolution", "bar_time", name="uq_historical_bar"),
        Index("idx_bars_time_lookup", "symbol", "market", "resolution", "bar_time"),
    )

class FinancialStatement(Base):
    __tablename__ = "financial_statements"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    statement_type = Column(String(30), nullable=False)  # income_statement, balance_sheet, cash_flow
    period_type = Column(String(20), nullable=False)     # annual, quarterly
    fiscal_year = Column(Integer, nullable=False)
    fiscal_period = Column(String(10), nullable=False)   # Q1, Q2, Q3, FY
    filing_date = Column(Date, nullable=False)
    currency = Column(String(10), default="PKR", nullable=False)
    data = Column(JSON, nullable=False)                  # Statement line items stored as JSON
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    company = relationship("Company", back_populates="statements")

    __table_args__ = (
        UniqueConstraint("company_id", "statement_type", "fiscal_year", "fiscal_period", name="uq_statement"),
    )

class FinancialRatio(Base):
    __tablename__ = "financial_ratios"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    as_of_date = Column(Date, nullable=False, index=True)
    pe_ratio = Column(Numeric(10, 4), nullable=True)
    pb_ratio = Column(Numeric(10, 4), nullable=True)
    ps_ratio = Column(Numeric(10, 4), nullable=True)
    roe_pct = Column(Numeric(10, 4), nullable=True)
    roa_pct = Column(Numeric(10, 4), nullable=True)
    roce_pct = Column(Numeric(10, 4), nullable=True)
    net_profit_margin_pct = Column(Numeric(10, 4), nullable=True)
    operating_margin_pct = Column(Numeric(10, 4), nullable=True)
    gross_margin_pct = Column(Numeric(10, 4), nullable=True)
    debt_to_equity = Column(Numeric(10, 4), nullable=True)
    current_ratio = Column(Numeric(10, 4), nullable=True)
    quick_ratio = Column(Numeric(10, 4), nullable=True)
    interest_coverage = Column(Numeric(10, 4), nullable=True)
    dividend_yield_pct = Column(Numeric(10, 4), nullable=True)
    dividend_payout_pct = Column(Numeric(10, 4), nullable=True)
    health_score = Column(Numeric(5, 2), nullable=True)    # 0 to 100
    quality_score = Column(Numeric(5, 2), nullable=True)   # 0 to 100
    growth_score = Column(Numeric(5, 2), nullable=True)    # 0 to 100
    stability_score = Column(Numeric(5, 2), nullable=True) # 0 to 100
    value_score = Column(Numeric(5, 2), nullable=True)     # 0 to 100
    estimated_intrinsic_dcf = Column(Numeric(20, 6), nullable=True)
    peter_lynch_fair_value = Column(Numeric(20, 6), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    company = relationship("Company", back_populates="ratios")

    __table_args__ = (
        UniqueConstraint("company_id", "as_of_date", name="uq_company_ratios_date"),
    )
