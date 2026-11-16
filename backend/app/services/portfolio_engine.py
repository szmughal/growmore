from decimal import Decimal
from datetime import date, datetime
from typing import List, Tuple, Optional, Dict, Any
import math

class PortfolioEngine:
    """
    Precision Financial Engine for Portfolio Valuation, FIFO Cost Allocation,
    Realized/Unrealized Gain & Loss, XIRR, and CAGR Calculations.
    """

    @staticmethod
    def calculate_unrealized_pnl(
        quantity: Decimal,
        average_buy_price: Decimal,
        current_market_price: Decimal
    ) -> Tuple[Decimal, Decimal]:
        """
        Calculates unrealized P&L amount and percentage return.
        Returns: (unrealized_amount, unrealized_percentage)
        """
        if quantity <= Decimal("0"):
            return Decimal("0.00"), Decimal("0.00")

        total_cost = quantity * average_buy_price
        current_value = quantity * current_market_price
        pnl_amount = current_value - total_cost

        if total_cost > Decimal("0"):
            pnl_percent = (pnl_amount / total_cost) * Decimal("100")
        else:
            pnl_percent = Decimal("0.00")

        return round(pnl_amount, 6), round(pnl_percent, 4)

    @staticmethod
    def process_buy_transaction(
        current_qty: Decimal,
        current_cost_basis: Decimal,
        buy_qty: Decimal,
        buy_unit_price: Decimal,
        fees: Decimal = Decimal("0"),
        taxes: Decimal = Decimal("0")
    ) -> Tuple[Decimal, Decimal, Decimal]:
        """
        Applies a BUY transaction to an asset holding.
        Returns: (new_quantity, new_average_buy_price, new_total_cost_basis)
        """
        added_cost = (buy_qty * buy_unit_price) + fees + taxes
        new_qty = current_qty + buy_qty
        new_cost_basis = current_cost_basis + added_cost
        
        if new_qty > Decimal("0"):
            new_avg_price = new_cost_basis / new_qty
        else:
            new_avg_price = Decimal("0")

        return round(new_qty, 8), round(new_avg_price, 6), round(new_cost_basis, 6)

    @staticmethod
    def process_sell_fifo(
        buy_lots: List[Dict[str, Any]],
        sell_qty: Decimal,
        sell_unit_price: Decimal,
        fees: Decimal = Decimal("0"),
        taxes: Decimal = Decimal("0")
    ) -> Tuple[Decimal, Decimal, List[Dict[str, Any]]]:
        """
        Executes a SELL order matching against historical BUY lots using First-In, First-Out (FIFO).
        Each lot dict in buy_lots should have:
          {"lot_id": str, "unit_cost": Decimal, "remaining_qty": Decimal}
        Returns:
          (realized_pnl, cost_of_shares_sold, updated_buy_lots)
        """
        remaining_to_sell = sell_qty
        cost_of_shares_sold = Decimal("0")
        updated_lots = []

        for lot in buy_lots:
            rem = lot["remaining_qty"]
            if rem <= Decimal("0") or remaining_to_sell <= Decimal("0"):
                updated_lots.append(lot.copy())
                continue

            take = min(remaining_to_sell, rem)
            lot_cost = take * lot["unit_cost"]
            cost_of_shares_sold += lot_cost
            remaining_to_sell -= take

            updated_lot = lot.copy()
            updated_lot["remaining_qty"] = rem - take
            updated_lots.append(updated_lot)

        gross_proceeds = sell_qty * sell_unit_price
        net_proceeds = gross_proceeds - fees - taxes
        realized_pnl = net_proceeds - cost_of_shares_sold

        return round(realized_pnl, 6), round(cost_of_shares_sold, 6), updated_lots

    @staticmethod
    def calculate_cagr(
        start_value: float,
        end_value: float,
        years: float
    ) -> Optional[float]:
        """
        Calculates Compound Annual Growth Rate: (End / Start) ** (1 / years) - 1.
        """
        if start_value <= 0 or end_value <= 0 or years <= 0:
            return None
        try:
            cagr = (end_value / start_value) ** (1.0 / years) - 1.0
            return round(cagr * 100.0, 4)
        except Exception:
            return None

    @staticmethod
    def calculate_xirr(
        cash_flows: List[Tuple[date, float]],
        guess: float = 0.1,
        max_iterations: int = 100,
        tolerance: float = 1e-6
    ) -> Optional[float]:
        """
        Calculates Extended Internal Rate of Return (XIRR) using Newton-Raphson method
        with bisection search fallback for irregular cash flow dates.
        
        Cash flows: List of (date, amount) where:
          - Negative amounts are investments/outflows
          - Positive amounts are dividends/sales/current terminal value
        """
        if not cash_flows or len(cash_flows) < 2:
            return None

        # Sort cash flows chronologically
        sorted_flows = sorted(cash_flows, key=lambda x: x[0])
        d0 = sorted_flows[0][0]

        # Verify there is at least one negative and one positive cash flow
        has_pos = any(amt > 0 for _, amt in sorted_flows)
        has_neg = any(amt < 0 for _, amt in sorted_flows)
        if not (has_pos and has_neg):
            return None

        def npv(rate: float) -> float:
            total = 0.0
            for d, amt in sorted_flows:
                days = (d - d0).days
                total += amt / ((1.0 + rate) ** (days / 365.0))
            return total

        def npv_prime(rate: float) -> float:
            total = 0.0
            for d, amt in sorted_flows:
                days = (d - d0).days
                denom = (1.0 + rate) ** ((days / 365.0) + 1.0)
                total -= (days / 365.0) * amt / denom
            return total

        # Newton-Raphson iteration
        rate = guess
        for _ in range(max_iterations):
            val = npv(rate)
            if abs(val) < tolerance:
                return round(rate * 100.0, 4)

            derivative = npv_prime(rate)
            if abs(derivative) < 1e-9:
                break

            new_rate = rate - (val / derivative)
            # Bound rate to avoid runaway divergence
            if new_rate <= -0.9999:
                new_rate = (rate - 0.9999) / 2.0
            elif new_rate > 10.0:
                new_rate = 10.0

            if abs(new_rate - rate) < tolerance:
                return round(new_rate * 100.0, 4)
            rate = new_rate

        # Bisection fallback if Newton-Raphson did not converge
        low = -0.999
        high = 5.0
        val_low = npv(low)
        val_high = npv(high)

        if val_low * val_high > 0:
            return None

        for _ in range(100):
            mid = (low + high) / 2.0
            val_mid = npv(mid)
            if abs(val_mid) < tolerance or (high - low) / 2.0 < tolerance:
                return round(mid * 100.0, 4)
            if val_low * val_mid < 0:
                high = mid
                val_high = val_mid
            else:
                low = mid
                val_low = val_mid

        return round(mid * 100.0, 4)

    @staticmethod
    def calculate_net_worth(
        total_asset_value: Decimal,
        total_liabilities_balance: Decimal
    ) -> Decimal:
        """Net Worth = Total Assets - Total Liabilities"""
        return round(total_asset_value - total_liabilities_balance, 2)
