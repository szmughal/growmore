import pytest
import pytest_asyncio
import uuid
import jwt
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone, timedelta

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash, create_access_token
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.models.user import User, UserSettings
from backend.app.models.portfolio import Portfolio

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest_asyncio.fixture
async def tenant_users():
    """Create two isolated test users: Tenant Alpha and Tenant Beta."""
    async with AsyncSessionLocal() as session:
        # Tenant Alpha
        suffix_a = uuid.uuid4().hex[:8]
        user_a = User(
            id=f"user-alpha-{suffix_a}",
            email=f"alpha_{suffix_a}@growmore.pk",
            hashed_password=get_password_hash("PasswordAlpha123!"),
            full_name="Investor Alpha",
            role="user",
            is_active=True,
            is_verified=True,
            country_code="PK"
        )
        settings_a = UserSettings(user_id=user_a.id, base_currency="PKR")
        portfolio_a = Portfolio(
            id=f"port-alpha-{suffix_a}",
            user_id=user_a.id,
            name="Alpha Confidential Portfolio",
            description="Highly sensitive corporate asset holdings",
            base_currency="PKR",
            is_primary=True,
            is_public=False
        )
        session.add_all([user_a, settings_a, portfolio_a])

        # Tenant Beta
        suffix_b = uuid.uuid4().hex[:8]
        user_b = User(
            id=f"user-beta-{suffix_b}",
            email=f"beta_{suffix_b}@growmore.pk",
            hashed_password=get_password_hash("PasswordBeta123!"),
            full_name="Investor Beta",
            role="user",
            is_active=True,
            is_verified=True,
            country_code="PK"
        )
        settings_b = UserSettings(user_id=user_b.id, base_currency="PKR")
        portfolio_b = Portfolio(
            id=f"port-beta-{suffix_b}",
            user_id=user_b.id,
            name="Beta Growth Fund",
            base_currency="USD",
            is_primary=True,
            is_public=False
        )
        session.add_all([user_b, settings_b, portfolio_b])

        await session.commit()
        await session.refresh(user_a)
        await session.refresh(user_b)
        await session.refresh(portfolio_a)
        await session.refresh(portfolio_b)

        token_a = create_access_token(subject=user_a.id, role=user_a.role)
        token_b = create_access_token(subject=user_b.id, role=user_b.role)

        return {
            "user_a": user_a,
            "portfolio_a": portfolio_a,
            "headers_a": {"Authorization": f"Bearer {token_a}"},
            "user_b": user_b,
            "portfolio_b": portfolio_b,
            "headers_b": {"Authorization": f"Bearer {token_b}"}
        }

@pytest.mark.asyncio
async def test_owasp_security_headers_enforcement():
    """Verify that all standard OWASP defense headers are present on API responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/health")
        assert resp.status_code == 200

        headers = resp.headers
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "camera=()" in headers.get("Permissions-Policy", "")
        assert "frame-ancestors 'none'" in headers.get("Content-Security-Policy", "")

@pytest.mark.asyncio
async def test_tenant_isolation_horizontal_privilege_escalation(tenant_users):
    """
    Verify complete tenant isolation:
    User B cannot inspect, mutate, summarize, or delete User A's portfolios.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        port_a_id = tenant_users["portfolio_a"].id
        headers_b = tenant_users["headers_b"]

        # 1. User B attempts to read Portfolio A -> 404 Not Found
        resp_get = await ac.get(f"/api/v1/portfolios/{port_a_id}", headers=headers_b)
        assert resp_get.status_code == 404
        assert "not found" in resp_get.json()["detail"].lower()

        # 2. User B attempts to view Portfolio A summary -> 404 Not Found
        resp_summary = await ac.get(f"/api/v1/portfolios/{port_a_id}/summary", headers=headers_b)
        assert resp_summary.status_code == 404

        # 3. User B attempts to mutate Portfolio A details -> 404 Not Found
        resp_put = await ac.put(
            f"/api/v1/portfolios/{port_a_id}",
            json={"name": "Hacked Name Override"},
            headers=headers_b
        )
        assert resp_put.status_code == 404

        # 4. User B attempts to inject a transaction into Portfolio A -> 404 Not Found
        tx_payload = {
            "asset_id": "fake-asset-id",
            "transaction_type": "buy",
            "transaction_date": "2026-11-14",
            "quantity": 100,
            "unit_price": 50,
            "currency": "PKR"
        }
        resp_tx = await ac.post(
            f"/api/v1/portfolios/{port_a_id}/transactions",
            json=tx_payload,
            headers=headers_b
        )
        assert resp_tx.status_code == 404

        # 5. User B attempts to delete Portfolio A -> 404 Not Found
        resp_del = await ac.delete(f"/api/v1/portfolios/{port_a_id}", headers=headers_b)
        assert resp_del.status_code == 404

@pytest.mark.asyncio
async def test_sqli_resilience_in_parameters():
    """Verify that SQL injection strings in path and query parameters are safely handled."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. SQLi attempt in symbol path
        sqli_symbols = [
            "OGDC' OR '1'='1",
            "SYS'; DROP TABLE users;--",
            "ENGRO' UNION SELECT 1,2,3,4--",
            "admin'--"
        ]
        for sym in sqli_symbols:
            resp = await ac.get(f"/api/v1/fundamentals/{sym}")
            # Must return 404 or clean error, not 500 SQL syntax crash
            assert resp.status_code in (400, 404)

        # 2. SQLi attempt in news query search
        resp_news = await ac.get("/api/v1/news?q=' UNION SELECT email,hashed_password FROM users--")
        assert resp_news.status_code == 200
        # Results should be empty or safe news articles, zero user data leaked
        data = resp_news.json()
        assert "articles" in data

@pytest.mark.asyncio
async def test_xss_input_vector_safety(tenant_users):
    """Verify that XSS script vectors in portfolio descriptions and names are safely stored as data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        xss_payload = {
            "name": "<script>alert('xss_attack')</script>",
            "description": "<img src=x onerror=alert('img_xss') />",
            "base_currency": "PKR",
            "is_primary": False
        }
        resp = await ac.post(
            "/api/v1/portfolios",
            json=xss_payload,
            headers=tenant_users["headers_a"]
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "<script>alert('xss_attack')</script>"
        assert data["description"] == "<img src=x onerror=alert('img_xss') />"

@pytest.mark.asyncio
async def test_sensitive_credential_exposure_defense(tenant_users):
    """Verify that password hashes and internal secrets are NEVER exposed in user representations."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Check current user profile
        resp = await ac.get("/api/v1/auth/me", headers=tenant_users["headers_a"])
        assert resp.status_code == 200
        user_data = resp.json()

        assert "hashed_password" not in user_data
        assert "password" not in user_data
        assert "two_factor_secret" not in user_data

@pytest.mark.asyncio
async def test_jwt_tampering_and_forgery_rejection():
    """Verify that forged, algorithm-swapped ('none'), or expired JWTs are rejected with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Token forged with wrong secret
        fake_secret = "completely-wrong-secret-key-12345"
        forged_token = jwt.encode(
            {"sub": "admin-1", "role": "admin", "type": "access", "exp": (datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()},
            fake_secret,
            algorithm="HS256"
        )
        resp_forged = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {forged_token}"})
        assert resp_forged.status_code == 401

        # 2. Token with algorithm 'none' (CVE-2015-9235 defense)
        none_token = jwt.encode(
            {"sub": "admin-1", "role": "admin", "type": "access"},
            key="",
            algorithm="none"
        )
        resp_none = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {none_token}"})
        assert resp_none.status_code == 401

        # 3. Expired token
        expired_token = jwt.encode(
            {"sub": "admin-1", "role": "admin", "type": "access", "exp": (datetime.now(timezone.utc) - timedelta(hours=2)).timestamp()},
            settings.SECRET_KEY,
            algorithm="HS256"
        )
        resp_exp = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert resp_exp.status_code == 401
