import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any

from backend.app.services.market_gateway import market_gateway
from backend.app.services.market_ingestion import market_ingestion_worker
from backend.app.schemas.market import (
    MarketSnapshot,
    IndexQuote,
    HistoricalSeriesResponse
)
from backend.app.schemas.crypto import CryptoSnapshot
from backend.app.schemas.forex import ForexSnapshot
from backend.app.schemas.commodities import CommoditySnapshot, BullionRatesPKR
from backend.app.schemas.funds import MutualFundsSnapshot
from backend.app.schemas.announcements import AnnouncementsResponse
from backend.app.schemas.macro import MacroSnapshot

router = APIRouter(prefix="/market", tags=["Market Data & Intelligence"])

@router.get("/snapshot", response_model=MarketSnapshot)
async def get_market_snapshot(region: str = Query("PK", description="Market region: PK, US, SA")):
    """Get complete real-time market snapshot including indices, gainers, losers, active, and breadth."""
    try:
        return await market_gateway.get_market_snapshot(region=region)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/indices/{code}", response_model=IndexQuote)
async def get_index_quote(
    code: str,
    region: str = Query("PK", description="Market region: PK, US, SA")
):
    """Get single index quote with intraday range, P/E, and turnover."""
    snapshot = await market_gateway.get_market_snapshot(region=region)
    code_clean = code.upper().strip()
    idx = next((i for i in snapshot.indices if i.code.upper() == code_clean or i.symbol.upper() == code_clean), None)
    if not idx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Index '{code}' not found in region '{region}'."
        )
    return idx

@router.get("/history/{symbol}", response_model=HistoricalSeriesResponse)
async def get_historical_bars(
    symbol: str,
    market: str = Query("PK", description="Market code: PK, US, SA, GLOBAL"),
    resolution: str = Query("1D", description="Resolution: 1D, 1W, 1M"),
    timeframe: str = Query("1M", description="Timeframe: 1W, 1M, 3M, 1Y, 5Y")
):
    """Retrieve historical OHLCV candlestick bars for charting."""
    return await market_ingestion_worker.get_historical_series(
        symbol=symbol,
        market=market,
        resolution=resolution,
        timeframe=timeframe
    )

@router.get("/crypto/snapshot", response_model=CryptoSnapshot)
async def get_crypto_snapshot():
    """Retrieve live cryptocurrency prices, 24h changes, and market caps."""
    return await market_gateway.get_crypto_snapshot()

@router.get("/forex/snapshot", response_model=ForexSnapshot)
async def get_forex_snapshot():
    """Retrieve foreign exchange rates, base PKR conversions, and major cross rates."""
    return await market_gateway.get_forex_snapshot()

@router.get("/commodity/snapshot", response_model=CommoditySnapshot)
async def get_commodity_snapshot():
    """Retrieve international energy and precious metals quotes (Crude, Natural Gas, Gold, Silver)."""
    return await market_gateway.get_commodity_snapshot()

@router.get("/gold-pkr", response_model=BullionRatesPKR)
async def get_gold_pkr_rates():
    """Retrieve official Sarafa Bullion Association local rates for 24K and 22K (1 Tola, 10 Grams)."""
    return await market_gateway.get_bullion_rates_pkr()

@router.get("/funds/snapshot", response_model=MutualFundsSnapshot)
async def get_funds_snapshot():
    """Retrieve top Pakistani mutual funds with category, NAV, and return metrics."""
    return await market_gateway.get_funds_snapshot()

@router.get("/announcements", response_model=AnnouncementsResponse)
async def get_announcements():
    """Retrieve verified PSX corporate announcements with official PDF links."""
    return await market_gateway.get_corporate_announcements()

@router.get("/macro/snapshot", response_model=MacroSnapshot)
async def get_macro_snapshot():
    """Retrieve State Bank of Pakistan policy rate, inflation CPI, and FX reserves."""
    return await market_gateway.get_macro_snapshot()

@router.get("/sentiment")
async def get_market_sentiment(region: str = Query("PK", description="Region: PK, US, SA")):
    """Calculate multi-factor 0-100 Fear & Greed sentiment index."""
    return await market_gateway.get_fear_greed_sentiment(region=region)

@router.get("/status")
async def get_market_ingestion_status():
    """Telemetry endpoint reporting background ingestion health and sync stats."""
    return market_ingestion_worker.get_status()

@router.get("/stream")
async def stream_market_ticks(limit: Optional[int] = Query(None, description="Optional max ticks to stream")):
    """
    Real-time Server-Sent Events (SSE) live price streaming endpoint.
    Streams market ticks every 3 seconds to connected frontend clients.
    """
    async def event_generator():
        # Immediate connection acknowledgment handshake
        yield "event: ping\ndata: connected\n\n"
        ticks_sent = 0
        try:
            while True:
                snapshot = await market_gateway.get_market_snapshot(region="PK")
                indices_data = [
                    {
                        "code": idx.code,
                        "current": idx.current,
                        "change": idx.change,
                        "changePercent": idx.change_percent,
                        "direction": idx.direction
                    }
                    for idx in snapshot.indices
                ]
                tick = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "indices": indices_data,
                    "breadth": {
                        "advances": snapshot.breadth.advances if snapshot.breadth else 0,
                        "declines": snapshot.breadth.declines if snapshot.breadth else 0,
                    }
                }
                yield f"event: market_tick\ndata: {json.dumps(tick)}\n\n"
                ticks_sent += 1
                if limit is not None and ticks_sent >= limit:
                    break
                await asyncio.sleep(3)
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
