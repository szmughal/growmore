import pytest
from backend.app.schemas.market import IndexQuote, StockQuote, MarketSnapshot
from backend.app.schemas.crypto import CryptoCoin, CryptoOverview, CryptoSnapshot
from backend.app.schemas.forex import ForexPair, ForexSnapshot
from backend.app.schemas.commodities import CommodityQuote, BullionRatesPKR, BullionKaratRates
from backend.app.schemas.funds import MutualFundQuote, MutualFundsSnapshot
from backend.app.schemas.announcements import CorporateAnnouncement, AnnouncementsResponse
from backend.app.schemas.macro import MacroIndicator, SBPPolicyRegimes

def test_index_quote_schema():
    quote = IndexQuote(
        code="KSE100",
        symbol="KSE100",
        name="KSE 100 INDEX",
        current=177873.88,
        change=500.11,
        changePercent=0.28,
        direction="up",
        peRatio=8.31,
        dividendYield=0.0597
    )
    assert quote.code == "KSE100"
    assert quote.current == 177873.88
    assert quote.pe_ratio == 8.31
    assert quote.dividend_yield == 0.0597

def test_crypto_coin_schema():
    coin = CryptoCoin(
        id="bitcoin",
        symbol="BTC",
        name="Bitcoin",
        price=64636.0,
        marketCap=1299935212934.0,
        volume24h=51082596953.0,
        change24h=-4.00,
        sparkline=[65000.0, 64800.0, 64636.0]
    )
    assert coin.symbol == "BTC"
    assert coin.price == 64636.0
    assert len(coin.sparkline) == 3

def test_forex_pair_schema():
    pair = ForexPair(
        code="USDPKR",
        symbol="USDPKR=X",
        name="US Dollar / Pakistani Rupee",
        base="USD",
        quote="PKR",
        price=276.35,
        changePercent=0.02,
        isComputed=False
    )
    assert pair.code == "USDPKR"
    assert pair.price == 276.35
    assert pair.base_currency == "USD"
    assert pair.quote_currency == "PKR"

def test_bullion_karat_schema():
    rates = BullionKaratRates(**{"18": 25896.93, "21": 30213.08, "22": 31651.80, "24": 34529.24})
    assert rates.karat_18 == 25896.93
    assert rates.karat_24 == 34529.24

def test_announcements_schema():
    ann = CorporateAnnouncement(
        id="ann-001",
        symbol="OGDC",
        companyName="Oil & Gas Development Co",
        title="Notice of Board Meeting",
        announcedAt="2026-11-13T10:00:00Z",
        pdfUrl="https://www.psx.com.pk/psx/file/test.pdf"
    )
    assert ann.symbol == "OGDC"
    assert "psx.com.pk" in str(ann.pdf_url)
