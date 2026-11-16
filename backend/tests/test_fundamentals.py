import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db
from backend.app.services.fundamentals_engine import fundamentals_engine
from backend.app.schemas.fundamentals import DCFValuationRequest

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

def test_dcf_valuation_calculation():
    """Verify 2-stage DCF intrinsic valuation mathematics."""
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
    res = fundamentals_engine.calculate_dcf(req, current_price=150.0)
    assert res.intrinsic_value_per_share > 0
    assert len(res.fcf_projections) == 10
    assert res.present_value_cash_flows > 0
    assert res.terminal_value > 0
    assert res.enterprise_value > res.present_value_cash_flows
    assert res.equity_value == res.enterprise_value - res.net_debt
    assert res.valuation_verdict in ("Significantly Undervalued", "Undervalued", "Fairly Valued", "Overvalued")

def test_peter_lynch_fair_value_calculation():
    """Verify Peter Lynch Fair Value = EPS * min(Growth Rate, 25)."""
    eps = 20.0
    growth_rate = 15.0
    current_price = 250.0
    res = fundamentals_engine.calculate_peter_lynch(eps, growth_rate, current_price, pe_ratio=12.5)
    # Fair value = 20 * 15 = 300.0
    assert res.fair_value == 300.0
    assert res.peg_ratio == round(12.5 / 15.0, 2)
    assert res.valuation_verdict == "Moderately Undervalued"

def test_5_factor_scoring_engine():
    """Verify Health, Quality, Growth, Stability, Value scoring (0 to 100)."""
    ratios = {
        "debt_to_equity": 0.1,
        "current_ratio": 2.5,
        "interest_coverage": 10.0,
        "roe_pct": 28.0,
        "roa_pct": 14.0,
        "operating_margin_pct": 25.0,
        "dividend_yield_pct": 7.5,
        "dividend_payout_pct": 50.0,
        "pe_ratio": 6.2,
        "pb_ratio": 1.1
    }
    growth = {
        "revenue_growth_pct": 18.0,
        "eps_growth_pct": 22.0
    }
    scores = fundamentals_engine.calculate_scores(ratios, growth)
    assert 0 <= scores.health_score <= 100
    assert 0 <= scores.quality_score <= 100
    assert 0 <= scores.growth_score <= 100
    assert 0 <= scores.stability_score <= 100
    assert 0 <= scores.value_score <= 100
    assert 0 <= scores.overall_score <= 100
    # Excellent fundamentals should yield overall score >= 75
    assert scores.overall_score >= 75.0

@pytest.mark.asyncio
async def test_fundamentals_api_endpoint():
    """Verify /api/v1/fundamentals/{symbol} endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/fundamentals/OGDC?market=PK")
        assert resp.status_code == 200
        data = resp.json()
        assert data["profile"]["symbol"] == "OGDC"
        assert data["profile"]["name"] is not None
        assert data["scores"]["overall_score"] > 0
        assert data["dcf"]["intrinsic_value_per_share"] > 0
        assert data["peter_lynch"]["fair_value"] > 0
        assert len(data["annual_income_statements"]) > 0

@pytest.mark.asyncio
async def test_custom_dcf_endpoint():
    """Verify /api/v1/fundamentals/{symbol}/dcf endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        dcf_payload = {
            "fcf_base": 25000000000.0,
            "growth_rate_stage1": 0.08,
            "growth_years_stage1": 5,
            "growth_rate_stage2": 0.05,
            "growth_years_stage2": 5,
            "discount_rate_wacc": 0.13,
            "terminal_growth_rate": 0.04,
            "cash_and_equivalents": 30000000000.0,
            "total_debt": 10000000000.0,
            "shares_outstanding": 4300000000.0
        }
        resp = await ac.post("/api/v1/fundamentals/OGDC/dcf?current_price=280.0", json=dcf_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["intrinsic_value_per_share"] > 0
        assert data["enterprise_value"] > 0
        assert "margin_of_safety_pct" in data

@pytest.mark.asyncio
async def test_peer_comparison_endpoint():
    """Verify /api/v1/fundamentals/{symbol}/peers endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/fundamentals/OGDC/peers?market=PK")
        assert resp.status_code == 200
        data = resp.json()
        assert data["target_symbol"] == "OGDC"
        assert len(data["peers"]) >= 3
        first_peer = data["peers"][0]
        assert "symbol" in first_peer
        assert "pe_ratio" in first_peer
