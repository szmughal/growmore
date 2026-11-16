from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.schemas.announcements import AnnouncementsResponse, CorporateAnnouncement
from backend.app.services.market_gateway import market_gateway

router = APIRouter(prefix="/announcements", tags=["PSX Corporate Announcements"])

@router.get("", response_model=AnnouncementsResponse)
async def get_corporate_announcements(
    symbol: Optional[str] = Query(None, description="Company symbol filter (e.g. OGDC, SYS)"),
    category: Optional[str] = Query(None, description="Category: financial_results, dividend, board_meeting, agm"),
    q: Optional[str] = Query(None, description="Search keyword in title or company name"),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Retrieve live and recent official PSX corporate announcements with official PDF links.
    Directly connected to PSX Data Portal document storage.
    """
    raw_announcements = await market_gateway.get_corporate_announcements()
    items = raw_announcements.items

    if symbol:
        sym_clean = symbol.upper().strip()
        items = [i for i in items if i.symbol.upper() == sym_clean]

    if category:
        cat_clean = category.lower().strip()
        items = [i for i in items if i.category and cat_clean in i.category.lower()]

    if q:
        query_str = q.lower().strip()
        items = [
            i for i in items
            if query_str in i.title.lower() or (i.company_name and query_str in i.company_name.lower())
        ]

    items = items[:limit]

    return AnnouncementsResponse(
        items=items,
        total=len(items),
        market="PSX",
        source="Pakistan Stock Exchange Data Portal (DPS)",
        generated_at=datetime.now(timezone.utc).isoformat()
    )

@router.get("/{announcement_id}", response_model=CorporateAnnouncement)
async def get_announcement_detail(announcement_id: str):
    """Retrieve full detail and official PDF link for a specific announcement."""
    raw_announcements = await market_gateway.get_corporate_announcements()
    item = next((i for i in raw_announcements.items if i.id == announcement_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement '{announcement_id}' not found."
        )
    return item
