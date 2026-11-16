from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class SystemOverviewStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_users: int = Field(..., alias="totalUsers")
    active_users: int = Field(..., alias="activeUsers")
    inactive_users: int = Field(..., alias="inactiveUsers")
    verified_users: int = Field(..., alias="verifiedUsers")
    roles_distribution: Dict[str, int] = Field(..., alias="rolesDistribution")
    total_portfolios: int = Field(..., alias="totalPortfolios")
    total_assets_tracked: int = Field(..., alias="totalAssetsTracked")
    total_transactions: int = Field(..., alias="totalTransactions")
    total_liabilities: int = Field(..., alias="totalLiabilities")
    database_table_counts: Dict[str, int] = Field(..., alias="databaseTableCounts")
    server_time: str = Field(..., alias="serverTime")
    environment: str = Field("production", alias="environment")

class ProviderTelemetry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    service_name: str = Field(..., alias="serviceName")
    circuit_state: str = Field(..., alias="circuitState")
    failure_count: int = Field(..., alias="failureCount")
    last_failure_time: Optional[str] = Field(None, alias="lastFailureTime")
    last_success_time: Optional[str] = Field(None, alias="lastSuccessTime")
    rate_limit_load_pct: float = Field(..., alias="rateLimitLoadPct")
    rate_limit_max_requests: int = Field(..., alias="rateLimitMaxRequests")
    rate_limit_window_seconds: float = Field(..., alias="rateLimitWindowSeconds")
    default_cache_ttl: int = Field(..., alias="defaultCacheTtl")

class MarketOpsTelemetry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    providers: List[ProviderTelemetry] = Field(..., alias="providers")
    cache_stats: Dict[str, Any] = Field(..., alias="cacheStats")
    ingestion_worker: Dict[str, Any] = Field(..., alias="ingestionWorker")
    timestamp: str = Field(..., alias="timestamp")

class UserAdminItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="id")
    email: str = Field(..., alias="email")
    full_name: str = Field(..., alias="fullName")
    role: str = Field(..., alias="role")
    is_active: bool = Field(..., alias="isActive")
    is_verified: bool = Field(..., alias="isVerified")
    country_code: Optional[str] = Field("PK", alias="countryCode")
    created_at: str = Field(..., alias="createdAt")
    portfolios_count: int = Field(0, alias="portfoliosCount")

class UserAdminUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role: Optional[str] = Field(None, description="Role: user, advisor, admin, superadmin")
    is_active: Optional[bool] = Field(None, alias="isActive")

class ValuationGovernanceConfig(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    default_risk_free_rate: float = Field(..., alias="defaultRiskFreeRate")
    default_equity_risk_premium: float = Field(..., alias="defaultEquityRiskPremium")
    perpetual_growth_rate_min: float = Field(..., alias="perpetualGrowthRateMin")
    perpetual_growth_rate_max: float = Field(..., alias="perpetualGrowthRateMax")
    default_tax_rate: float = Field(..., alias="defaultTaxRate")
    shariah_debt_to_equity_threshold: float = Field(..., alias="shariahDebtToEquityThreshold")
    shariah_illiquid_assets_threshold: float = Field(..., alias="shariahIlliquidAssetsThreshold")
    shariah_non_compliant_income_threshold: float = Field(..., alias="shariahNonCompliantIncomeThreshold")
    updated_at: str = Field(..., alias="updatedAt")
    updated_by: Optional[str] = Field(None, alias="updatedBy")

class ValuationGovernanceUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    default_risk_free_rate: Optional[float] = Field(None, alias="defaultRiskFreeRate")
    default_equity_risk_premium: Optional[float] = Field(None, alias="defaultEquityRiskPremium")
    perpetual_growth_rate_min: Optional[float] = Field(None, alias="perpetualGrowthRateMin")
    perpetual_growth_rate_max: Optional[float] = Field(None, alias="perpetualGrowthRateMax")
    default_tax_rate: Optional[float] = Field(None, alias="defaultTaxRate")
    shariah_debt_to_equity_threshold: Optional[float] = Field(None, alias="shariahDebtToEquityThreshold")
    shariah_illiquid_assets_threshold: Optional[float] = Field(None, alias="shariahIlliquidAssetsThreshold")
    shariah_non_compliant_income_threshold: Optional[float] = Field(None, alias="shariahNonCompliantIncomeThreshold")

class AuditRecordItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int = Field(..., alias="id")
    user_id: Optional[str] = Field(None, alias="userId")
    user_email: Optional[str] = Field(None, alias="userEmail")
    action: str = Field(..., alias="action")
    resource_type: str = Field(..., alias="resourceType")
    resource_id: Optional[str] = Field(None, alias="resourceId")
    ip_address: Optional[str] = Field(None, alias="ipAddress")
    old_values: Optional[Dict[str, Any]] = Field(None, alias="oldValues")
    new_values: Optional[Dict[str, Any]] = Field(None, alias="newValues")
    created_at: str = Field(..., alias="createdAt")

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total: int = Field(..., alias="total")
    limit: int = Field(..., alias="limit")
    offset: int = Field(..., alias="offset")
    records: List[AuditRecordItem] = Field(..., alias="records")
