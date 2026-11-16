from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime, date
from decimal import Decimal

class PortfolioCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    base_currency: str = Field(default="PKR", max_length=10)
    is_primary: bool = False
    is_public: bool = False

class PortfolioUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    base_currency: Optional[str] = None
    is_primary: Optional[bool] = None
    is_public: Optional[bool] = None

class AssetCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    asset_type: str = Field(..., description="stock, mutual_fund, crypto, forex, commodity, real_estate, cash")
    symbol: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    market: str = Field(default="PK", max_length=20)
    currency: str = Field(default="PKR", max_length=10)
    initial_quantity: Decimal = Field(default=Decimal("0"), ge=0)
    initial_price: Decimal = Field(default=Decimal("0"), ge=0)
    notes: Optional[str] = None

class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    portfolio_id: str
    asset_type: str
    symbol: str
    name: str
    market: str
    currency: str
    quantity: Decimal
    average_buy_price: Decimal
    total_cost_basis: Decimal
    current_market_price: Decimal
    current_market_value: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_percent: Decimal
    realized_pnl: Decimal
    last_price_updated_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TransactionCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    asset_id: str
    transaction_type: str = Field(..., description="buy, sell, dividend, bonus, split, fee")
    transaction_date: date
    quantity: Decimal = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    fees: Decimal = Field(default=Decimal("0"), ge=0)
    taxes: Decimal = Field(default=Decimal("0"), ge=0)
    currency: str = Field(default="PKR", max_length=10)
    exchange_rate_to_base: Decimal = Field(default=Decimal("1.0"), gt=0)
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    portfolio_asset_id: str
    portfolio_id: str
    transaction_type: str
    transaction_date: date
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    fees: Decimal
    taxes: Decimal
    net_amount: Decimal
    currency: str
    exchange_rate_to_base: Decimal
    realized_gain_loss: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime

class DividendCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    asset_id: str
    ex_date: Optional[date] = None
    payment_date: date
    dividend_per_share: Decimal = Field(..., ge=0)
    gross_amount: Decimal = Field(..., ge=0)
    withholding_tax: Decimal = Field(default=Decimal("0"), ge=0)
    zakat_deduction: Decimal = Field(default=Decimal("0"), ge=0)
    net_amount: Decimal = Field(..., ge=0)
    purification_rate_pct: Decimal = Field(default=Decimal("0"), ge=0)
    purification_amount: Decimal = Field(default=Decimal("0"), ge=0)
    currency: str = Field(default="PKR", max_length=10)
    notes: Optional[str] = None

class DividendResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    portfolio_asset_id: str
    portfolio_id: str
    ex_date: Optional[date] = None
    payment_date: date
    dividend_per_share: Decimal
    gross_amount: Decimal
    withholding_tax: Decimal
    zakat_deduction: Decimal
    net_amount: Decimal
    purification_rate_pct: Decimal
    purification_amount: Decimal
    currency: str
    notes: Optional[str] = None
    created_at: datetime

class LiabilityCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    liability_name: str = Field(..., min_length=1, max_length=255)
    liability_type: str = Field(..., description="mortgage, personal_loan, auto_loan, credit_card, other")
    original_principal: Decimal = Field(..., gt=0)
    outstanding_balance: Decimal = Field(..., ge=0)
    interest_rate_annual: Decimal = Field(..., ge=0)
    monthly_payment_emi: Decimal = Field(default=Decimal("0"), ge=0)
    start_date: date
    end_date: Optional[date] = None
    currency: str = Field(default="PKR", max_length=10)
    notes: Optional[str] = None

class LiabilityUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    liability_name: Optional[str] = None
    outstanding_balance: Optional[Decimal] = None
    monthly_payment_emi: Optional[Decimal] = None
    notes: Optional[str] = None

class LiabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    portfolio_id: str
    liability_name: str
    liability_type: str
    original_principal: Decimal
    outstanding_balance: Decimal
    interest_rate_annual: Decimal
    monthly_payment_emi: Decimal
    start_date: date
    end_date: Optional[date] = None
    currency: str
    notes: Optional[str] = None
    created_at: datetime

class PortfolioSummaryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    portfolio_id: str
    name: str
    base_currency: str
    total_market_value: Decimal
    total_cost_basis: Decimal
    total_unrealized_pnl: Decimal
    total_unrealized_pnl_percent: Decimal
    total_realized_pnl: Decimal
    total_dividend_income: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    cagr_percent: Optional[float] = None
    xirr_percent: Optional[float] = None
    assets_count: int
    allocation_by_type: Dict[str, Decimal]

class PortfolioDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    base_currency: str
    is_primary: bool
    is_public: bool
    share_token: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    assets: List[AssetResponse] = []
    liabilities: List[LiabilityResponse] = []
    summary: Optional[PortfolioSummaryResponse] = None
