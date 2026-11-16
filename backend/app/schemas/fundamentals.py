from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date

class CompanyProfile(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    market: str = "PK"
    name: str
    sector: str
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    ceo: Optional[str] = None
    employees: Optional[int] = None
    isin: Optional[str] = None
    fiscal_year_end: Optional[str] = None
    is_shariah_compliant: bool = False
    shariah_screening_authority: Optional[str] = None
    current_price: float
    market_cap: float
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield_pct: Optional[float] = None
    shares_outstanding: float = 0

class FinancialScores(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    health_score: float = Field(..., ge=0, le=100, description="Balance sheet solvency & liquidity score")
    quality_score: float = Field(..., ge=0, le=100, description="Profitability & capital efficiency score")
    growth_score: float = Field(..., ge=0, le=100, description="Revenue & earnings growth trajectory score")
    stability_score: float = Field(..., ge=0, le=100, description="Earnings consistency & dividend stability score")
    value_score: float = Field(..., ge=0, le=100, description="Valuation multiple vs historical & peer medians")
    overall_score: float = Field(..., ge=0, le=100, description="Composite weighted fundamental score")
    health_verdict: str
    summary_verdict: str

class DCFValuationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    fcf_base: float = Field(..., description="Base Free Cash Flow (most recent year)")
    growth_rate_stage1: float = Field(default=0.12, description="Projected FCF growth rate for Stage 1 (e.g. 0.12 for 12%)")
    growth_years_stage1: int = Field(default=5, ge=1, le=10)
    growth_rate_stage2: float = Field(default=0.08, description="Projected FCF growth rate for Stage 2 (e.g. 0.08 for 8%)")
    growth_years_stage2: int = Field(default=5, ge=0, le=10)
    discount_rate_wacc: float = Field(default=0.15, gt=0, lt=1, description="Weighted Average Cost of Capital (e.g. 0.15 for 15%)")
    terminal_growth_rate: float = Field(default=0.05, ge=0, lt=0.10, description="Perpetual terminal growth rate (e.g. 0.05 for 5%)")
    cash_and_equivalents: float = Field(default=0)
    total_debt: float = Field(default=0)
    shares_outstanding: float = Field(..., gt=0)

class DCFValuationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    fcf_projections: List[Dict[str, Any]]
    present_value_cash_flows: float
    terminal_value: float
    present_value_terminal_value: float
    enterprise_value: float
    net_debt: float
    equity_value: float
    intrinsic_value_per_share: float
    current_market_price: float
    margin_of_safety_pct: float
    valuation_verdict: str  # "Significantly Undervalued", "Undervalued", "Fairly Valued", "Overvalued"

class PeterLynchValuationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    eps: float
    earnings_growth_rate_pct: float
    fair_value: float
    current_price: float
    peg_ratio: Optional[float] = None
    valuation_verdict: str

class CompanyFundamentalsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    profile: CompanyProfile
    key_ratios: Dict[str, Optional[float]]
    scores: FinancialScores
    dcf: DCFValuationResponse
    peter_lynch: PeterLynchValuationResponse
    annual_income_statements: List[Dict[str, Any]] = []
    annual_balance_sheets: List[Dict[str, Any]] = []
    annual_cash_flows: List[Dict[str, Any]] = []

class PeerComparisonItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    name: str
    price: float
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    roe_pct: Optional[float] = None
    operating_margin_pct: Optional[float] = None
    debt_to_equity: Optional[float] = None
    dividend_yield_pct: Optional[float] = None
    market_cap: float
    is_shariah: bool = False

class PeerComparisonResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_symbol: str
    sector: str
    peers: List[PeerComparisonItem]
