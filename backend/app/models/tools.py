import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Numeric, Text, Integer, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.models.user import generate_uuid_str, utc_now

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    watchlist_id = Column(String(36), ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # stock, crypto, fund, commodity, forex
    symbol = Column(String(50), nullable=False, index=True)
    market = Column(String(20), default="PK", nullable=False)
    added_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    watchlist = relationship("Watchlist", back_populates="items")

    __table_args__ = (
        UniqueConstraint("watchlist_id", "asset_type", "symbol", "market", name="uq_watchlist_item"),
    )

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    market = Column(String(20), default="PK", nullable=False)
    condition = Column(String(20), nullable=False)  # above, below, percent_gain_day, percent_loss_day, 52w_high, 52w_low
    threshold_value = Column(Numeric(20, 6), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_triggered = Column(Boolean, default=False, nullable=False)
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="price_alerts")
