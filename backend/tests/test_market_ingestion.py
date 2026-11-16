import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db
from backend.app.services.market_ingestion import market_ingestion_worker

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_cache_warming_cycle():
    """Verify cache warming executes across all market domains."""
    await market_ingestion_worker.warm_all_caches()
    status = market_ingestion_worker.get_status()
    assert status["sync_count"] >= 1
    assert status["last_sync_time"] is not None

@pytest.mark.asyncio
async def test_historical_bars_ingestion_and_query():
    """Verify benchmark historical bars are stored in database and retrievable."""
    await market_ingestion_worker.ingest_benchmark_historical_bars()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/market/history/KSE100?market=PK&resolution=1D&timeframe=1M")
        assert resp.status_code == 200
        data = resp.json()
        assert data["symbol"] == "KSE100"
        assert data["market"] == "PK"
        assert data["count"] > 0
        assert len(data["data"]) > 0

        first_bar = data["data"][0]
        assert "time" in first_bar
        assert "open" in first_bar
        assert "high" in first_bar
        assert "low" in first_bar
        assert "close" in first_bar
        assert "volume" in first_bar

@pytest.mark.asyncio
async def test_index_quote_endpoint():
    """Verify single index lookup endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/market/indices/KSE100?region=PK")
        assert resp.status_code == 200
        idx = resp.json()
        assert idx["code"] == "KSE100"
        assert idx["current"] > 0

        # Non-existent index returns 404
        bad_resp = await ac.get("/api/v1/market/indices/NONEXISTENT?region=PK")
        assert bad_resp.status_code == 404

@pytest.mark.asyncio
async def test_market_status_telemetry():
    """Verify telemetry health endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/market/status")
        assert resp.status_code == 200
        telemetry = resp.json()
        assert "sync_count" in telemetry
        assert "error_count" in telemetry

@pytest.mark.asyncio
async def test_market_stream_sse():
    """Verify Server-Sent Events live stream emits valid tick data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/market/stream?limit=1")
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        body = resp.text
        assert "event: ping" in body or "event: market_tick" in body
        assert "data:" in body
