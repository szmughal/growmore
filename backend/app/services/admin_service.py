import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update
from sqlalchemy.orm import selectinload

from backend.app.core.cache import cache_service
from backend.app.core.circuit_breaker import CircuitState
from backend.app.models.user import User, UserSettings
from backend.app.models.portfolio import Portfolio, PortfolioAsset, Transaction, Liability
from backend.app.models.market import Company, HistoricalBar
from backend.app.models.funds import MutualFund
from backend.app.models.macro import MacroIndicatorRecord, CorporateAnnouncementRecord
from backend.app.models.admin import APILog, AuditRecord
from backend.app.services.market_gateway import market_gateway
from backend.app.services.market_ingestion import market_ingestion_worker
from backend.app.schemas.admin import (
    SystemOverviewStats,
    ProviderTelemetry,
    MarketOpsTelemetry,
    UserAdminItem,
    UserAdminUpdate,
    ValuationGovernanceConfig,
    ValuationGovernanceUpdate,
    AuditRecordItem,
    AuditLogResponse
)

logger = logging.getLogger("growmore.admin")

class AdminOperationsService:
    """
    Central Administration and Operations Service.
    Monitors market data providers, manages users, controls valuation governance,
    and tracks administrative audit trails.
    """

    def __init__(self):
        # Default platform-wide valuation & governance baseline
        self._governance_config: Dict[str, Any] = {
            "default_risk_free_rate": 0.14,           # 14% PKRV 10Y Yield
            "default_equity_risk_premium": 0.06,      # 6% Equity Risk Premium
            "perpetual_growth_rate_min": 0.015,       # 1.5% Minimum Terminal Growth
            "perpetual_growth_rate_max": 0.045,       # 4.5% Maximum Terminal Growth
            "default_tax_rate": 0.29,                 # 29% Pakistan Corporate Tax Rate
            "shariah_debt_to_equity_threshold": 0.37, # 37% Meezan Screening Criteria
            "shariah_illiquid_assets_threshold": 0.25, # 25% Illiquid asset minimum
            "shariah_non_compliant_income_threshold": 0.05, # 5% Haram income maximum
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": "system_bootstrap"
        }

    async def get_system_overview(self, session: AsyncSession) -> SystemOverviewStats:
        """Aggregate high-level system metrics and database record counts."""
        # User metrics
        total_users = (await session.execute(select(func.count(User.id)))).scalar_one() or 0
        active_users = (await session.execute(select(func.count(User.id)).where(User.is_active == True))).scalar_one() or 0
        inactive_users = total_users - active_users
        verified_users = (await session.execute(select(func.count(User.id)).where(User.is_verified == True))).scalar_one() or 0

        # Roles breakdown
        role_stmt = select(User.role, func.count(User.id)).group_by(User.role)
        role_rows = (await session.execute(role_stmt)).all()
        roles_dist = {row[0]: row[1] for row in role_rows}

        # Portfolio metrics
        total_portfolios = (await session.execute(select(func.count(Portfolio.id)))).scalar_one() or 0
        total_assets = (await session.execute(select(func.count(PortfolioAsset.id)))).scalar_one() or 0
        total_transactions = (await session.execute(select(func.count(Transaction.id)))).scalar_one() or 0
        total_liabilities = (await session.execute(select(func.count(Liability.id)))).scalar_one() or 0

        # Database table counts
        table_counts = {
            "users": total_users,
            "portfolios": total_portfolios,
            "portfolio_assets": total_assets,
            "transactions": total_transactions,
            "liabilities": total_liabilities,
            "companies": (await session.execute(select(func.count(Company.id)))).scalar_one() or 0,
            "historical_bars": (await session.execute(select(func.count(HistoricalBar.id)))).scalar_one() or 0,
            "mutual_funds": (await session.execute(select(func.count(MutualFund.id)))).scalar_one() or 0,
            "macro_indicators": (await session.execute(select(func.count(MacroIndicatorRecord.id)))).scalar_one() or 0,
            "corporate_announcements": (await session.execute(select(func.count(CorporateAnnouncementRecord.id)))).scalar_one() or 0,
            "audit_records": (await session.execute(select(func.count(AuditRecord.id)))).scalar_one() or 0,
            "api_logs": (await session.execute(select(func.count(APILog.id)))).scalar_one() or 0,
        }

        return SystemOverviewStats(
            total_users=total_users,
            active_users=active_users,
            inactive_users=inactive_users,
            verified_users=verified_users,
            roles_distribution=roles_dist,
            total_portfolios=total_portfolios,
            total_assets_tracked=total_assets,
            total_transactions=total_transactions,
            total_liabilities=total_liabilities,
            database_table_counts=table_counts,
            server_time=datetime.now(timezone.utc).isoformat(),
            environment="production"
        )

    def _get_adapters(self) -> List[Any]:
        return [
            market_gateway.psx_adapter,
            market_gateway.us_adapter,
            market_gateway.saudi_adapter,
            market_gateway.crypto_adapter,
            market_gateway.forex_adapter,
            market_gateway.commodities_adapter,
            market_gateway.funds_adapter,
            market_gateway.macro_adapter,
            market_gateway.news_adapter,
        ]

    async def get_market_ops_telemetry(self) -> MarketOpsTelemetry:
        """Inspect all live provider adapters, circuit breakers, rate limiters and cache."""
        adapters = self._get_adapters()
        provider_telemetry_list: List[ProviderTelemetry] = []

        for adp in adapters:
            last_fail = None
            if adp.circuit_breaker.last_failure_time:
                last_fail = datetime.fromtimestamp(adp.circuit_breaker.last_failure_time, tz=timezone.utc).isoformat()
            
            last_succ = None
            if adp.circuit_breaker.last_success_time:
                last_succ = datetime.fromtimestamp(adp.circuit_breaker.last_success_time, tz=timezone.utc).isoformat()

            provider_telemetry_list.append(
                ProviderTelemetry(
                    service_name=adp.service_name,
                    circuit_state=adp.circuit_breaker.state.value,
                    failure_count=adp.circuit_breaker.failure_count,
                    last_failure_time=last_fail,
                    last_success_time=last_succ,
                    rate_limit_load_pct=round(adp.rate_limiter.current_load_pct(), 2),
                    rate_limit_max_requests=adp.rate_limiter.max_requests,
                    rate_limit_window_seconds=adp.rate_limiter.window_seconds,
                    default_cache_ttl=adp.default_cache_ttl
                )
            )

        cache_stats = await cache_service.get_stats()
        ingestion_stats = market_ingestion_worker.get_status()

        return MarketOpsTelemetry(
            providers=provider_telemetry_list,
            cache_stats=cache_stats,
            ingestion_worker=ingestion_stats,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    def reset_circuit_breaker(self, service_name: str) -> bool:
        """Find adapter by service_name and manually reset its circuit breaker."""
        s_clean = service_name.lower().replace(" ", "").replace("_", "").replace("-", "")
        for adp in self._get_adapters():
            adp_clean = adp.service_name.lower().replace(" ", "").replace("_", "").replace("-", "")
            if adp_clean == s_clean or s_clean in adp_clean:
                adp.circuit_breaker.reset()
                return True
        return False

    async def clear_cache(self) -> None:
        """Flush the central cache store."""
        await cache_service.clear()
        logger.info("Admin manually cleared cache.")

    async def warm_cache(self) -> None:
        """Trigger immediate background ingestion cache warming."""
        await market_ingestion_worker.warm_all_caches()
        logger.info("Admin triggered cache warming cycle.")

    def get_governance_config(self) -> ValuationGovernanceConfig:
        return ValuationGovernanceConfig(**self._governance_config)

    def update_governance_config(
        self,
        updates: ValuationGovernanceUpdate,
        admin_email: str
    ) -> ValuationGovernanceConfig:
        data = updates.model_dump(exclude_unset=True)
        for key, val in data.items():
            if val is not None:
                self._governance_config[key] = val
        self._governance_config["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._governance_config["updated_by"] = admin_email
        return ValuationGovernanceConfig(**self._governance_config)

    async def list_users(
        self,
        session: AsyncSession,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[UserAdminItem]:
        """Query users with filtering and portfolio counts."""
        stmt = (
            select(
                User,
                func.count(Portfolio.id).label("portfolios_count")
            )
            .outerjoin(Portfolio, Portfolio.user_id == User.id)
            .group_by(User.id)
            .order_by(desc(User.created_at))
        )

        if search:
            s = f"%{search.strip().lower()}%"
            stmt = stmt.where(func.lower(User.email).like(s) | func.lower(User.full_name).like(s))

        if role:
            stmt = stmt.where(User.role == role.strip().lower())

        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)

        stmt = stmt.limit(limit).offset(offset)
        rows = (await session.execute(stmt)).all()

        items = []
        for user, p_count in rows:
            items.append(
                UserAdminItem(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    country_code=user.country_code,
                    created_at=user.created_at.isoformat() if user.created_at else "",
                    portfolios_count=p_count or 0
                )
            )
        return items

    async def get_user_by_id(self, session: AsyncSession, user_id: str) -> Optional[UserAdminItem]:
        stmt = (
            select(
                User,
                func.count(Portfolio.id).label("portfolios_count")
            )
            .outerjoin(Portfolio, Portfolio.user_id == User.id)
            .where(User.id == user_id)
            .group_by(User.id)
        )
        row = (await session.execute(stmt)).first()
        if not row:
            return None
        user, p_count = row
        return UserAdminItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            country_code=user.country_code,
            created_at=user.created_at.isoformat() if user.created_at else "",
            portfolios_count=p_count or 0
        )

    async def update_user(
        self,
        session: AsyncSession,
        user_id: str,
        update_data: UserAdminUpdate
    ) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        user = (await session.execute(stmt)).scalar_one_or_none()
        if not user:
            return None

        if update_data.role is not None:
            user.role = update_data.role.strip().lower()

        if update_data.is_active is not None:
            user.is_active = update_data.is_active

        await session.commit()
        await session.refresh(user)
        return user

    async def record_audit_event(
        self,
        session: AsyncSession,
        action: str,
        resource_type: str,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None
    ) -> AuditRecord:
        record = AuditRecord(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            old_values=old_values,
            new_values=new_values,
            created_at=datetime.now(timezone.utc)
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)
        return record

    async def list_audit_logs(
        self,
        session: AsyncSession,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> AuditLogResponse:
        base_query = select(AuditRecord).options(selectinload(AuditRecord.user))

        if action:
            base_query = base_query.where(AuditRecord.action == action)
        if resource_type:
            base_query = base_query.where(AuditRecord.resource_type == resource_type)
        if user_id:
            base_query = base_query.where(AuditRecord.user_id == user_id)

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await session.execute(count_stmt)).scalar_one() or 0

        # Query records
        stmt = base_query.order_by(desc(AuditRecord.created_at)).limit(limit).offset(offset)
        records = (await session.execute(stmt)).scalars().all()

        items = []
        for r in records:
            items.append(
                AuditRecordItem(
                    id=r.id,
                    user_id=r.user_id,
                    user_email=r.user.email if r.user else None,
                    action=r.action,
                    resource_type=r.resource_type,
                    resource_id=r.resource_id,
                    ip_address=r.ip_address,
                    old_values=r.old_values,
                    new_values=r.new_values,
                    created_at=r.created_at.isoformat() if r.created_at else ""
                )
            )

        return AuditLogResponse(
            total=total,
            limit=limit,
            offset=offset,
            records=items
        )

admin_service = AdminOperationsService()
