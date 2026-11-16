from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MacroIndicator(BaseModel):
    code: str
    name: str
    category: str  # "monetary_policy", "inflation", "external_sector", "fiscal", "national_accounts"
    country_code: str = "PK"
    reported_value: float
    previous_value: Optional[float] = None
    unit: str
    report_date: str
    data_frequency: str  # "Monthly", "Quarterly", "Annual"
    source_agency: str  # "State Bank of Pakistan", "Pakistan Bureau of Statistics"
    trend_direction: str = "flat"  # "up", "down", "flat"

class SBPPolicyRegimeDecision(BaseModel):
    date: str
    rate: float

class SBPPolicyRegimes(BaseModel):
    market: str = "PK"
    rate_name: str = "SBP Policy (Target) Rate"
    current_rate: float
    decisions: List[SBPPolicyRegimeDecision] = []
    source: str = "State Bank of Pakistan"
    last_updated: str

class EconomicEvent(BaseModel):
    id: int
    date: str
    title: str
    category: str
    country_code: str = "PK"
    note: Optional[str] = None
    source_url: Optional[str] = None

class MacroSnapshot(BaseModel):
    country: str = "Pakistan"
    policy_rate: SBPPolicyRegimes
    indicators: List[MacroIndicator] = []
    upcoming_events: List[EconomicEvent] = []
    source: str = "State Bank of Pakistan & Pakistan Bureau of Statistics"
    generated_at: str
