import pytest
from decimal import Decimal
from datetime import date
from backend.app.services.portfolio_engine import PortfolioEngine

def test_unrealized_pnl_calculation():
    qty = Decimal("100")
    avg_price = Decimal("250.00")
    current_price = Decimal("275.00")

    pnl_amount, pnl_pct = PortfolioEngine.calculate_unrealized_pnl(qty, avg_price, current_price)
    # Total cost = 25000, current value = 27500, pnl = +2500, pct = +10%
    assert pnl_amount == Decimal("2500.000000")
    assert pnl_pct == Decimal("10.0000")

def test_unrealized_pnl_loss():
    qty = Decimal("50")
    avg_price = Decimal("200.00")
    current_price = Decimal("180.00")

    pnl_amount, pnl_pct = PortfolioEngine.calculate_unrealized_pnl(qty, avg_price, current_price)
    # Total cost = 10000, current value = 9000, pnl = -1000, pct = -10%
    assert pnl_amount == Decimal("-1000.000000")
    assert pnl_pct == Decimal("-10.0000")

def test_buy_transaction_cost_basis_accumulation():
    # Buy lot 1: 100 shares @ 100 PKR + 50 fees
    qty1, avg1, cost1 = PortfolioEngine.process_buy_transaction(
        current_qty=Decimal("0"),
        current_cost_basis=Decimal("0"),
        buy_qty=Decimal("100"),
        buy_unit_price=Decimal("100.00"),
        fees=Decimal("50.00"),
        taxes=Decimal("0.00")
    )
    assert qty1 == Decimal("100")
    assert cost1 == Decimal("10050.000000")
    assert avg1 == Decimal("100.500000")

    # Buy lot 2: 100 shares @ 120 PKR + 50 fees
    qty2, avg2, cost2 = PortfolioEngine.process_buy_transaction(
        current_qty=qty1,
        current_cost_basis=cost1,
        buy_qty=Decimal("100"),
        buy_unit_price=Decimal("120.00"),
        fees=Decimal("50.00"),
        taxes=Decimal("0.00")
    )
    assert qty2 == Decimal("200")
    # Total cost = 10050 + 12050 = 22100
    assert cost2 == Decimal("22100.000000")
    # Avg price = 22100 / 200 = 110.50
    assert avg2 == Decimal("110.500000")

def test_fifo_sell_across_multiple_lots():
    # Lot 1: 50 shares @ 100
    # Lot 2: 50 shares @ 150
    buy_lots = [
        {"lot_id": "lot-1", "unit_cost": Decimal("100.00"), "remaining_qty": Decimal("50")},
        {"lot_id": "lot-2", "unit_cost": Decimal("150.00"), "remaining_qty": Decimal("50")},
    ]

    # Sell 70 shares @ 180 PKR (Depleting 50 from Lot 1 and 20 from Lot 2)
    # Sold cost = (50 * 100) + (20 * 150) = 5000 + 3000 = 8000
    # Gross proceeds = 70 * 180 = 12600
    # Fees = 100, Taxes = 0 -> Net proceeds = 12500
    # Realized Gain = 12500 - 8000 = +4500
    realized_pnl, cost_sold, updated_lots = PortfolioEngine.process_sell_fifo(
        buy_lots=buy_lots,
        sell_qty=Decimal("70"),
        sell_unit_price=Decimal("180.00"),
        fees=Decimal("100.00"),
        taxes=Decimal("0.00")
    )

    assert cost_sold == Decimal("8000.000000")
    assert realized_pnl == Decimal("4500.000000")
    assert updated_lots[0]["remaining_qty"] == Decimal("0")
    assert updated_lots[1]["remaining_qty"] == Decimal("30")

def test_xirr_calculation():
    # Benchmark: -10,000 on Jan 1 2024, +11,000 on Jan 1 2025 -> ~10% XIRR
    cash_flows = [
        (date(2024, 1, 1), -10000.0),
        (date(2025, 1, 1), 11000.0)
    ]
    rate = PortfolioEngine.calculate_xirr(cash_flows)
    assert rate is not None
    # 366 days in leap year 2024: (11000 / 10000) ^ (365 / 366) - 1 ≈ 9.97%
    assert 9.9 <= rate <= 10.1

def test_cagr_calculation():
    # 10,000 to 20,000 in 3 years
    # CAGR = (2)^(1/3) - 1 = 1.2599 - 1 = 25.99%
    cagr = PortfolioEngine.calculate_cagr(10000.0, 20000.0, 3.0)
    assert cagr is not None
    assert 25.9 <= cagr <= 26.1

def test_net_worth_calculation():
    assets = Decimal("15000000.50")
    liabilities = Decimal("3200000.00")
    net_worth = PortfolioEngine.calculate_net_worth(assets, liabilities)
    assert net_worth == Decimal("11800000.50")
