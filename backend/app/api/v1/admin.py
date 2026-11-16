import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import get_db, get_current_admin
from backend.app.models.user import User
from backend.app.schemas.admin import (
    SystemOverviewStats,
    MarketOpsTelemetry,
    UserAdminItem,
    UserAdminUpdate,
    ValuationGovernanceConfig,
    ValuationGovernanceUpdate,
    AuditLogResponse
)
from backend.app.services.admin_service import admin_service

logger = logging.getLogger("growmore.admin_api")

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard", response_model=SystemOverviewStats)
async def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Return high-level system metrics, user stats, and database table record counts."""
    return await admin_service.get_system_overview(db)

@router.get("/market-ops", response_model=MarketOpsTelemetry)
async def get_market_operations(
    current_admin: User = Depends(get_current_admin)
):
    """Return live status of market provider adapters, circuit breakers, rate limiters, cache and ingestion."""
    return await admin_service.get_market_ops_telemetry()

@router.post("/market-ops/circuit-breakers/{service_name}/reset")
async def reset_provider_circuit_breaker(
    service_name: str,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Manually reset a tripped circuit breaker for an external data adapter."""
    success = admin_service.reset_circuit_breaker(service_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Adapter for service '{service_name}' not found."
        )

    await admin_service.record_audit_event(
        session=db,
        action="reset_circuit_breaker",
        resource_type="provider_adapter",
        user_id=current_admin.id,
        resource_id=service_name,
        ip_address=request.client.host if request.client else None,
        new_values={"circuit_state": "CLOSED"}
    )

    return {"message": f"Circuit breaker for '{service_name}' reset to CLOSED.", "status": "success"}

@router.post("/market-ops/cache/clear")
async def clear_market_cache(
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Flush all cached market data."""
    await admin_service.clear_cache()

    await admin_service.record_audit_event(
        session=db,
        action="clear_cache",
        resource_type="cache",
        user_id=current_admin.id,
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Market cache cleared successfully.", "status": "success"}

@router.post("/market-ops/cache/warm")
async def warm_market_cache(
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Trigger an immediate market cache warming cycle across all regions."""
    await admin_service.warm_cache()

    await admin_service.record_audit_event(
        session=db,
        action="warm_cache",
        resource_type="cache",
        user_id=current_admin.id,
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Market cache warming initiated successfully.", "status": "success"}

@router.get("/users", response_model=list[UserAdminItem])
async def list_registered_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: user, advisor, admin"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List registered users with role and portfolio counts."""
    return await admin_service.list_users(
        session=db,
        search=search,
        role=role,
        is_active=is_active,
        limit=limit,
        offset=offset
    )

@router.get("/users/{user_id}", response_model=UserAdminItem)
async def get_user_detail(
    user_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific user."""
    user = await admin_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )
    return user

@router.patch("/users/{user_id}", response_model=UserAdminItem)
async def update_user_status(
    user_id: str,
    update_data: UserAdminUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user role or toggle active/inactive status."""
    existing = await admin_service.get_user_by_id(db, user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    # Prevent admin from deactivating self
    if user_id == current_admin.id and update_data.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own account."
        )

    old_vals = {"role": existing.role, "is_active": existing.is_active}
    updated_user = await admin_service.update_user(db, user_id, update_data)

    await admin_service.record_audit_event(
        session=db,
        action="update_user",
        resource_type="user",
        user_id=current_admin.id,
        resource_id=user_id,
        ip_address=request.client.host if request.client else None,
        old_values=old_vals,
        new_values=update_data.model_dump(exclude_unset=True)
    )

    return await admin_service.get_user_by_id(db, user_id)

@router.get("/governance", response_model=ValuationGovernanceConfig)
async def get_valuation_governance(
    current_admin: User = Depends(get_current_admin)
):
    """Get platform-wide baseline valuation parameters and Shariah governance thresholds."""
    return admin_service.get_governance_config()

@router.put("/governance", response_model=ValuationGovernanceConfig)
async def update_valuation_governance(
    updates: ValuationGovernanceUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update baseline valuation parameters and log changes in the audit record."""
    old_config = admin_service.get_governance_config().model_dump()
    new_config = admin_service.update_governance_config(updates, admin_email=current_admin.email)

    await admin_service.record_audit_event(
        session=db,
        action="update_governance_config",
        resource_type="valuation_governance",
        user_id=current_admin.id,
        ip_address=request.client.host if request.client else None,
        old_values=old_config,
        new_values=updates.model_dump(exclude_unset=True)
    )

    return new_config

@router.get("/audit-logs", response_model=AuditLogResponse)
async def get_audit_trail(
    action: Optional[str] = Query(None, description="Filter by action: update_user, reset_circuit_breaker, etc."),
    resource_type: Optional[str] = Query(None, description="Filter by resource type: user, cache, etc."),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Query administrative and operational audit records."""
    return await admin_service.list_audit_logs(
        session=db,
        action=action,
        resource_type=resource_type,
        user_id=user_id,
        limit=limit,
        offset=offset
    )
