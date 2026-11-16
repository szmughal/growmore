from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class CorporateAnnouncement(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    symbol: str
    company_name: Optional[str] = Field(default=None, alias="companyName")
    title: str
    announced_at: str = Field(alias="announcedAt")
    date_text: Optional[str] = Field(default=None, alias="dateText")
    time_text: Optional[str] = Field(default=None, alias="timeText")
    pdf_url: Optional[str] = Field(default=None, alias="pdfUrl")
    source_url: str = Field(default="https://www.psx.com.pk/", alias="sourceUrl")
    category: Optional[str] = "corporate_notice"

class AnnouncementsResponse(BaseModel):
    items: List[CorporateAnnouncement]
    total: int
    market: str = "PSX"
    source: str = "Pakistan Stock Exchange"
    generated_at: str
