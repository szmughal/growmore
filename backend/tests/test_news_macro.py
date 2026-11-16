import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_news_feed_endpoints():
    """Verify financial news feed filtering and article retrieval."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Fetch PK news
        resp = await ac.get("/api/v1/news?market=PK&limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] > 0
        assert len(data["articles"]) > 0
        first_article = data["articles"][0]
        assert "headline" in first_article
        assert "publisher" in first_article
        assert "article_url" in first_article
        article_id = first_article["id"]

        # 2. Fetch single article detail
        detail_resp = await ac.get(f"/api/v1/news/{article_id}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["id"] == article_id
        assert detail["headline"] == first_article["headline"]

        # 3. Filter by search keyword
        search_resp = await ac.get("/api/v1/news?market=PK&q=PSX")
        assert search_resp.status_code == 200
        search_data = search_resp.json()
        assert search_data["total"] > 0

@pytest.mark.asyncio
async def test_announcements_endpoints():
    """Verify PSX corporate announcements and official PDF links."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/announcements?limit=20")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] > 0
        first_item = data["items"][0]
        assert "symbol" in first_item
        assert "title" in first_item
        assert "announcedAt" in first_item or "announced_at" in first_item
        item_id = first_item["id"]

        # Detail endpoint
        detail_resp = await ac.get(f"/api/v1/announcements/{item_id}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["id"] == item_id

@pytest.mark.asyncio
async def test_macro_dashboard_and_sbp_cycle():
    """Verify Pakistan Macro Dashboard and SBP monetary policy cycle overlays."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Macro Dashboard
        dash_resp = await ac.get("/api/v1/macro/dashboard")
        assert dash_resp.status_code == 200
        dash = dash_resp.json()
        assert dash["country"] == "Pakistan"
        assert "policy_rate" in dash
        assert dash["policy_rate"]["current_rate"] > 0
        assert len(dash["indicators"]) > 0

        # Check CPI and Reserves presence
        codes = [i["code"] for i in dash["indicators"]]
        assert "SBP_POLICY_RATE" in codes
        assert "CPI_INFLATION_YOY" in codes
        assert "FX_RESERVES_SBP" in codes

        # 2. SBP Monetary Cycles
        cycle_resp = await ac.get("/api/v1/macro/sbp-cycle")
        assert cycle_resp.status_code == 200
        cycles = cycle_resp.json()
        assert cycles["market"] == "PK"
        assert "monetary_cycles" in cycles
        assert len(cycles["monetary_cycles"]) >= 3
        first_cycle = cycles["monetary_cycles"][0]
        assert "cycle_name" in first_cycle
        assert "kse100_return_pct" in first_cycle

@pytest.mark.asyncio
async def test_sentiment_endpoints():
    """Verify 5-Factor Fear & Greed sentiment index and history timeline."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # PK Sentiment
        resp_pk = await ac.get("/api/v1/sentiment/PK?days=30")
        assert resp_pk.status_code == 200
        pk_sent = resp_pk.json()
        assert pk_sent["region"] == "PK"
        assert 0 <= pk_sent["score"] <= 100
        assert pk_sent["label"] in ("Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed")
        assert len(pk_sent["factors"]) == 5
        assert len(pk_sent["timeline_history"]) > 10

        # US Sentiment
        resp_us = await ac.get("/api/v1/sentiment/US?days=14")
        assert resp_us.status_code == 200
        us_sent = resp_us.json()
        assert us_sent["region"] == "US"
        assert 0 <= us_sent["score"] <= 100
