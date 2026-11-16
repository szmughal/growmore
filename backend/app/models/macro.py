import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Numeric, Text, Integer, UniqueConstraint, Index
)
from backend.app.db.session import Base
from backend.app.models.user import generate_uuid_str, utc_now

class MacroIndicatorRecord(Base):
    __tablename__ = "macro_indicators"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    indicator_code = Column(String(50), nullable=False, index=True)
    indicator_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    country_code = Column(String(10), default="PK", nullable=False)
    report_date = Column(Date, nullable=False, index=True)
    reported_value = Column(Numeric(20, 6), nullable=False)
    previous_value = Column(Numeric(20, 6), nullable=True)
    unit = Column(String(50), nullable=False)
    data_frequency = Column(String(30), nullable=False)
    source_agency = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("indicator_code", "report_date", name="uq_macro_indicator"),
    )

class CorporateAnnouncementRecord(Base):
    __tablename__ = "corporate_announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    market = Column(String(20), default="PK", nullable=False, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    company_name = Column(String(255), nullable=True)
    title = Column(Text, nullable=False)
    category = Column(String(100), default="corporate_notice", nullable=False)
    announced_at = Column(DateTime(timezone=True), nullable=False, index=True)
    date_text = Column(String(20), nullable=True)
    time_text = Column(String(20), nullable=True)
    pdf_url = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    external_id = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("market", "external_id", name="uq_announcement_ext"),
    )
