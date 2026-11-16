from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import timedelta

from backend.app.api.deps import get_db, get_current_active_user
from backend.app.core.config import settings
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from backend.app.models.user import User, UserSettings
from backend.app.models.portfolio import Portfolio
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    UserSettingsUpdate,
    UserSettingsResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account, initialize settings, and provision primary portfolio."""
    # Check if user already exists
    existing_user_stmt = select(User).where(User.email == payload.email.lower().strip())
    existing_res = await db.execute(existing_user_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password
    hashed_pwd = get_password_hash(payload.password)

    # Create user
    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number,
        country_code=payload.country_code.upper(),
        role="user",
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    await db.flush()

    # Create user default settings
    user_settings = UserSettings(
        user_id=new_user.id,
        base_currency=payload.base_currency.upper(),
        theme_mode="dark",
        color_palette="default",
        default_market=payload.country_code.upper() if payload.country_code.upper() in ("PK", "US", "SA") else "PK",
        email_notifications=True,
        price_alert_notifications=True
    )
    db.add(user_settings)

    # Automatically provision primary portfolio
    primary_portfolio = Portfolio(
        user_id=new_user.id,
        name="Main Wealth Portfolio",
        description="Default multi-asset primary portfolio",
        base_currency=payload.base_currency.upper(),
        is_primary=True,
        is_public=False
    )
    db.add(primary_portfolio)

    await db.commit()
    await db.refresh(new_user)

    # Re-fetch with settings loaded
    stmt = select(User).where(User.id == new_user.id).options(selectinload(User.settings))
    res = await db.execute(stmt)
    user_with_settings = res.scalar_one()

    return user_with_settings

@router.post("/login", response_model=TokenResponse)
async def login_user(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with email and password, returning JWT access and refresh tokens."""
    email_clean = payload.email.lower().strip()
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact support."
        )

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Exchange a valid refresh token for a newly signed access token."""
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided token is not a valid refresh token."
        )

    user_id = decoded.get("sub")
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is no longer valid or active."
        )

    new_access_token = create_access_token(subject=user.id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Return the profile and personal settings of the currently authenticated user."""
    return current_user

@router.put("/me/settings", response_model=UserSettingsResponse)
async def update_user_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile preferences (theme, base currency, notifications)."""
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    res = await db.execute(stmt)
    user_settings = res.scalar_one_or_none()

    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)

    if payload.base_currency is not None:
        user_settings.base_currency = payload.base_currency.upper()
    if payload.theme_mode is not None:
        user_settings.theme_mode = payload.theme_mode
    if payload.color_palette is not None:
        user_settings.color_palette = payload.color_palette
    if payload.default_market is not None:
        user_settings.default_market = payload.default_market.upper()
    if payload.email_notifications is not None:
        user_settings.email_notifications = payload.email_notifications
    if payload.price_alert_notifications is not None:
        user_settings.price_alert_notifications = payload.price_alert_notifications

    await db.commit()
    await db.refresh(user_settings)
    return user_settings
