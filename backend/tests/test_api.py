import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_root_and_health_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test Root Endpoint
        root_resp = await client.get("/")
        assert root_resp.status_code == 200
        root_data = root_resp.json()
        assert root_data["platform"] == "Grow More and Stable Life"
        assert root_data["status"] == "active"

        # Test Health Probe (which also queries DB "SELECT 1")
        health_resp = await client.get("/api/v1/health")
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert health_data["status"] == "online"
        assert health_data["database"] == "healthy"

@pytest.mark.asyncio
async def test_market_api_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test PK Market Snapshot
        pk_resp = await client.get("/api/v1/market/snapshot?region=PK")
        assert pk_resp.status_code == 200
        pk_data = pk_resp.json()
        assert pk_data["region"] == "PK"
        assert len(pk_data["indices"]) > 0

        # Test Forex Snapshot
        fx_resp = await client.get("/api/v1/market/forex/snapshot")
        assert fx_resp.status_code == 200
        fx_data = fx_resp.json()
        assert len(fx_data["pairs"]) > 0

        # Test Sentiment Endpoint
        sent_resp = await client.get("/api/v1/market/sentiment?region=PK")
        assert sent_resp.status_code == 200
        sent_data = sent_resp.json()
        assert 0 <= sent_data["score"] <= 100
