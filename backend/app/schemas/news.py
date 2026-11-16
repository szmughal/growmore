from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class NewsArticle(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    headline: str
    publisher: str
    article_url: str
    published_at: str
    market: str = "PK"  # "PK", "US", "GLOBAL", "COMMODITIES"
    symbol: Optional[str] = None
    category: str = "equities"  # "equities", "economy", "central_banks", "commodities", "corporate"
    summary: str

class NewsFeedResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    articles: List[NewsArticle]
    total: int
    market: str
    source: str
    generated_at: str
