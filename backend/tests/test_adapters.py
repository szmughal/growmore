import pytest
import asyncio
from backend.app.services.market_gateway import market_gateway
from backend.app.schemas.market import MarketSnapshot
from backend.app.schemas.crypto import CryptoSnapshot
from backend.app.schemas.forex import ForexSnapshot
from backend.app.schemas.commodities import CommoditySnapshot, BullionRatesPKR
from backend.app.schemas.funds import MutualFundsSnapshot
from backend.app.schemas.announcements import AnnouncementsResponse
from backend.app.schemas.macro import MacroSnapshot

@pytest.mark.asyncio
async def test_crypto_adapter_live():
    snapshot: CryptoSnapshot = await market_gateway.get_crypto_snapshot()
    assert snapshot is not None
    assert isinstance(snapshot, CryptoSnapshot)
    assert len(snapshot.coins) > 0
    btc = next((c for c in snapshot.coins if c.symbol == "BTC"), None)
    assert btc is not None
    assert btc.price > 0
    assert btc.market_cap > 0
    print(f"\n[Verified Live Crypto] Bitcoin Price: ${btc.price:,.2f}, 24h Vol: ${btc.volume_24h:,.0f}")

@pytest.mark.asyncio
async def test_forex_adapter_live():
    snapshot: ForexSnapshot = await market_gateway.get_forex_snapshot()
    assert snapshot is not None
    assert isinstance(snapshot, ForexSnapshot)
    assert len(snapshot.pairs) > 0
    usd_pkr = next((p for p in snapshot.pairs if p.code == "USDPKR"), None)
    assert usd_pkr is not None
    assert usd_pkr.price > 200.0  # Real PKR exchange rate is > 200
    print(f"\n[Verified Live Forex] USD/PKR: {usd_pkr.price}")

@pytest.mark.asyncio
async def test_commodities_and_bullion_adapter_live():
    snapshot: CommoditySnapshot = await market_gateway.get_commodity_snapshot()
    assert snapshot is not None
    assert len(snapshot.commodities) > 0
    gold = next((c for c in snapshot.commodities if c.code == "GOLD"), None)
    assert gold is not None
    assert gold.price > 1000.0  # Real Spot Gold is > $1000/oz

    # Check bullion rates in PKR
    bullion: BullionRatesPKR = await market_gateway.get_bullion_rates_pkr()
    assert bullion.spot_gold_usd_per_oz > 0
    assert bullion.gold_per_tola.karat_24 > 100000.0  # Real Gold 24k tola in PKR is > 100k
    assert bullion.gold_per_gram.karat_24 > 10000.0
    print(f"\n[Verified Bullion PKR] 24k Gold per Tola: PKR {bullion.gold_per_tola.karat_24:,.2f}")

@pytest.mark.asyncio
async def test_psx_adapter_live():
    snapshot: MarketSnapshot = await market_gateway.get_market_snapshot(region="PK")
    assert snapshot is not None
    assert snapshot.region == "PK"
    assert len(snapshot.indices) > 0
    kse100 = next((i for i in snapshot.indices if i.code == "KSE100"), None)
    assert kse100 is not None
    assert kse100.current > 50000.0  # Real KSE-100 is > 50k
    print(f"\n[Verified Live PSX] KSE-100: {kse100.current:,.2f}, Change: {kse100.change}")

@pytest.mark.asyncio
async def test_us_markets_adapter_live():
    snapshot: MarketSnapshot = await market_gateway.get_market_snapshot(region="US")
    assert snapshot is not None
    assert snapshot.region == "US"
    sp500 = next((i for i in snapshot.indices if i.code == "SP500"), None)
    assert sp500 is not None
    assert sp500.current > 3000.0
    print(f"\n[Verified Live US] S&P 500: {sp500.current:,.2f}")

@pytest.mark.asyncio
async def test_saudi_market_adapter_live():
    snapshot: MarketSnapshot = await market_gateway.get_market_snapshot(region="SA")
    assert snapshot is not None
    assert snapshot.region == "SA"
    tasi = next((i for i in snapshot.indices if i.code == "TASI"), None)
    assert tasi is not None
    assert tasi.current > 8000.0
    print(f"\n[Verified Live Saudi] TASI: {tasi.current:,.2f}")

@pytest.mark.asyncio
async def test_mutual_funds_adapter_live():
    snapshot: MutualFundsSnapshot = await market_gateway.get_funds_snapshot()
    assert snapshot is not None
    assert snapshot.total_funds > 0
    assert len(snapshot.funds) > 0
    print(f"\n[Verified Mutual Funds] Funds Loaded: {snapshot.total_funds}")

@pytest.mark.asyncio
async def test_macroeconomic_adapter_live():
    snapshot: MacroSnapshot = await market_gateway.get_macro_snapshot()
    assert snapshot is not None
    assert snapshot.policy_rate.current_rate > 0.0
    assert len(snapshot.indicators) > 0
    cpi = next((ind for ind in snapshot.indicators if ind.code == "CPI_INFLATION_YOY"), None)
    assert cpi is not None
    print(f"\n[Verified Macro] Policy Rate: {snapshot.policy_rate.current_rate}%, CPI YoY: {cpi.reported_value}%")

@pytest.mark.asyncio
async def test_fear_greed_sentiment():
    sentiment = await market_gateway.get_fear_greed_sentiment(region="PK")
    assert sentiment is not None
    assert 0 <= sentiment["score"] <= 100
    assert len(sentiment["factors"]) == 5
    print(f"\n[Verified Sentiment] Region: {sentiment['region']}, Score: {sentiment['score']}, Label: {sentiment['label']}")

@pytest.mark.asyncio
async def test_corporate_announcements():
    announcements: AnnouncementsResponse = await market_gateway.get_corporate_announcements()
    assert announcements is not None
    print(f"\n[Verified Announcements] Total: {announcements.total}")
