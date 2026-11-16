import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db
from backend.app.services.calculator_engine import calculator_engine
from backend.app.schemas.tools import (
    ZakatCalculatorRequest, DividendPurificationRequest,
    SIPCalculatorRequest, CompoundInterestRequest,
    CAGRRequest, ROIRequest, FIRECalculatorRequest, GoalPlannerRequest,
    NetWorthCalculatorRequest, LoanEMIRequest, AssetDepreciationRequest,
    PivotCalculatorRequest, StockPositionSizeRequest, ForexPositionSizeRequest,
    DrawdownRecoveryRequest, PipValueRequest, CurrencyConvertRequest, BullionConvertRequest
)

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

def test_zakat_calculator():
    # Wealth = 1,000,000 cash - 100,000 debts = 900,000 net
    # Nisab = 215,000 PKR
    # Zakat = 900,000 * 2.5% = 22,500 PKR
    req = ZakatCalculatorRequest(
        cash_in_hand_and_banks=1000000.0,
        immediate_debts_and_liabilities=100000.0,
        custom_silver_nisab_pkr=215000.0
    )
    res = calculator_engine.calculate_zakat(req)
    assert res.is_zakat_due is True
    assert res.net_zakatable_wealth == 900000.0
    assert res.zakat_payable_pkr == 22500.0

    # Below Nisab
    req_low = ZakatCalculatorRequest(
        cash_in_hand_and_banks=150000.0,
        custom_silver_nisab_pkr=215000.0
    )
    res_low = calculator_engine.calculate_zakat(req_low)
    assert res_low.is_zakat_due is False
    assert res_low.zakat_payable_pkr == 0.0

def test_dividend_purification():
    # Systems Limited (SYS) dividend 10,000 PKR @ 0.85% purification
    req = DividendPurificationRequest(
        symbol="SYS",
        dividend_gross_amount=10000.0
    )
    res = calculator_engine.calculate_dividend_purification(req)
    assert res.purification_rate_pct == 0.85
    assert res.purification_amount_to_charity == 85.0
    assert res.net_halal_dividend == 9915.0

def test_sip_calculator():
    # 10,000/month @ 12% for 5 years
    req = SIPCalculatorRequest(
        monthly_investment=10000.0,
        expected_annual_return_pct=12.0,
        time_period_years=5,
        annual_step_up_pct=0.0
    )
    res = calculator_engine.calculate_sip(req)
    assert res.total_amount_invested == 600000.0
    assert res.total_wealth_accumulated > 600000.0
    assert res.estimated_returns > 0
    assert len(res.yearly_schedule) == 5

def test_compound_interest():
    # 100,000 @ 10% for 3 years compounded monthly
    # FV = 100000 * (1 + 0.10/12)^36 ≈ 134,818.18
    req = CompoundInterestRequest(
        principal_amount=100000.0,
        annual_interest_rate_pct=10.0,
        time_period_years=3.0,
        compounding_frequency_per_year=12
    )
    res = calculator_engine.calculate_compound_interest(req)
    assert 134800.0 <= res.final_future_value <= 134850.0
    assert res.total_interest_earned > 34800.0

def test_cagr_calculator():
    req = CAGRRequest(
        beginning_value=100000.0,
        ending_value=200000.0,
        time_period_years=3.0
    )
    res = calculator_engine.calculate_cagr(req)
    assert 25.9 <= res.cagr_percent <= 26.1

def test_roi_calculator():
    req = ROIRequest(
        initial_investment=100000.0,
        final_return=125000.0,
        investment_period_years=2.0,
        transaction_fees=1000.0
    )
    res = calculator_engine.calculate_roi(req)
    # Net profit = 25000 - 1000 = 24000
    assert res.net_profit == 24000.0
    assert res.roi_percent == 24.0

def test_fire_planner():
    req = FIRECalculatorRequest(
        current_age=30,
        current_net_worth=2000000.0,
        monthly_expenses=150000.0,
        monthly_savings_investment=100000.0,
        expected_annual_return_pct=12.0,
        safe_withdrawal_rate_pct=4.0,
        annual_inflation_pct=6.0
    )
    res = calculator_engine.calculate_fire(req)
    # Annual expenses = 1.8M
    assert res.annual_expenses == 1800000.0
    # Standard FIRE = 1.8M / 0.04 = 45M
    assert res.standard_fire_target == 45000000.0
    assert res.lean_fire_target == 33750000.0
    assert res.fat_fire_target == 67500000.0

def test_loan_emi_and_amortization():
    # 1,000,000 @ 12% for 12 months
    # Monthly r = 0.01, EMI = 1,000,000 * 0.01 * (1.01^12) / (1.01^12 - 1) ≈ 88,848.79
    req = LoanEMIRequest(
        loan_amount=1000000.0,
        annual_interest_rate_pct=12.0,
        loan_tenure_months=12
    )
    res = calculator_engine.calculate_loan_emi(req)
    assert 88800.0 <= res.monthly_emi <= 88900.0
    assert res.total_principal == 1000000.0
    assert len(res.yearly_schedule) == 12

def test_depreciation():
    # Cost = 100,000, Salvage = 10,000, Life = 5 years -> 18,000/year
    req = AssetDepreciationRequest(
        initial_asset_cost=100000.0,
        salvage_value=10000.0,
        useful_life_years=5,
        method="straight_line"
    )
    res = calculator_engine.calculate_depreciation(req)
    assert len(res.schedule) == 5
    assert res.schedule[0].depreciation_expense == 18000.0
    assert res.schedule[-1].book_value == 10000.0

def test_pivot_points():
    req = PivotCalculatorRequest(high=105.0, low=95.0, close=100.0)
    res = calculator_engine.calculate_all_pivots(req)
    assert res.standard["pivot"] == 100.0
    assert res.standard["r1"] == 105.0
    assert res.standard["s1"] == 95.0
    assert res.fibonacci["pivot"] == 100.0
    assert res.camarilla["pivot"] == 100.0
    assert res.woodie["pivot"] == 100.0

def test_drawdown_recovery():
    # 50% drawdown requires 100% gain to break even
    req = DrawdownRecoveryRequest(drawdown_percentage=50.0)
    res = calculator_engine.calculate_drawdown_recovery(req)
    assert res.required_gain_to_breakeven_pct == 100.0

def test_currency_converter():
    # 100 USD to PKR @ 278.50 -> 27,850 PKR
    req = CurrencyConvertRequest(
        from_currency="USD",
        to_currency="PKR",
        amount=100.0
    )
    res = calculator_engine.convert_currency(req)
    assert res.converted_amount == 27850.0

def test_bullion_converter():
    # 1 Tola 24K Gold -> Sarafa rate 282,500 PKR
    req = BullionConvertRequest(
        metal="gold",
        karat=24,
        weight=1.0,
        unit="tola"
    )
    res = calculator_engine.convert_bullion(req)
    assert res.total_price_pkr == 282500.0
    assert res.weight_in_grams > 11.66

@pytest.mark.asyncio
async def test_tools_api_endpoints():
    """Verify FastAPI tools endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Zakat API
        zakat_resp = await ac.post("/api/v1/tools/zakat", json={
            "cash_in_hand_and_banks": 500000.0,
            "custom_silver_nisab_pkr": 200000.0
        })
        assert zakat_resp.status_code == 200
        assert zakat_resp.json()["zakat_payable_pkr"] == 12500.0

        # SIP API
        sip_resp = await ac.post("/api/v1/tools/sip", json={
            "monthly_investment": 5000.0,
            "expected_annual_return_pct": 10.0,
            "time_period_years": 3
        })
        assert sip_resp.status_code == 200
        assert sip_resp.json()["total_wealth_accumulated"] > 0

        # Shariah rates API
        rates_resp = await ac.get("/api/v1/tools/shariah-rates")
        assert rates_resp.status_code == 200
        assert len(rates_resp.json()) > 5

        # Bullion API
        bullion_resp = await ac.post("/api/v1/tools/bullion-converter", json={
            "metal": "gold",
            "karat": 22,
            "weight": 1.0,
            "unit": "tola"
        })
        assert bullion_resp.status_code == 200
        assert bullion_resp.json()["total_price_pkr"] > 250000.0
