from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserRegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=8, description="Strong password with minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=150, description="Full display name")
    phone_number: Optional[str] = Field(None, max_length=50)
    country_code: str = Field(default="PK", max_length=10)
    base_currency: str = Field(default="PKR", max_length=10)

class UserLoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr = Field(...)
    password: str = Field(...)

class TokenResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int

class RefreshTokenRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    refresh_token: str

class UserSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    base_currency: str = "PKR"
    theme_mode: str = "dark"
    color_palette: str = "default"
    default_market: str = "PK"
    email_notifications: bool = True
    price_alert_notifications: bool = True

class UserSettingsUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    base_currency: Optional[str] = None
    theme_mode: Optional[str] = None
    color_palette: Optional[str] = None
    default_market: Optional[str] = None
    email_notifications: Optional[bool] = None
    price_alert_notifications: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    two_factor_enabled: bool
    phone_number: Optional[str] = None
    country_code: str
    created_at: datetime
    settings: Optional[UserSettingsResponse] = None
