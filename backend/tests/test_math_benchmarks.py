import pytest
from decimal import Decimal
from datetime import date
import math

from backend.app.services.portfolio_engine import PortfolioEngine
from backend.app.services.calculator_engine import calculator_engine
from backend.app.services.fundamentals_engine import fundamentals_engine
from backend.app.schemas.tools import (
    ZakatCalculatorRequest,
    DividendPurificationRequest,
    LoanEMIRequest,
    CAGRRequest,
    CompoundInterestRequest,
    FIRECalculatorRequest,
    BullionConvertRequest
)
from backend.app.schemas.fundamentals import DCFValuationRequest

def test_fifo_multi_lot_exact_p_and_l_benchmark():
    """
    Benchmark FIFO Cost Basis Allocation:
    Lot 1: 50 units @ 100.00 (cost 5,000)
    Lot 2: 50 units @ 150.00 (cost 7,500)
    Total 100 units, Total cost 12,500.

    Sale: 70 units @ 180.00 (gross 12,600, fees 100 -> net 12,500)
    FIFO consumes:
      - 50 units of Lot 1 @ 100 = 5,000 cost basis
      - 20 units of Lot 2 @ 150 = 3,000 cost basis
    Total cost consumed = 8,000.00
    Realized P&L = Net Proceed (12,500) - Cost (8,000) = 4,500.00
    Remaining units = 30 of Lot 2 @ 150 = 4,500.00 remaining cost
    """
    buy_lots = [
        {"lot_id": "lot-1", "unit_cost": Decimal("100.00"), "remaining_qty": Decimal("50")},
        {"lot_id": "lot-2", "unit_cost": Decimal("150.00"), "remaining_qty": Decimal("50")}
    ]

    realized_pnl, cost_sold, updated_lots = PortfolioEngine.process_sell_fifo(
        buy_lots=buy_lots,
        sell_qty=Decimal("70"),
        sell_unit_price=Decimal("180.00"),
        fees=Decimal("100.00"),
        taxes=Decimal("0.00")
    )

    assert cost_sold == Decimal("8000.00")
    assert realized_pnl == Decimal("4500.00")
    assert updated_lots[0]["remaining_qty"] == Decimal("0")
    assert updated_lots[1]["remaining_qty"] == Decimal("30")

def test_xirr_mathematical_convergence():
    """
    Benchmark XIRR calculation with known financial test vector:
    2025-01-01: -10,000
    2025-07-01: -5,000
    2026-01-01: +16,500
    Expected annualized return ~ 12.0%
    """
    cash_flows = [
        (date(2025, 1, 1), -10000.0),
        (date(2025, 7, 1), -5000.0),
        (date(2026, 1, 1), 16500.0)
    ]
    rate = PortfolioEngine.calculate_xirr(cash_flows)
    assert rate is not None
    assert 11.0 <= rate <= 14.0

def test_cagr_mathematical_precision():
    """
    Benchmark CAGR formula:
    Initial: 10,000
    Final: 20,000
    Duration: 3.0 years
    Formula: (20000/10000)^(1/3) - 1 = 2^(1/3) - 1 ≈ 25.9921%
    """
    cagr = PortfolioEngine.calculate_cagr(10000.0, 20000.0, 3.0)
    assert cagr is not None
    assert 25.9 <= cagr <= 26.1

def test_loan_emi_and_amortization_schedule_benchmark():
    """
    Benchmark Loan Reducing-Balance EMI & Amortization:
    Principal: 1,000,000 PKR
    Annual Rate: 12.0% (Monthly rate = 0.01)
    Tenure: 12 months
    
    Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    EMI = 1000000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) ≈ 88,848.79 PKR
    Sum of principal repaid across 12 months MUST equal 1,000,000.00 exactly.
    """
    req = LoanEMIRequest(
        loan_amount=1000000.0,
        annual_interest_rate_pct=12.0,
        loan_tenure_months=12
    )
    res = calculator_engine.calculate_loan_emi(req)

    assert 88800.0 <= res.monthly_emi <= 88900.0
    assert res.total_principal == 1000000.0
    assert len(res.yearly_schedule) == 12

    total_principal_sum = sum((m.principal_payment for m in res.yearly_schedule), 0.0)
    assert abs(total_principal_sum - 1000000.0) < 1.0

def test_dcf_intrinsic_valuation_precision():
    """
    Benchmark 2-Stage DCF Model:
    Base FCF: 100,000,000 PKR
    Stage 1 Growth: 12% for 5 years
    Stage 2 Growth: 6% for 5 years
    Discount Rate WACC: 12%
    Terminal Growth: 4%
    Cash: 50,000,000, Debt: 20,000,000, Shares: 10,000,000
    """
    req = DCFValuationRequest(
        fcf_base=100000000.0,
        growth_rate_stage1=0.12,
        growth_years_stage1=5,
        growth_rate_stage2=0.06,
        growth_years_stage2=5,
        discount_rate_wacc=0.12,
        terminal_growth_rate=0.04,
        cash_and_equivalents=50000000.0,
        total_debt=20000000.0,
        shares_outstanding=10000000.0
    )
    res = fundamentals_engine.calculate_dcf(req, current_price=120.0)

    assert res.intrinsic_value_per_share > 100.0
    assert res.enterprise_value > 1000000000.0
    assert res.terminal_value > 1000000000.0

def test_zakat_nisab_and_liability_benchmark():
    """
    Benchmark Zakat Calculation with Live Silver Nisab:
    Nisab: 215,000 PKR
    Wealth: 1,000,000 cash - 100,000 debts = 900,000 net
    900,000 > 215,000 -> is_zakat_due = True
    Zakat rate = 2.5%
    Zakat payable = 900,000 * 0.025 = 22,500.00 PKR
    """
    req = ZakatCalculatorRequest(
        cash_in_hand_and_banks=1000000.0,
        immediate_debts_and_liabilities=100000.0,
        custom_silver_nisab_pkr=215000.0
    )
    res = calculator_engine.calculate_zakat(req)

    assert res.is_zakat_due is True
    assert res.net_zakatable_wealth == 900000.0
    assert res.zakat_payable_pkr == 22500.0

def test_shariah_dividend_purification_benchmark():
    """
    Benchmark Meezan Shariah Dividend Purification:
    SYS dividend: 10,000 PKR @ 0.85% purification
    Purification amount: 85.0 PKR
    Halal dividend: 9,915.0 PKR
    """
    req = DividendPurificationRequest(
        symbol="SYS",
        dividend_gross_amount=10000.0
    )
    res = calculator_engine.calculate_dividend_purification(req)

    assert res.purification_rate_pct == 0.85
    assert res.purification_amount_to_charity == 85.0
    assert res.net_halal_dividend == 9915.0

def test_bullion_conversions_benchmark():
    """
    Benchmark Sarafa Bullion Conversion:
    1 Tola 24K Gold -> Sarafa rate 282,500 PKR
    1 Tola = 11.6638 grams
    """
    req = BullionConvertRequest(
        metal="gold",
        karat=24,
        weight=1.0,
        unit="tola"
    )
    res = calculator_engine.convert_bullion(req)

    assert res.total_price_pkr == 282500.0
    assert res.weight_in_grams > 11.66
