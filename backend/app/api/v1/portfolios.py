from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timezone

from backend.app.api.deps import get_db, get_current_active_user
from backend.app.models.user import User
from backend.app.models.portfolio import (
    Portfolio,
    PortfolioAsset,
    Transaction,
    Dividend,
    Liability
)
from backend.app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioDetailResponse,
    PortfolioSummaryResponse,
    AssetCreate,
    AssetResponse,
    TransactionCreate,
    TransactionResponse,
    DividendCreate,
    DividendResponse,
    LiabilityCreate,
    LiabilityUpdate,
    LiabilityResponse
)
from backend.app.services.portfolio_engine import PortfolioEngine

router = APIRouter(prefix="/portfolios", tags=["Portfolio Management & Calculations"])

async def get_user_portfolio_or_404(
    portfolio_id: str,
    user_id: str,
    db: AsyncSession
) -> Portfolio:
    """Helper to verify ownership of a portfolio."""
    stmt = (
        select(Portfolio)
        .where(and_(Portfolio.id == portfolio_id, Portfolio.user_id == user_id))
        .options(
            selectinload(Portfolio.assets),
            selectinload(Portfolio.liabilities)
        )
    )
    res = await db.execute(stmt)
    portfolio = res.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or access denied."
        )
    return portfolio

@router.get("", response_model=List[PortfolioDetailResponse])
async def list_portfolios(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all investment portfolios owned by the authenticated user."""
    stmt = (
        select(Portfolio)
        .where(Portfolio.user_id == current_user.id)
        .options(
            selectinload(Portfolio.assets),
            selectinload(Portfolio.liabilities)
        )
        .order_by(Portfolio.is_primary.desc(), Portfolio.created_at.asc())
    )
    res = await db.execute(stmt)
    portfolios = res.scalars().all()
    return portfolios

@router.post("", response_model=PortfolioDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    payload: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new portfolio workspace."""
    # If set as primary, un-mark existing primary portfolios
    if payload.is_primary:
        existing_stmt = select(Portfolio).where(
            and_(Portfolio.user_id == current_user.id, Portfolio.is_primary == True)
        )
        existing_res = await db.execute(existing_stmt)
        for p in existing_res.scalars().all():
            p.is_primary = False

    new_portfolio = Portfolio(
        user_id=current_user.id,
        name=payload.name.strip(),
        description=payload.description,
        base_currency=payload.base_currency.upper(),
        is_primary=payload.is_primary,
        is_public=payload.is_public
    )
    db.add(new_portfolio)
    await db.commit()
    await db.refresh(new_portfolio)

    return await get_user_portfolio_or_404(new_portfolio.id, current_user.id, db)

@router.get("/{portfolio_id}", response_model=PortfolioDetailResponse)
async def get_portfolio_detail(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full portfolio details with nested assets and liabilities."""
    return await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

@router.put("/{portfolio_id}", response_model=PortfolioDetailResponse)
async def update_portfolio(
    portfolio_id: str,
    payload: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update portfolio properties (name, description, base currency)."""
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    if payload.is_primary:
        existing_stmt = select(Portfolio).where(
            and_(Portfolio.user_id == current_user.id, Portfolio.id != portfolio_id, Portfolio.is_primary == True)
        )
        existing_res = await db.execute(existing_stmt)
        for p in existing_res.scalars().all():
            p.is_primary = False

    if payload.name is not None:
        portfolio.name = payload.name.strip()
    if payload.description is not None:
        portfolio.description = payload.description
    if payload.base_currency is not None:
        portfolio.base_currency = payload.base_currency.upper()
    if payload.is_primary is not None:
        portfolio.is_primary = payload.is_primary
    if payload.is_public is not None:
        portfolio.is_public = payload.is_public

    await db.commit()
    return await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a portfolio and cascade delete all nested assets and transactions."""
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)
    await db.delete(portfolio)
    await db.commit()
    return None

@router.get("/{portfolio_id}/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate real-time portfolio performance:
    - Market value, Total cost basis
    - Unrealized P&L and Percentage
    - Cumulative Realized P&L
    - Total Dividend Income
    - Total Liabilities & Net Worth
    - Asset allocation breakdown
    - XIRR and CAGR return metrics
    """
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    # Calculate asset totals
    total_market_value = Decimal("0")
    total_cost_basis = Decimal("0")
    total_unrealized_pnl = Decimal("0")
    total_realized_pnl = Decimal("0")
    allocation: dict = {}

    for asset in portfolio.assets:
        total_market_value += asset.current_market_value
        total_cost_basis += asset.total_cost_basis
        total_unrealized_pnl += asset.unrealized_pnl
        total_realized_pnl += asset.realized_pnl

        # Accumulate allocation by type
        atype = asset.asset_type
        allocation[atype] = allocation.get(atype, Decimal("0")) + asset.current_market_value

    if total_cost_basis > Decimal("0"):
        total_unrealized_pnl_pct = round((total_unrealized_pnl / total_cost_basis) * Decimal("100"), 4)
    else:
        total_unrealized_pnl_pct = Decimal("0.00")

    # Fetch total dividend income
    div_stmt = select(Dividend).where(Dividend.portfolio_id == portfolio_id)
    div_res = await db.execute(div_stmt)
    dividends = div_res.scalars().all()
    total_dividends = sum((d.net_amount for d in dividends), Decimal("0"))

    # Fetch total liabilities
    total_liabilities = sum((l.outstanding_balance for l in portfolio.liabilities), Decimal("0"))

    # Net Worth
    net_worth = PortfolioEngine.calculate_net_worth(total_market_value, total_liabilities)

    # Cash flows for XIRR calculation
    tx_stmt = (
        select(Transaction)
        .where(and_(Transaction.portfolio_id == portfolio_id, Transaction.is_deleted == False))
        .order_by(Transaction.transaction_date.asc())
    )
    tx_res = await db.execute(tx_stmt)
    transactions = tx_res.scalars().all()

    cash_flows = []
    for tx in transactions:
        # Buys are cash outflows (negative), Sells are cash inflows (positive)
        if tx.transaction_type == "buy":
            cash_flows.append((tx.transaction_date, -float(tx.net_amount)))
        elif tx.transaction_type == "sell":
            cash_flows.append((tx.transaction_date, float(tx.net_amount)))

    for d in dividends:
        cash_flows.append((d.payment_date, float(d.net_amount)))

    # Terminal value cashflow as of today
    if total_market_value > Decimal("0"):
        cash_flows.append((datetime.now(timezone.utc).date(), float(total_market_value)))

    xirr_val = PortfolioEngine.calculate_xirr(cash_flows) if len(cash_flows) >= 2 else None

    # CAGR calculation
    cagr_val = None
    if len(transactions) > 0 and total_cost_basis > Decimal("0"):
        first_date = transactions[0].transaction_date
        now_date = datetime.now(timezone.utc).date()
        days_held = (now_date - first_date).days
        if days_held > 30:
            cagr_val = PortfolioEngine.calculate_cagr(
                float(total_cost_basis),
                float(total_market_value),
                days_held / 365.25
            )

    return PortfolioSummaryResponse(
        portfolio_id=portfolio.id,
        name=portfolio.name,
        base_currency=portfolio.base_currency,
        total_market_value=round(total_market_value, 2),
        total_cost_basis=round(total_cost_basis, 2),
        total_unrealized_pnl=round(total_unrealized_pnl, 2),
        total_unrealized_pnl_percent=total_unrealized_pnl_pct,
        total_realized_pnl=round(total_realized_pnl, 2),
        total_dividend_income=round(total_dividends, 2),
        total_liabilities=round(total_liabilities, 2),
        net_worth=round(net_worth, 2),
        cagr_percent=cagr_val,
        xirr_percent=xirr_val,
        assets_count=len(portfolio.assets),
        allocation_by_type=allocation
    )

# ----------------- ASSET HOLDINGS -----------------

@router.post("/{portfolio_id}/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_asset(
    portfolio_id: str,
    payload: AssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new asset holding to the portfolio."""
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    # Check for existing asset with same symbol and market
    sym_clean = payload.symbol.upper().strip()
    mkt_clean = payload.market.upper().strip()
    atype_clean = payload.asset_type.lower().strip()

    check_stmt = select(PortfolioAsset).where(
        and_(
            PortfolioAsset.portfolio_id == portfolio_id,
            PortfolioAsset.symbol == sym_clean,
            PortfolioAsset.market == mkt_clean
        )
    )
    existing_asset = (await db.execute(check_stmt)).scalar_one_or_none()
    if existing_asset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset {sym_clean} already exists in this portfolio. Record a transaction to adjust holdings."
        )

    initial_qty = payload.initial_quantity
    initial_price = payload.initial_price
    cost_basis = initial_qty * initial_price
    market_val = cost_basis  # default initial market value to cost basis

    asset = PortfolioAsset(
        portfolio_id=portfolio_id,
        asset_type=atype_clean,
        symbol=sym_clean,
        name=payload.name.strip(),
        market=mkt_clean,
        currency=payload.currency.upper(),
        quantity=initial_qty,
        average_buy_price=initial_price,
        total_cost_basis=cost_basis,
        current_market_price=initial_price,
        current_market_value=market_val,
        unrealized_pnl=Decimal("0"),
        unrealized_pnl_percent=Decimal("0"),
        realized_pnl=Decimal("0"),
        notes=payload.notes
    )
    db.add(asset)
    await db.flush()

    # If initial quantity > 0, create an initial BUY transaction
    if initial_qty > Decimal("0"):
        tx = Transaction(
            portfolio_asset_id=asset.id,
            portfolio_id=portfolio_id,
            transaction_type="buy",
            transaction_date=datetime.now(timezone.utc).date(),
            quantity=initial_qty,
            unit_price=initial_price,
            total_amount=cost_basis,
            fees=Decimal("0"),
            taxes=Decimal("0"),
            net_amount=cost_basis,
            currency=payload.currency.upper(),
            notes="Initial position opening"
        )
        db.add(tx)

    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/{portfolio_id}/assets", response_model=List[AssetResponse])
async def list_portfolio_assets(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all asset holdings in a portfolio."""
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)
    return portfolio.assets

# ----------------- TRANSACTIONS (FIFO) -----------------

@router.post("/{portfolio_id}/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def record_transaction(
    portfolio_id: str,
    payload: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Record a Buy or Sell transaction with strict FIFO cost-basis allocation.
    Automatically recalculates average buy price, total cost basis, and realized P&L.
    """
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    # Verify asset exists in this portfolio
    asset_stmt = select(PortfolioAsset).where(
        and_(PortfolioAsset.id == payload.asset_id, PortfolioAsset.portfolio_id == portfolio_id)
    )
    asset = (await db.execute(asset_stmt)).scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified asset not found in this portfolio."
        )

    tx_type = payload.transaction_type.lower().strip()
    gross_amount = payload.quantity * payload.unit_price

    if tx_type == "buy":
        net_amount = gross_amount + payload.fees + payload.taxes
        new_qty, new_avg, new_cost = PortfolioEngine.process_buy_transaction(
            current_qty=asset.quantity,
            current_cost_basis=asset.total_cost_basis,
            buy_qty=payload.quantity,
            buy_unit_price=payload.unit_price,
            fees=payload.fees,
            taxes=payload.taxes
        )
        asset.quantity = new_qty
        asset.average_buy_price = new_avg
        asset.total_cost_basis = new_cost
        asset.current_market_value = new_qty * asset.current_market_price
        
        # Recalculate unrealized P&L
        unrealized_amt, unrealized_pct = PortfolioEngine.calculate_unrealized_pnl(
            new_qty, new_avg, asset.current_market_price
        )
        asset.unrealized_pnl = unrealized_amt
        asset.unrealized_pnl_percent = unrealized_pct

        realized_gain_loss = Decimal("0")

    elif tx_type == "sell":
        if payload.quantity > asset.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot sell {payload.quantity} units; current holding is only {asset.quantity} units."
            )
        net_amount = gross_amount - payload.fees - payload.taxes

        # Retrieve historical BUY transactions for this asset to perform FIFO lot matching
        buy_txs_stmt = (
            select(Transaction)
            .where(
                and_(
                    Transaction.portfolio_asset_id == asset.id,
                    Transaction.transaction_type == "buy",
                    Transaction.is_deleted == False
                )
            )
            .order_by(Transaction.transaction_date.asc(), Transaction.created_at.asc())
        )
        buy_txs = (await db.execute(buy_txs_stmt)).scalars().all()

        # Build lots list
        # Simple FIFO lot model: Lot remaining quantity tracked against buys
        buy_lots = [
            {"lot_id": tx.id, "unit_cost": tx.unit_price, "remaining_qty": tx.quantity}
            for tx in buy_txs
        ]

        # Account for prior sells already processed
        prior_sells_stmt = select(Transaction).where(
            and_(
                Transaction.portfolio_asset_id == asset.id,
                Transaction.transaction_type == "sell",
                Transaction.is_deleted == False
            )
        )
        prior_sells = (await db.execute(prior_sells_stmt)).scalars().all()
        total_already_sold = sum((s.quantity for s in prior_sells), Decimal("0"))

        # Deplete buy lots by prior sold quantity
        deplete = total_already_sold
        for lot in buy_lots:
            if deplete <= Decimal("0"):
                break
            take = min(deplete, lot["remaining_qty"])
            lot["remaining_qty"] -= take
            deplete -= take

        # Now apply current sell using FIFO
        realized_gain_loss, cost_of_sold, _ = PortfolioEngine.process_sell_fifo(
            buy_lots=buy_lots,
            sell_qty=payload.quantity,
            sell_unit_price=payload.unit_price,
            fees=payload.fees,
            taxes=payload.taxes
        )

        # Update asset record
        asset.quantity -= payload.quantity
        asset.total_cost_basis -= cost_of_sold
        if asset.quantity > Decimal("0"):
            asset.average_buy_price = round(asset.total_cost_basis / asset.quantity, 6)
        else:
            asset.average_buy_price = Decimal("0")
            asset.total_cost_basis = Decimal("0")

        asset.realized_pnl += realized_gain_loss
        asset.current_market_value = asset.quantity * asset.current_market_price

        unrealized_amt, unrealized_pct = PortfolioEngine.calculate_unrealized_pnl(
            asset.quantity, asset.average_buy_price, asset.current_market_price
        )
        asset.unrealized_pnl = unrealized_amt
        asset.unrealized_pnl_percent = unrealized_pct

    else:
        net_amount = gross_amount
        realized_gain_loss = Decimal("0")

    # Record the transaction
    new_tx = Transaction(
        portfolio_asset_id=asset.id,
        portfolio_id=portfolio_id,
        transaction_type=tx_type,
        transaction_date=payload.transaction_date,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        total_amount=gross_amount,
        fees=payload.fees,
        taxes=payload.taxes,
        net_amount=net_amount,
        currency=payload.currency.upper(),
        exchange_rate_to_base=payload.exchange_rate_to_base,
        realized_gain_loss=realized_gain_loss,
        notes=payload.notes
    )
    db.add(new_tx)

    await db.commit()
    await db.refresh(new_tx)
    return new_tx

@router.get("/{portfolio_id}/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    portfolio_id: str,
    asset_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List historical transactions with optional asset filter."""
    await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    conditions = [Transaction.portfolio_id == portfolio_id, Transaction.is_deleted == False]
    if asset_id:
        conditions.append(Transaction.portfolio_asset_id == asset_id)

    stmt = select(Transaction).where(and_(*conditions)).order_by(Transaction.transaction_date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

# ----------------- DIVIDENDS (SHARIAH PURIFICATION) -----------------

@router.post("/{portfolio_id}/dividends", response_model=DividendResponse, status_code=status.HTTP_201_CREATED)
async def record_dividend(
    portfolio_id: str,
    payload: DividendCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Record dividend income with withholding tax, zakat, and Shariah purification tracking."""
    portfolio = await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    dividend = Dividend(
        portfolio_asset_id=payload.asset_id,
        portfolio_id=portfolio_id,
        ex_date=payload.ex_date,
        payment_date=payload.payment_date,
        dividend_per_share=payload.dividend_per_share,
        gross_amount=payload.gross_amount,
        withholding_tax=payload.withholding_tax,
        zakat_deduction=payload.zakat_deduction,
        net_amount=payload.net_amount,
        purification_rate_pct=payload.purification_rate_pct,
        purification_amount=payload.purification_amount,
        currency=payload.currency.upper(),
        notes=payload.notes
    )
    db.add(dividend)
    await db.commit()
    await db.refresh(dividend)
    return dividend

@router.get("/{portfolio_id}/dividends", response_model=List[DividendResponse])
async def list_dividends(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all recorded dividend payouts for a portfolio."""
    await get_user_portfolio_or_404(portfolio_id, current_user.id, db)
    stmt = select(Dividend).where(Dividend.portfolio_id == portfolio_id).order_by(Dividend.payment_date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

# ----------------- LIABILITIES & LOANS -----------------

@router.post("/{portfolio_id}/liabilities", response_model=LiabilityResponse, status_code=status.HTTP_201_CREATED)
async def add_liability(
    portfolio_id: str,
    payload: LiabilityCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Record a loan or liability against the portfolio (mortgage, auto loan, credit card)."""
    await get_user_portfolio_or_404(portfolio_id, current_user.id, db)

    liability = Liability(
        portfolio_id=portfolio_id,
        liability_name=payload.liability_name.strip(),
        liability_type=payload.liability_type.lower().strip(),
        original_principal=payload.original_principal,
        outstanding_balance=payload.outstanding_balance,
        interest_rate_annual=payload.interest_rate_annual,
        monthly_payment_emi=payload.monthly_payment_emi,
        start_date=payload.start_date,
        end_date=payload.end_date,
        currency=payload.currency.upper(),
        notes=payload.notes
    )
    db.add(liability)
    await db.commit()
    await db.refresh(liability)
    return liability

@router.get("/{portfolio_id}/liabilities", response_model=List[LiabilityResponse])
async def list_liabilities(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all liabilities recorded in the portfolio."""
    await get_user_portfolio_or_404(portfolio_id, current_user.id, db)
    stmt = select(Liability).where(Liability.portfolio_id == portfolio_id).order_by(Liability.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.delete("/{portfolio_id}/liabilities/{liability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_liability(
    portfolio_id: str,
    liability_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a liability record."""
    await get_user_portfolio_or_404(portfolio_id, current_user.id, db)
    stmt = select(Liability).where(
        and_(Liability.id == liability_id, Liability.portfolio_id == portfolio_id)
    )
    res = await db.execute(stmt)
    liability = res.scalar_one_or_none()
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found.")

    await db.delete(liability)
    await db.commit()
    return None
