from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.schemas.news import NewsArticle, NewsFeedResponse
from backend.app.services.market_gateway import market_gateway

router = APIRouter(prefix="/news", tags=["Financial News & Media Syndication"])

@router.get("", response_model=NewsFeedResponse)
async def get_financial_news(
    market: str = Query("PK", description="Market filter: PK, US, GLOBAL, ALL"),
    category: Optional[str] = Query(None, description="Category: equities, economy, central_banks, commodities"),
    symbol: Optional[str] = Query(None, description="Symbol ticker filter"),
    q: Optional[str] = Query(None, description="Search keyword in headlines or summaries"),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Retrieve curated, verified financial news with publisher attribution and links.
    Sources include Business Recorder, Dawn, Profit, Reuters, and Bloomberg.
    """
    # Fetch curated feed from news adapter
    feed_items = await market_gateway.get_news_feed(market=market if market != "ALL" else "PK")

    articles: List[NewsArticle] = []
    for item in feed_items:
        # Determine category heuristically if not present
        headline_lower = item.headline.lower()
        if "policy rate" in headline_lower or "federal reserve" in headline_lower or "interest rate" in headline_lower:
            cat = "central_banks"
        elif "inflation" in headline_lower or "reserves" in headline_lower or "economy" in headline_lower:
            cat = "economy"
        elif "crude" in headline_lower or "gold" in headline_lower or "oil" in headline_lower:
            cat = "commodities"
        else:
            cat = "equities"

        article = NewsArticle(
            id=item.id,
            headline=item.headline,
            publisher=item.publisher,
            article_url=item.article_url,
            published_at=item.published_at,
            market=item.market,
            symbol=item.symbol,
            category=cat,
            summary=item.summary
        )
        articles.append(article)

    # Apply filters
    if category:
        articles = [a for a in articles if a.category.lower() == category.lower()]
    if symbol:
        articles = [a for a in articles if a.symbol and a.symbol.upper() == symbol.upper()]
    if q:
        query_str = q.lower()
        articles = [a for a in articles if query_str in a.headline.lower() or query_str in a.summary.lower()]

    articles = articles[:limit]

    return NewsFeedResponse(
        articles=articles,
        total=len(articles),
        market=market,
        source="Curated Financial Syndication (Business Recorder, Dawn, Reuters, Profit)",
        generated_at=datetime.now(timezone.utc).isoformat()
    )

@router.get("/{article_id}", response_model=NewsArticle)
async def get_news_article(article_id: str):
    """Retrieve full detail for a single news article."""
    feed_items = await market_gateway.get_news_feed(market="PK")
    item = next((i for i in feed_items if i.id == article_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article '{article_id}' not found."
        )

    return NewsArticle(
        id=item.id,
        headline=item.headline,
        publisher=item.publisher,
        article_url=item.article_url,
        published_at=item.published_at,
        market=item.market,
        symbol=item.symbol,
        category="equities",
        summary=item.summary
    )
