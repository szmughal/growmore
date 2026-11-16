from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone
from backend.app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    System health and database probe.
    Returns status of database connection, timestamp, and core runtime info.
    """
    db_status = "unhealthy"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "app_name": "Grow More and Stable Life",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
