import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Numeric, Text, Integer, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.models.user import generate_uuid_str, utc_now

class MutualFund(Base):
    __tablename__ = "mutual_funds"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    fund_symbol = Column(String(50), unique=True, nullable=False, index=True)
    fund_name = Column(String(255), nullable=False)
    amc_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    shariah_status = Column(String(50), default="Conventional", nullable=False)
    inception_date = Column(Date, nullable=True)
    currency = Column(String(10), default="PKR", nullable=False)
    expense_ratio_pct = Column(Numeric(6, 4), nullable=True)
    latest_nav = Column(Numeric(18, 6), nullable=False)
    nav_date = Column(Date, nullable=False, index=True)
    aum_pkr = Column(Numeric(24, 2), nullable=True)
    aum_date = Column(Date, nullable=True)
    ytd_return_pct = Column(Numeric(10, 4), nullable=True)
    one_year_return_pct = Column(Numeric(10, 4), nullable=True)
    three_year_return_pct = Column(Numeric(10, 4), nullable=True)
    five_year_return_pct = Column(Numeric(10, 4), nullable=True)
    dividend_yield_pct = Column(Numeric(8, 4), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    nav_history = relationship("FundNAVHistory", back_populates="fund", cascade="all, delete-orphan")

class FundNAVHistory(Base):
    __tablename__ = "fund_nav_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fund_id = Column(String(36), ForeignKey("mutual_funds.id", ondelete="CASCADE"), nullable=False, index=True)
    nav_date = Column(Date, nullable=False, index=True)
    nav = Column(Numeric(18, 6), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    fund = relationship("MutualFund", back_populates="nav_history")

    __table_args__ = (
        UniqueConstraint("fund_id", "nav_date", name="uq_fund_nav_date"),
    )
