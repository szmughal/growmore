from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date

# ----------------- SHARIAH & WEALTH -----------------

class ZakatCalculatorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    cash_in_hand_and_banks: float = Field(default=0.0, ge=0)
    gold_value_or_grams: float = Field(default=0.0, ge=0)
    silver_value_or_grams: float = Field(default=0.0, ge=0)
    shares_market_value: float = Field(default=0.0, ge=0)
    mutual_funds_value: float = Field(default=0.0, ge=0)
    business_goods_and_inventory: float = Field(default=0.0, ge=0)
    receivables_due: float = Field(default=0.0, ge=0)
    other_liquid_assets: float = Field(default=0.0, ge=0)
    immediate_debts_and_liabilities: float = Field(default=0.0, ge=0)
    custom_silver_nisab_pkr: Optional[float] = None  # If None, defaults to current ~215,000 PKR

class ZakatCalculatorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_gross_assets: float
    total_deductible_liabilities: float
    net_zakatable_wealth: float
    nisab_threshold_pkr: float
    is_zakat_due: bool
    zakat_rate_percent: float = 2.5
    zakat_payable_pkr: float
    asset_breakdown_percentages: Dict[str, float]

class DividendPurificationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    dividend_gross_amount: float = Field(..., gt=0)
    custom_purification_rate_pct: Optional[float] = None  # e.g. 2.5%

class DividendPurificationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    dividend_gross_amount: float
    purification_rate_pct: float
    purification_amount_to_charity: float
    net_halal_dividend: float
    source: str

class ShariahScripRate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    company_name: str
    is_shariah_compliant: bool
    purification_rate_pct: float
    screening_source: str
    last_reviewed: str

# ----------------- WEALTH & RETIREMENT -----------------

class SIPCalculatorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    monthly_investment: float = Field(..., gt=0)
    expected_annual_return_pct: float = Field(..., ge=0, le=100)
    time_period_years: int = Field(..., ge=1, le=50)
    annual_step_up_pct: float = Field(default=0.0, ge=0, le=50)

class SIPYearlyBreakdown(BaseModel):
    year: int
    yearly_investment: float
    cumulative_investment: float
    interest_earned: float
    future_value: float

class SIPCalculatorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_amount_invested: float
    estimated_returns: float
    total_wealth_accumulated: float
    wealth_gain_ratio: float
    yearly_schedule: List[SIPYearlyBreakdown]

class CompoundInterestRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    principal_amount: float = Field(..., gt=0)
    annual_interest_rate_pct: float = Field(..., ge=0)
    time_period_years: float = Field(..., gt=0)
    compounding_frequency_per_year: int = Field(default=12, ge=1)  # 1=annual, 4=quarterly, 12=monthly

class CompoundInterestResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    principal_amount: float
    total_interest_earned: float
    final_future_value: float
    effective_annual_rate_pct: float

class CAGRRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    beginning_value: float = Field(..., gt=0)
    ending_value: float = Field(..., gt=0)
    time_period_years: float = Field(..., gt=0)

class CAGRResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    beginning_value: float
    ending_value: float
    time_period_years: float
    cagr_percent: float
    total_percentage_growth: float

class ROIRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    initial_investment: float = Field(..., gt=0)
    final_return: float = Field(..., ge=0)
    investment_period_years: float = Field(default=1.0, gt=0)
    transaction_fees: float = Field(default=0.0, ge=0)

class ROIResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    net_profit: float
    roi_percent: float
    annualized_roi_percent: float

class FIRECalculatorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    current_age: int = Field(..., ge=18, le=90)
    current_net_worth: float = Field(default=0.0, ge=0)
    monthly_expenses: float = Field(..., gt=0)
    monthly_savings_investment: float = Field(..., ge=0)
    expected_annual_return_pct: float = Field(default=10.0, ge=0)
    safe_withdrawal_rate_pct: float = Field(default=4.0, gt=0, le=10)
    annual_inflation_pct: float = Field(default=7.0, ge=0)

class FIRECalculatorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    annual_expenses: float
    lean_fire_target: float
    standard_fire_target: float
    fat_fire_target: float
    projected_years_to_fire: Optional[float] = None
    projected_fire_age: Optional[int] = None
    is_fire_achieved: bool

class GoalPlannerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_amount: float = Field(..., gt=0)
    time_horizon_years: int = Field(..., ge=1, le=50)
    expected_annual_return_pct: float = Field(default=12.0, ge=0)
    current_savings: float = Field(default=0.0, ge=0)

class GoalPlannerResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_amount: float
    time_horizon_years: int
    required_monthly_investment: float
    total_investment_contributed: float
    expected_interest_accumulated: float

class NetWorthCalculatorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    liquid_cash_and_banks: float = Field(default=0.0, ge=0)
    equities_and_stocks: float = Field(default=0.0, ge=0)
    mutual_funds: float = Field(default=0.0, ge=0)
    cryptocurrency: float = Field(default=0.0, ge=0)
    bullion_precious_metals: float = Field(default=0.0, ge=0)
    real_estate_properties: float = Field(default=0.0, ge=0)
    vehicles_and_personal_assets: float = Field(default=0.0, ge=0)
    mortgage_loans: float = Field(default=0.0, ge=0)
    car_loans: float = Field(default=0.0, ge=0)
    credit_card_debt: float = Field(default=0.0, ge=0)
    other_liabilities: float = Field(default=0.0, ge=0)

class NetWorthCalculatorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_assets: float
    total_liabilities: float
    net_worth: float
    debt_to_asset_ratio_pct: float
    financial_health_status: str

# ----------------- BANKING & DEBT -----------------

class LoanEMIRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    loan_amount: float = Field(..., gt=0)
    annual_interest_rate_pct: float = Field(..., ge=0)
    loan_tenure_months: int = Field(..., ge=1, le=480)

class EMIMonthlySchedule(BaseModel):
    month: int
    principal_payment: float
    interest_payment: float
    total_emi: float
    remaining_balance: float

class LoanEMIResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    monthly_emi: float
    total_principal: float
    total_interest: float
    total_amount_payable: float
    interest_to_principal_ratio: float
    yearly_schedule: List[EMIMonthlySchedule]

class AssetDepreciationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    initial_asset_cost: float = Field(..., gt=0)
    salvage_value: float = Field(default=0.0, ge=0)
    useful_life_years: int = Field(..., ge=1, le=50)
    method: str = Field(default="straight_line", description="straight_line, declining_balance")
    declining_rate_pct: Optional[float] = None

class DepreciationYearlySchedule(BaseModel):
    year: int
    depreciation_expense: float
    accumulated_depreciation: float
    book_value: float

class AssetDepreciationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    initial_cost: float
    salvage_value: float
    useful_life_years: int
    method: str
    schedule: List[DepreciationYearlySchedule]

# ----------------- TRADING & RISK -----------------

class PivotCalculatorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    high: float = Field(..., gt=0)
    low: float = Field(..., gt=0)
    close: float = Field(..., gt=0)
    open: Optional[float] = None

class PivotCalculatorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    standard: Dict[str, float]
    fibonacci: Dict[str, float]
    camarilla: Dict[str, float]
    woodie: Dict[str, float]

class StockPositionSizeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    account_capital: float = Field(..., gt=0)
    risk_percentage: float = Field(..., gt=0, le=10)  # e.g. 1% or 2%
    entry_price: float = Field(..., gt=0)
    stop_loss_price: float = Field(..., gt=0)

class StockPositionSizeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    risk_amount_pkr: float
    risk_per_share: float
    recommended_shares: int
    total_position_value: float
    capital_allocation_pct: float

class ForexPositionSizeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    account_balance: float = Field(..., gt=0)
    risk_percentage: float = Field(..., gt=0, le=10)
    stop_loss_pips: float = Field(..., gt=0)
    pair: str = Field(default="EURUSD")

class ForexPositionSizeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    amount_at_risk: float
    recommended_standard_lots: float
    recommended_mini_lots: float
    recommended_micro_lots: float

class DrawdownRecoveryRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    drawdown_percentage: float = Field(..., gt=0, lt=100)

class DrawdownRecoveryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    drawdown_percentage: float
    required_gain_to_breakeven_pct: float
    difficulty_rating: str

class PipValueRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pair: str = "EURUSD"
    trade_size_lots: float = Field(default=1.0, gt=0)
    account_currency: str = "USD"
    exchange_rate: Optional[float] = None

class PipValueResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pair: str
    trade_size_lots: float
    pip_value_in_account_currency: float
    account_currency: str

# ----------------- CURRENCY & BULLION -----------------

class CurrencyConvertRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_currency: str = Field(..., max_length=5)
    to_currency: str = Field(..., max_length=5)
    amount: float = Field(..., gt=0)

class CurrencyConvertResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_currency: str
    to_currency: str
    original_amount: float
    exchange_rate: float
    converted_amount: float
    as_of: str

class BullionConvertRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    metal: str = Field(default="gold", description="gold or silver")
    karat: int = Field(default=24, ge=18, le=24)
    weight: float = Field(..., gt=0)
    unit: str = Field(default="tola", description="tola, gram, ounce, ratti, masha")
    use_official_sarafa_rate: bool = True

class BullionConvertResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    metal: str
    karat: int
    input_weight: float
    input_unit: str
    weight_in_grams: float
    weight_in_tolas: float
    weight_in_troy_ounces: float
    total_price_pkr: float
    rate_per_tola_pkr: float
    rate_per_gram_pkr: float
    pricing_source: str
