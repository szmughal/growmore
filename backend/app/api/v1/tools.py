from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Dict, Any

from backend.app.schemas.tools import (
    ZakatCalculatorRequest, ZakatCalculatorResponse,
    DividendPurificationRequest, DividendPurificationResponse, ShariahScripRate,
    SIPCalculatorRequest, SIPCalculatorResponse,
    CompoundInterestRequest, CompoundInterestResponse,
    CAGRRequest, CAGRResponse,
    ROIRequest, ROIResponse,
    FIRECalculatorRequest, FIRECalculatorResponse,
    GoalPlannerRequest, GoalPlannerResponse,
    NetWorthCalculatorRequest, NetWorthCalculatorResponse,
    LoanEMIRequest, LoanEMIResponse,
    AssetDepreciationRequest, AssetDepreciationResponse,
    PivotCalculatorRequest, PivotCalculatorResponse,
    StockPositionSizeRequest, StockPositionSizeResponse,
    ForexPositionSizeRequest, ForexPositionSizeResponse,
    DrawdownRecoveryRequest, DrawdownRecoveryResponse,
    PipValueRequest, PipValueResponse,
    CurrencyConvertRequest, CurrencyConvertResponse,
    BullionConvertRequest, BullionConvertResponse
)
from backend.app.services.calculator_engine import calculator_engine

router = APIRouter(prefix="/tools", tags=["Financial Calculators & Wealth Tools"])

# 1. Zakat Calculator
@router.post("/zakat", response_model=ZakatCalculatorResponse)
async def calculate_zakat(payload: ZakatCalculatorRequest):
    """Calculate Zakat liability with live Nisab threshold and multi-asset breakdown."""
    return calculator_engine.calculate_zakat(payload)

# 2. Dividend Purification
@router.post("/purification", response_model=DividendPurificationResponse)
async def calculate_dividend_purification(payload: DividendPurificationRequest):
    """Calculate Shariah non-compliant dividend purification percentage and amount for charity."""
    return calculator_engine.calculate_dividend_purification(payload)

# 3. Shariah Scrip Rate Directory
@router.get("/shariah-rates", response_model=List[ShariahScripRate])
async def get_shariah_rates():
    """Retrieve published directory of Meezan Shariah-compliant scrips and purification rates."""
    return calculator_engine.get_shariah_rates()

# 4. SIP Wealth Accumulator
@router.post("/sip", response_model=SIPCalculatorResponse)
async def calculate_sip(payload: SIPCalculatorRequest):
    """Calculate monthly Systematic Investment Plan (SIP) returns with annual step-up escalation."""
    return calculator_engine.calculate_sip(payload)

# 5. Compound Interest
@router.post("/compound-interest", response_model=CompoundInterestResponse)
async def calculate_compound_interest(payload: CompoundInterestRequest):
    """Calculate compound interest future value and effective annual rate (EAR)."""
    return calculator_engine.calculate_compound_interest(payload)

# 6. CAGR
@router.post("/cagr", response_model=CAGRResponse)
async def calculate_cagr(payload: CAGRRequest):
    """Calculate Compound Annual Growth Rate across multiple holding years."""
    return calculator_engine.calculate_cagr(payload)

# 7. ROI & Annualized Return
@router.post("/roi", response_model=ROIResponse)
async def calculate_roi(payload: ROIRequest):
    """Calculate net profit, total ROI %, and annualized return net of fees."""
    return calculator_engine.calculate_roi(payload)

# 8. FIRE Planner
@router.post("/fire", response_model=FIRECalculatorResponse)
async def calculate_fire(payload: FIRECalculatorRequest):
    """Calculate Lean, Standard, and Fat Financial Independence targets and projected retirement age."""
    return calculator_engine.calculate_fire(payload)

# 9. Financial Goal Planner
@router.post("/goal-planner", response_model=GoalPlannerResponse)
async def calculate_goal_planner(payload: GoalPlannerRequest):
    """Calculate required monthly savings contribution to achieve target wealth goal."""
    return calculator_engine.calculate_goal_planner(payload)

# 10. Net Worth & Personal Balance Sheet
@router.post("/net-worth", response_model=NetWorthCalculatorResponse)
async def calculate_net_worth(payload: NetWorthCalculatorRequest):
    """Compute total assets, total debt, net worth, and financial leverage health status."""
    return calculator_engine.calculate_net_worth(payload)

# 11. Loan EMI & Mortgage Calculator
@router.post("/loan-emi", response_model=LoanEMIResponse)
async def calculate_loan_emi(payload: LoanEMIRequest):
    """Compute monthly reducing-balance EMI and detailed amortization schedule."""
    return calculator_engine.calculate_loan_emi(payload)

# 12. Asset Depreciation
@router.post("/depreciation", response_model=AssetDepreciationResponse)
async def calculate_depreciation(payload: AssetDepreciationRequest):
    """Calculate straight-line or declining balance annual depreciation schedule."""
    return calculator_engine.calculate_depreciation(payload)

# 13. Pivot Point Calculator
@router.post("/pivots", response_model=PivotCalculatorResponse)
async def calculate_pivots(payload: PivotCalculatorRequest):
    """Compute Standard, Fibonacci, Camarilla, and Woodie trading pivot levels."""
    return calculator_engine.calculate_all_pivots(payload)

# 14. Stock Position Sizing
@router.post("/stock-position-size", response_model=StockPositionSizeResponse)
async def calculate_stock_position_size(payload: StockPositionSizeRequest):
    """Calculate risk-calibrated share quantity based on account capital and stop loss."""
    return calculator_engine.calculate_stock_position_size(payload)

# 15. Forex Position Sizing
@router.post("/forex-position-size", response_model=ForexPositionSizeResponse)
async def calculate_forex_position_size(payload: ForexPositionSizeRequest):
    """Calculate standard, mini, and micro forex lot sizing based on stop-loss in pips."""
    return calculator_engine.calculate_forex_position_size(payload)

# 16. Drawdown & Recovery
@router.post("/drawdown-recovery", response_model=DrawdownRecoveryResponse)
async def calculate_drawdown_recovery(payload: DrawdownRecoveryRequest):
    """Calculate percentage gain required to recover from a portfolio drawdown."""
    return calculator_engine.calculate_drawdown_recovery(payload)

# 17. Pip Value
@router.post("/pip-value", response_model=PipValueResponse)
async def calculate_pip_value(payload: PipValueRequest):
    """Calculate pip value for currency pair in account base currency."""
    return calculator_engine.calculate_pip_value(payload)

# 18. Multi-Currency Converter
@router.post("/currency-converter", response_model=CurrencyConvertResponse)
async def convert_currency(payload: CurrencyConvertRequest):
    """Convert between major global and regional currencies (PKR, USD, SAR, EUR, GBP, AED)."""
    return calculator_engine.convert_currency(payload)

# 19. Bullion & Gold Sarafa Converter
@router.post("/bullion-converter", response_model=BullionConvertResponse)
async def convert_bullion(payload: BullionConvertRequest):
    """Convert gold and silver between Tolas, Grams, and Ounces with APGJSA closing rates."""
    return calculator_engine.convert_bullion(payload)
