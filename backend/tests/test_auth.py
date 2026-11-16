import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token
)
from backend.app.db.session import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_password_hashing():
    raw_pwd = "SuperSecretPassword123!"
    hashed = get_password_hash(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

@pytest.mark.asyncio
async def test_jwt_token_creation_and_decoding():
    user_id = "test-user-uuid-12345"
    token = create_access_token(subject=user_id, role="user")
    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == "user"
    assert payload["type"] == "access"
    assert "exp" in payload

@pytest.mark.asyncio
async def test_user_registration_and_login_flow():
    import uuid
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        unique_email = f"investor_{uuid.uuid4().hex[:8]}@growmore.pk"
        reg_payload = {
            "email": unique_email,
            "password": "StrongPassword2026!",
            "full_name": "Tariq Mahmood",
            "country_code": "PK",
            "base_currency": "PKR"
        }

        # 1. Register new user
        reg_resp = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert reg_resp.status_code == 201
        reg_data = reg_resp.json()
        assert reg_data["email"] == unique_email
        assert reg_data["full_name"] == "Tariq Mahmood"
        assert "id" in reg_data
        assert reg_data["settings"]["base_currency"] == "PKR"

        # 2. Duplicate registration must fail with 400
        dup_resp = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert dup_resp.status_code == 400
        assert "already exists" in dup_resp.json()["detail"]

        # 3. Invalid credentials login must fail with 401
        bad_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "WrongPassword999!"}
        )
        assert bad_login.status_code == 401

        # 4. Valid credentials login must succeed with tokens
        good_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "StrongPassword2026!"}
        )
        assert good_login.status_code == 200
        token_data = good_login.json()
        assert "access_token" in token_data
        assert "refresh_token" in token_data
        assert token_data["token_type"] == "bearer"
        access_token = token_data["access_token"]
        refresh_token = token_data["refresh_token"]

        # 5. Protected route /me using Bearer token
        me_resp = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == unique_email

        # 6. Refresh token endpoint
        ref_resp = await ac.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert ref_resp.status_code == 200
        new_token_data = ref_resp.json()
        assert "access_token" in new_token_data
