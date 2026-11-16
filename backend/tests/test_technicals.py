import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db
from backend.app.services.technicals_engine import technicals_engine

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

def test_moving_averages_calculation():
    prices = [float(100 + i) for i in range(50)]
    sma20 = technicals_engine.calculate_sma(prices, 20)
    assert sma20 is not None
    # Last 20 prices are 130 to 149, average is (130+149)/2 = 139.5
    assert sma20 == 139.5

    ema20 = technicals_engine.calculate_ema(prices, 20)
    assert ema20 is not None
    assert 135.0 <= ema20 <= 145.0

def test_rsi_calculation():
    # Uptrending sequence
    up_prices = [float(100 + (i * 2)) for i in range(30)]
    rsi_up = technicals_engine.calculate_rsi(up_prices, 14)
    assert 0 <= rsi_up.value <= 100
    assert rsi_up.value > 70.0  # Strongly trending up should be overbought

    # Downtrending sequence
    down_prices = [float(200 - (i * 3)) for i in range(30)]
    rsi_down = technicals_engine.calculate_rsi(down_prices, 14)
    assert 0 <= rsi_down.value <= 100
    assert rsi_down.value < 30.0  # Trending down should be oversold

def test_macd_calculation():
    prices = [float(100 + i * 0.5) for i in range(40)]
    macd = technicals_engine.calculate_macd(prices, 12, 26, 9)
    assert macd.macd_line is not None
    assert macd.signal_line is not None
    assert macd.histogram is not None
    assert macd.crossover in ("Bullish (Above Signal)", "Bearish (Below Signal)", "Neutral")

def test_bollinger_bands_calculation():
    prices = [float(150 + (i % 5)) for i in range(25)]
    bb = technicals_engine.calculate_bollinger_bands(prices, 20, 2.0)
    assert bb.upper > bb.middle > bb.lower
    assert bb.bandwidth > 0
    assert 0.0 <= bb.percent_b <= 1.0

def test_pivot_levels_calculation():
    high = 320.0
    low = 300.0
    close = 315.0
    pivots = technicals_engine.calculate_pivots(high, low, close)
    assert "standard" in pivots
    assert "fibonacci" in pivots
    assert "camarilla" in pivots

    std = pivots["standard"]
    # P = (320 + 300 + 315) / 3 = 311.67
    assert 311.6 <= std.pivot <= 311.7
    assert std.r1 > std.pivot > std.s1
    assert std.r2 > std.r1
    assert std.s1 > std.s2

@pytest.mark.asyncio
async def test_technicals_api_endpoint():
    """Verify /api/v1/technicals/{symbol} endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/technicals/OGDC?market=PK&resolution=1D")
        assert resp.status_code == 200
        data = resp.json()
        assert data["symbol"] == "OGDC"
        assert data["current_price"] > 0
        assert "moving_averages" in data
        assert "rsi" in data
        assert "macd" in data
        assert "bollinger" in data
        assert "pivots" in data
        assert "verdict" in data

        verdict = data["verdict"]
        assert verdict["verdict"] in ("Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell")
        assert 0 <= verdict["conviction_score"] <= 100
        assert "bullish_scenario" in verdict
        assert "bearish_scenario" in verdict
