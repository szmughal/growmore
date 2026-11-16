import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from backend.app.main import app
from backend.app.core.security import get_password_hash, create_access_token
from backend.app.core.circuit_breaker import CircuitState
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.models.user import User, UserSettings
from backend.app.services.market_gateway import market_gateway

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest_asyncio.fixture
async def admin_credentials():
    """Create a verified admin user in the database and return their auth headers."""
    async with AsyncSessionLocal() as session:
        unique_suffix = uuid.uuid4().hex[:8]
        admin = User(
            id=f"admin-{unique_suffix}",
            email=f"admin_{unique_suffix}@growmore.pk",
            hashed_password=get_password_hash("AdminPass123!"),
            full_name="Lead Operations Admin",
            role="admin",
            is_active=True,
            is_verified=True,
            country_code="PK"
        )
        settings = UserSettings(user_id=admin.id, base_currency="PKR")
        session.add(admin)
        session.add(settings)
        await session.commit()
        await session.refresh(admin)

        token = create_access_token(subject=admin.id, role=admin.role)
        return {
            "user_id": admin.id,
            "email": admin.email,
            "headers": {"Authorization": f"Bearer {token}"}
        }

@pytest_asyncio.fixture
async def regular_user_credentials():
    """Create a standard non-admin user in the database and return their auth headers."""
    async with AsyncSessionLocal() as session:
        unique_suffix = uuid.uuid4().hex[:8]
        user = User(
            id=f"user-{unique_suffix}",
            email=f"client_{unique_suffix}@growmore.pk",
            hashed_password=get_password_hash("ClientPass123!"),
            full_name="Regular Retail Investor",
            role="user",
            is_active=True,
            is_verified=True,
            country_code="PK"
        )
        settings = UserSettings(user_id=user.id, base_currency="PKR")
        session.add(user)
        session.add(settings)
        await session.commit()
        await session.refresh(user)

        token = create_access_token(subject=user.id, role=user.role)
        return {
            "user_id": user.id,
            "email": user.email,
            "headers": {"Authorization": f"Bearer {token}"}
        }

@pytest.mark.asyncio
async def test_admin_rbac_enforcement(admin_credentials, regular_user_credentials):
    """Verify that unauthenticated users get 401 and standard users get 403 on admin routes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Unauthenticated request to /admin/dashboard
        resp_unauth = await ac.get("/api/v1/admin/dashboard")
        assert resp_unauth.status_code == 401

        # 2. Regular user (role='user') request to /admin/dashboard -> 403 Forbidden
        resp_user_dash = await ac.get(
            "/api/v1/admin/dashboard",
            headers=regular_user_credentials["headers"]
        )
        assert resp_user_dash.status_code == 403
        assert "privileges" in resp_user_dash.json()["detail"].lower()

        # 3. Regular user attempting market ops -> 403
        resp_user_ops = await ac.get(
            "/api/v1/admin/market-ops",
            headers=regular_user_credentials["headers"]
        )
        assert resp_user_ops.status_code == 403

        # 4. Admin user accessing /admin/dashboard -> 200 OK
        resp_admin_dash = await ac.get(
            "/api/v1/admin/dashboard",
            headers=admin_credentials["headers"]
        )
        assert resp_admin_dash.status_code == 200

@pytest.mark.asyncio
async def test_admin_dashboard_metrics(admin_credentials):
    """Verify aggregated metrics and database table counts in Admin Dashboard."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(
            "/api/v1/admin/dashboard",
            headers=admin_credentials["headers"]
        )
        assert resp.status_code == 200
        data = resp.json()

        assert data["totalUsers"] >= 1
        assert data["activeUsers"] >= 1
        assert "rolesDistribution" in data
        assert "admin" in data["rolesDistribution"]
        assert "totalPortfolios" in data
        assert "totalAssetsTracked" in data
        assert "databaseTableCounts" in data
        table_counts = data["databaseTableCounts"]
        assert "users" in table_counts
        assert "portfolios" in table_counts
        assert "companies" in table_counts
        assert "historical_bars" in table_counts
        assert data["environment"] == "production"

@pytest.mark.asyncio
async def test_admin_market_ops_telemetry(admin_credentials):
    """Verify market operations telemetry for all 9 data adapters, cache and ingestion."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(
            "/api/v1/admin/market-ops",
            headers=admin_credentials["headers"]
        )
        assert resp.status_code == 200
        data = resp.json()

        assert "providers" in data
        providers = data["providers"]
        assert len(providers) == 9

        service_names = [p["serviceName"] for p in providers]
        expected_services = [
            "PSXDataPortal",
            "USMarketsYahoo",
            "SaudiTadawulAPI",
            "CoinGeckoCrypto",
            "ForexRatesAPI",
            "CommoditiesAndBullionAPI",
            "MUFAPMutualFundsAPI",
            "PakistanMacroEconomyAPI",
            "FinancialNewsFeed"
        ]
        for exp in expected_services:
            assert exp in service_names

        for p in providers:
            assert p["circuitState"] in ("CLOSED", "OPEN", "HALF_OPEN")
            assert p["rateLimitMaxRequests"] > 0
            assert p["rateLimitWindowSeconds"] > 0
            assert p["defaultCacheTtl"] > 0

        assert "cacheStats" in data
        assert "total_entries" in data["cacheStats"]
        assert "ingestionWorker" in data
        assert "is_running" in data["ingestionWorker"]

@pytest.mark.asyncio
async def test_admin_circuit_breaker_reset(admin_credentials):
    """Verify manual circuit breaker reset endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Trip the PSX adapter circuit breaker manually
        psx_cb = market_gateway.psx_adapter.circuit_breaker
        psx_cb.state = CircuitState.OPEN
        psx_cb.failure_count = 5
        assert psx_cb.state == CircuitState.OPEN

        # Call reset endpoint
        resp = await ac.post(
            "/api/v1/admin/market-ops/circuit-breakers/PSX%20Data%20Portal/reset",
            headers=admin_credentials["headers"]
        )
        assert resp.status_code == 200
        assert psx_cb.state == CircuitState.CLOSED
        assert psx_cb.failure_count == 0

        # Non-existent service returns 404
        resp_404 = await ac.post(
            "/api/v1/admin/market-ops/circuit-breakers/NonExistentProvider/reset",
            headers=admin_credentials["headers"]
        )
        assert resp_404.status_code == 404

@pytest.mark.asyncio
async def test_admin_cache_flush_and_warm(admin_credentials):
    """Verify cache clear and manual cache warming endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Clear cache
        resp_clear = await ac.post(
            "/api/v1/admin/market-ops/cache/clear",
            headers=admin_credentials["headers"]
        )
        assert resp_clear.status_code == 200
        assert resp_clear.json()["status"] == "success"

        # Warm cache
        resp_warm = await ac.post(
            "/api/v1/admin/market-ops/cache/warm",
            headers=admin_credentials["headers"]
        )
        assert resp_warm.status_code == 200
        assert resp_warm.json()["status"] == "success"

@pytest.mark.asyncio
async def test_admin_user_management(admin_credentials, regular_user_credentials):
    """Verify listing users, filtering, user detail, role updates, and self-deactivation protection."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. List users
        resp_list = await ac.get(
            "/api/v1/admin/users?limit=20",
            headers=admin_credentials["headers"]
        )
        assert resp_list.status_code == 200
        users = resp_list.json()
        assert len(users) >= 2
        user_ids = [u["id"] for u in users]
        assert regular_user_credentials["user_id"] in user_ids

        # 2. Filter by search query
        resp_search = await ac.get(
            f"/api/v1/admin/users?search={regular_user_credentials['email']}",
            headers=admin_credentials["headers"]
        )
        assert resp_search.status_code == 200
        search_res = resp_search.json()
        assert len(search_res) == 1
        assert search_res[0]["id"] == regular_user_credentials["user_id"]

        # 3. Get single user details
        target_id = regular_user_credentials["user_id"]
        resp_detail = await ac.get(
            f"/api/v1/admin/users/{target_id}",
            headers=admin_credentials["headers"]
        )
        assert resp_detail.status_code == 200
        detail = resp_detail.json()
        assert detail["id"] == target_id
        assert detail["role"] == "user"

        # 4. Update user role to advisor
        resp_patch = await ac.patch(
            f"/api/v1/admin/users/{target_id}",
            json={"role": "advisor"},
            headers=admin_credentials["headers"]
        )
        assert resp_patch.status_code == 200
        updated = resp_patch.json()
        assert updated["role"] == "advisor"

        # 5. Prevent admin from deactivating self
        resp_self_deact = await ac.patch(
            f"/api/v1/admin/users/{admin_credentials['user_id']}",
            json={"isActive": False},
            headers=admin_credentials["headers"]
        )
        assert resp_self_deact.status_code == 400
        assert "cannot deactivate" in resp_self_deact.json()["detail"].lower()

@pytest.mark.asyncio
async def test_admin_valuation_governance(admin_credentials):
    """Verify inspection and modification of platform valuation governance parameters."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Fetch current governance config
        resp_get = await ac.get(
            "/api/v1/admin/governance",
            headers=admin_credentials["headers"]
        )
        assert resp_get.status_code == 200
        cfg = resp_get.json()
        assert "defaultRiskFreeRate" in cfg
        assert "shariahDebtToEquityThreshold" in cfg
        assert cfg["shariahDebtToEquityThreshold"] == 0.37

        # 2. Update governance parameters
        update_payload = {
            "defaultRiskFreeRate": 0.135,
            "shariahDebtToEquityThreshold": 0.35
        }
        resp_put = await ac.put(
            "/api/v1/admin/governance",
            json=update_payload,
            headers=admin_credentials["headers"]
        )
        assert resp_put.status_code == 200
        new_cfg = resp_put.json()
        assert new_cfg["defaultRiskFreeRate"] == 0.135
        assert new_cfg["shariahDebtToEquityThreshold"] == 0.35
        assert new_cfg["updatedBy"] == admin_credentials["email"]

@pytest.mark.asyncio
async def test_admin_audit_logs(admin_credentials):
    """Verify querying of audit trail events."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(
            "/api/v1/admin/audit-logs?limit=50",
            headers=admin_credentials["headers"]
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "records" in data
        assert isinstance(data["records"], list)
