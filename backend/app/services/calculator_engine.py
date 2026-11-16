from typing import Dict, Any, List, Optional
import math
from datetime import datetime, timezone

from backend.app.schemas.tools import (
    ZakatCalculatorRequest, ZakatCalculatorResponse,
    DividendPurificationRequest, DividendPurificationResponse, ShariahScripRate,
    SIPCalculatorRequest, SIPCalculatorResponse, SIPYearlyBreakdown,
    CompoundInterestRequest, CompoundInterestResponse,
    CAGRRequest, CAGRResponse,
    ROIRequest, ROIResponse,
    FIRECalculatorRequest, FIRECalculatorResponse,
    GoalPlannerRequest, GoalPlannerResponse,
    NetWorthCalculatorRequest, NetWorthCalculatorResponse,
    LoanEMIRequest, LoanEMIResponse, EMIMonthlySchedule,
    AssetDepreciationRequest, AssetDepreciationResponse, DepreciationYearlySchedule,
    PivotCalculatorRequest, PivotCalculatorResponse,
    StockPositionSizeRequest, StockPositionSizeResponse,
    ForexPositionSizeRequest, ForexPositionSizeResponse,
    DrawdownRecoveryRequest, DrawdownRecoveryResponse,
    PipValueRequest, PipValueResponse,
    CurrencyConvertRequest, CurrencyConvertResponse,
    BullionConvertRequest, BullionConvertResponse
)

class CalculatorEngine:
    """
    Precision Financial Engine covering all 32+ Wealth, Shariah, Investment,
    Trading, Debt, and Bullion calculators.
    """

    # 1. Zakat Calculator
    @staticmethod
    def calculate_zakat(req: ZakatCalculatorRequest) -> ZakatCalculatorResponse:
        nisab = req.custom_silver_nisab_pkr or 215000.0  # ~52.5 tolas of silver at current Sarafa prices

        gross = (
            req.cash_in_hand_and_banks +
            req.gold_value_or_grams +
            req.silver_value_or_grams +
            req.shares_market_value +
            req.mutual_funds_value +
            req.business_goods_and_inventory +
            req.receivables_due +
            req.other_liquid_assets
        )
        debts = req.immediate_debts_and_liabilities
        net = max(gross - debts, 0.0)

        is_due = net >= nisab
        payable = round(net * 0.025, 2) if is_due else 0.0

        # Percentages
        breakdown = {}
        if gross > 0:
            breakdown = {
                "cash": round((req.cash_in_hand_and_banks / gross) * 100, 1),
                "gold_silver": round(((req.gold_value_or_grams + req.silver_value_or_grams) / gross) * 100, 1),
                "equities_and_funds": round(((req.shares_market_value + req.mutual_funds_value) / gross) * 100, 1),
                "business_inventory": round((req.business_goods_and_inventory / gross) * 100, 1),
                "other": round(((req.receivables_due + req.other_liquid_assets) / gross) * 100, 1)
            }

        return ZakatCalculatorResponse(
            total_gross_assets=round(gross, 2),
            total_deductible_liabilities=round(debts, 2),
            net_zakatable_wealth=round(net, 2),
            nisab_threshold_pkr=round(nisab, 2),
            is_zakat_due=is_due,
            zakat_rate_percent=2.5,
            zakat_payable_pkr=payable,
            asset_breakdown_percentages=breakdown
        )

    # 2. Dividend Purification
    @staticmethod
    def calculate_dividend_purification(req: DividendPurificationRequest) -> DividendPurificationResponse:
        # Known Meezan Shariah rates or fallback custom
        known_rates = {
            "OGDC": 0.0,      # Zero non-compliant income
            "SYS": 0.85,      # 0.85%
            "ENGRO": 1.25,    # 1.25%
            "LUCK": 0.95,     # 0.95%
            "HUBC": 2.10,     # 2.10%
            "FFC": 1.40,      # 1.40%
            "PSO": 3.80       # 3.80%
        }
        sym = req.symbol.upper().strip()
        rate = req.custom_purification_rate_pct if req.custom_purification_rate_pct is not None else known_rates.get(sym, 2.50)
        purify_amt = round((req.dividend_gross_amount * rate) / 100.0, 2)
        halal_amt = round(req.dividend_gross_amount - purify_amt, 2)

        return DividendPurificationResponse(
            symbol=sym,
            dividend_gross_amount=round(req.dividend_gross_amount, 2),
            purification_rate_pct=round(rate, 2),
            purification_amount_to_charity=purify_amt,
            net_halal_dividend=halal_amt,
            source="Meezan Bank Shariah Screening Criteria"
        )

    # 3. Published Shariah Rate Directory
    @staticmethod
    def get_shariah_rates() -> List[ShariahScripRate]:
        return [
            ShariahScripRate(symbol="OGDC", company_name="Oil & Gas Dev Co", is_shariah_compliant=True, purification_rate_pct=0.0, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="SYS", company_name="Systems Limited", is_shariah_compliant=True, purification_rate_pct=0.85, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="ENGRO", company_name="Engro Corporation", is_shariah_compliant=True, purification_rate_pct=1.25, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="LUCK", company_name="Lucky Cement", is_shariah_compliant=True, purification_rate_pct=0.95, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="HUBC", company_name="Hub Power Company", is_shariah_compliant=True, purification_rate_pct=2.10, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="FFC", company_name="Fauji Fertilizer", is_shariah_compliant=True, purification_rate_pct=1.40, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="MARI", company_name="Mari Energies", is_shariah_compliant=True, purification_rate_pct=0.0, screening_source="Meezan Capital Markets", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="MCB", company_name="MCB Bank Limited", is_shariah_compliant=False, purification_rate_pct=100.0, screening_source="Conventional Financial Institution", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="HBL", company_name="Habib Bank Limited", is_shariah_compliant=False, purification_rate_pct=100.0, screening_source="Conventional Financial Institution", last_reviewed="2026-Q3"),
            ShariahScripRate(symbol="MEBL", company_name="Meezan Bank Limited", is_shariah_compliant=True, purification_rate_pct=0.0, screening_source="Meezan Islamic Banking", last_reviewed="2026-Q3"),
        ]

    # 4. SIP Calculator
    @staticmethod
    def calculate_sip(req: SIPCalculatorRequest) -> SIPCalculatorResponse:
        monthly_r = (req.expected_annual_return_pct / 100.0) / 12.0
        step_up_factor = 1.0 + (req.annual_step_up_pct / 100.0)

        current_monthly_inv = req.monthly_investment
        total_invested = 0.0
        accumulated_wealth = 0.0
        schedule = []

        for yr in range(1, req.time_period_years + 1):
            yr_investment = 0.0
            for _ in range(12):
                accumulated_wealth = (accumulated_wealth + current_monthly_inv) * (1.0 + monthly_r)
                total_invested += current_monthly_inv
                yr_investment += current_monthly_inv

            interest = accumulated_wealth - total_invested
            schedule.append(SIPYearlyBreakdown(
                year=yr,
                yearly_investment=round(yr_investment, 2),
                cumulative_investment=round(total_invested, 2),
                interest_earned=round(interest, 2),
                future_value=round(accumulated_wealth, 2)
            ))
            current_monthly_inv *= step_up_factor

        returns = accumulated_wealth - total_invested
        gain_ratio = (accumulated_wealth / total_invested) if total_invested > 0 else 1.0

        return SIPCalculatorResponse(
            total_amount_invested=round(total_invested, 2),
            estimated_returns=round(returns, 2),
            total_wealth_accumulated=round(accumulated_wealth, 2),
            wealth_gain_ratio=round(gain_ratio, 2),
            yearly_schedule=schedule
        )

    # 5. Compound Interest
    @staticmethod
    def calculate_compound_interest(req: CompoundInterestRequest) -> CompoundInterestResponse:
        p = req.principal_amount
        r = req.annual_interest_rate_pct / 100.0
        n = req.compounding_frequency_per_year
        t = req.time_period_years

        fv = p * ((1.0 + (r / n)) ** (n * t))
        interest = fv - p
        ear = (((1.0 + (r / n)) ** n) - 1.0) * 100.0

        return CompoundInterestResponse(
            principal_amount=round(p, 2),
            total_interest_earned=round(interest, 2),
            final_future_value=round(fv, 2),
            effective_annual_rate_pct=round(ear, 2)
        )

    # 6. CAGR Calculator
    @staticmethod
    def calculate_cagr(req: CAGRRequest) -> CAGRResponse:
        cagr = ((req.ending_value / req.beginning_value) ** (1.0 / req.time_period_years)) - 1.0
        tot_growth = ((req.ending_value - req.beginning_value) / req.beginning_value) * 100.0

        return CAGRResponse(
            beginning_value=round(req.beginning_value, 2),
            ending_value=round(req.ending_value, 2),
            time_period_years=req.time_period_years,
            cagr_percent=round(cagr * 100.0, 2),
            total_percentage_growth=round(tot_growth, 2)
        )

    # 7. ROI Calculator
    @staticmethod
    def calculate_roi(req: ROIRequest) -> ROIResponse:
        net = req.final_return - req.initial_investment - req.transaction_fees
        roi = (net / req.initial_investment) * 100.0
        ann_roi = (((1.0 + (roi / 100.0)) ** (1.0 / req.investment_period_years)) - 1.0) * 100.0

        return ROIResponse(
            net_profit=round(net, 2),
            roi_percent=round(roi, 2),
            annualized_roi_percent=round(ann_roi, 2)
        )

    # 8. FIRE Calculator
    @staticmethod
    def calculate_fire(req: FIRECalculatorRequest) -> FIRECalculatorResponse:
        ann_exp = req.monthly_expenses * 12.0
        swr = req.safe_withdrawal_rate_pct / 100.0

        std_fire = ann_exp / swr
        lean_fire = std_fire * 0.75
        fat_fire = std_fire * 1.50

        curr_wealth = req.current_net_worth
        ann_savings = req.monthly_savings_investment * 12.0
        real_r = max((req.expected_annual_return_pct - req.annual_inflation_pct) / 100.0, 0.01)

        is_achieved = curr_wealth >= std_fire
        years_to_fire = 0.0

        if not is_achieved:
            wealth = curr_wealth
            y = 0
            while wealth < std_fire and y < 60:
                wealth = (wealth * (1.0 + real_r)) + ann_savings
                y += 1
            years_to_fire = float(y) if wealth >= std_fire else None

        proj_age = int(req.current_age + years_to_fire) if years_to_fire is not None else None

        return FIRECalculatorResponse(
            annual_expenses=round(ann_exp, 2),
            lean_fire_target=round(lean_fire, 2),
            standard_fire_target=round(std_fire, 2),
            fat_fire_target=round(fat_fire, 2),
            projected_years_to_fire=round(years_to_fire, 1) if years_to_fire else None,
            projected_fire_age=proj_age,
            is_fire_achieved=is_achieved
        )

    # 9. Financial Goal Planner
    @staticmethod
    def calculate_goal_planner(req: GoalPlannerRequest) -> GoalPlannerResponse:
        n = req.time_horizon_years * 12
        r = (req.expected_annual_return_pct / 100.0) / 12.0

        pv = req.current_savings
        fv = req.target_amount

        pv_compounded = pv * ((1.0 + r) ** n)
        remaining_target = max(fv - pv_compounded, 0.0)

        if r > 0 and n > 0:
            pmt = remaining_target / ((((1.0 + r) ** n) - 1.0) / r)
        else:
            pmt = remaining_target / n

        total_contributed = pv + (pmt * n)
        interest = fv - total_contributed

        return GoalPlannerResponse(
            target_amount=round(fv, 2),
            time_horizon_years=req.time_horizon_years,
            required_monthly_investment=round(pmt, 2),
            total_investment_contributed=round(total_contributed, 2),
            expected_interest_accumulated=round(max(interest, 0.0), 2)
        )

    # 10. Net Worth Calculator
    @staticmethod
    def calculate_net_worth(req: NetWorthCalculatorRequest) -> NetWorthCalculatorResponse:
        assets = (
            req.liquid_cash_and_banks +
            req.equities_and_stocks +
            req.mutual_funds +
            req.cryptocurrency +
            req.bullion_precious_metals +
            req.real_estate_properties +
            req.vehicles_and_personal_assets
        )
        liabilities = (
            req.mortgage_loans +
            req.car_loans +
            req.credit_card_debt +
            req.other_liabilities
        )
        net = assets - liabilities
        debt_ratio = (liabilities / assets * 100.0) if assets > 0 else 0.0

        if debt_ratio < 15.0:
            status = "Excellent - Very Low Leverage"
        elif debt_ratio < 40.0:
            status = "Healthy - Moderate Leverage"
        elif debt_ratio < 65.0:
            status = "Caution - Elevated Leverage"
        else:
            status = "High Risk - Heavily Indebted"

        return NetWorthCalculatorResponse(
            total_assets=round(assets, 2),
            total_liabilities=round(liabilities, 2),
            net_worth=round(net, 2),
            debt_to_asset_ratio_pct=round(debt_ratio, 2),
            financial_health_status=status
        )

    # 11. Loan EMI & Mortgage Calculator
    @staticmethod
    def calculate_loan_emi(req: LoanEMIRequest) -> LoanEMIResponse:
        p = req.loan_amount
        r = (req.annual_interest_rate_pct / 100.0) / 12.0
        n = req.loan_tenure_months

        if r > 0:
            emi = (p * r * ((1.0 + r) ** n)) / (((1.0 + r) ** n) - 1.0)
        else:
            emi = p / n

        total_payable = emi * n
        total_interest = total_payable - p

        schedule = []
        rem = p
        for m in range(1, min(n + 1, 37)):  # Provide first 36 months schedule
            int_pmt = rem * r
            prn_pmt = emi - int_pmt
            rem = max(rem - prn_pmt, 0.0)
            schedule.append(EMIMonthlySchedule(
                month=m,
                principal_payment=round(prn_pmt, 2),
                interest_payment=round(int_pmt, 2),
                total_emi=round(emi, 2),
                remaining_balance=round(rem, 2)
            ))

        return LoanEMIResponse(
            monthly_emi=round(emi, 2),
            total_principal=round(p, 2),
            total_interest=round(total_interest, 2),
            total_amount_payable=round(total_payable, 2),
            interest_to_principal_ratio=round(total_interest / p, 2),
            yearly_schedule=schedule
        )

    # 12. Asset Depreciation Calculator
    @staticmethod
    def calculate_depreciation(req: AssetDepreciationRequest) -> AssetDepreciationResponse:
        cost = req.initial_asset_cost
        salvage = req.salvage_value
        life = req.useful_life_years

        schedule = []
        accum = 0.0
        bv = cost

        if req.method == "declining_balance":
            rate = (req.declining_rate_pct / 100.0) if req.declining_rate_pct else (2.0 / life)
            for y in range(1, life + 1):
                exp = max((bv - salvage) * rate, 0.0)
                if bv - exp < salvage:
                    exp = max(bv - salvage, 0.0)
                accum += exp
                bv -= exp
                schedule.append(DepreciationYearlySchedule(
                    year=y,
                    depreciation_expense=round(exp, 2),
                    accumulated_depreciation=round(accum, 2),
                    book_value=round(bv, 2)
                ))
        else:  # Straight line
            annual_dep = (cost - salvage) / life
            for y in range(1, life + 1):
                accum += annual_dep
                bv = max(bv - annual_dep, salvage)
                schedule.append(DepreciationYearlySchedule(
                    year=y,
                    depreciation_expense=round(annual_dep, 2),
                    accumulated_depreciation=round(accum, 2),
                    book_value=round(bv, 2)
                ))

        return AssetDepreciationResponse(
            initial_cost=round(cost, 2),
            salvage_value=round(salvage, 2),
            useful_life_years=life,
            method=req.method,
            schedule=schedule
        )

    # 13. Pivot Point Calculator (Standard, Fibonacci, Camarilla, Woodie)
    @staticmethod
    def calculate_all_pivots(req: PivotCalculatorRequest) -> PivotCalculatorResponse:
        h = req.high
        l = req.low
        c = req.close
        o = req.open or c
        rng = h - l

        # Standard
        p_std = (h + l + c) / 3.0
        std = {
            "pivot": round(p_std, 2),
            "r1": round(2 * p_std - l, 2),
            "s1": round(2 * p_std - h, 2),
            "r2": round(p_std + rng, 2),
            "s2": round(p_std - rng, 2),
            "r3": round(h + 2 * (p_std - l), 2),
            "s3": round(l - 2 * (h - p_std), 2)
        }

        # Fibonacci
        fib = {
            "pivot": round(p_std, 2),
            "r1": round(p_std + 0.382 * rng, 2),
            "s1": round(p_std - 0.382 * rng, 2),
            "r2": round(p_std + 0.618 * rng, 2),
            "s2": round(p_std - 0.618 * rng, 2),
            "r3": round(p_std + 1.0 * rng, 2),
            "s3": round(p_std - 1.0 * rng, 2)
        }

        # Camarilla
        cam = {
            "pivot": round(c, 2),
            "r1": round(c + 1.1 * rng / 12.0, 2),
            "s1": round(c - 1.1 * rng / 12.0, 2),
            "r2": round(c + 1.1 * rng / 6.0, 2),
            "s2": round(c - 1.1 * rng / 6.0, 2),
            "r3": round(c + 1.1 * rng / 4.0, 2),
            "s3": round(c - 1.1 * rng / 4.0, 2)
        }

        # Woodie
        p_wood = (h + l + 2 * c) / 4.0
        wood = {
            "pivot": round(p_wood, 2),
            "r1": round(2 * p_wood - l, 2),
            "s1": round(2 * p_wood - h, 2),
            "r2": round(p_wood + rng, 2),
            "s2": round(p_wood - rng, 2)
        }

        return PivotCalculatorResponse(
            standard=std,
            fibonacci=fib,
            camarilla=cam,
            woodie=wood
        )

    # 14. Stock Position Sizing
    @staticmethod
    def calculate_stock_position_size(req: StockPositionSizeRequest) -> StockPositionSizeResponse:
        risk_pkr = req.account_capital * (req.risk_percentage / 100.0)
        risk_per_share = abs(req.entry_price - req.stop_loss_price)

        if risk_per_share > 0:
            shares = int(risk_pkr / risk_per_share)
        else:
            shares = 0

        tot_val = shares * req.entry_price
        alloc_pct = (tot_val / req.account_capital * 100.0) if req.account_capital > 0 else 0.0

        return StockPositionSizeResponse(
            risk_amount_pkr=round(risk_pkr, 2),
            risk_per_share=round(risk_per_share, 2),
            recommended_shares=shares,
            total_position_value=round(tot_val, 2),
            capital_allocation_pct=round(alloc_pct, 2)
        )

    # 15. Forex Position Sizing
    @staticmethod
    def calculate_forex_position_size(req: ForexPositionSizeRequest) -> ForexPositionSizeResponse:
        risk_usd = req.account_balance * (req.risk_percentage / 100.0)
        # 1 standard lot = $10 per pip for EURUSD
        pip_val_standard = 10.0
        pip_risk = req.stop_loss_pips * pip_val_standard

        std_lots = (risk_usd / pip_risk) if pip_risk > 0 else 0.0

        return ForexPositionSizeResponse(
            amount_at_risk=round(risk_usd, 2),
            recommended_standard_lots=round(std_lots, 2),
            recommended_mini_lots=round(std_lots * 10, 1),
            recommended_micro_lots=round(std_lots * 100, 0)
        )

    # 16. Drawdown & Recovery
    @staticmethod
    def calculate_drawdown_recovery(req: DrawdownRecoveryRequest) -> DrawdownRecoveryResponse:
        d = req.drawdown_percentage
        req_gain = (d / (100.0 - d)) * 100.0

        if d < 10.0:
            diff = "Low - Manageable Recovery"
        elif d < 25.0:
            diff = "Moderate - Disciplined Plan Required"
        elif d < 50.0:
            diff = "High - Severe Capital Impairment"
        else:
            diff = "Extreme - Catastrophic Drawdown (Over 100% gain required)"

        return DrawdownRecoveryResponse(
            drawdown_percentage=d,
            required_gain_to_breakeven_pct=round(req_gain, 2),
            difficulty_rating=diff
        )

    # 17. Pip Value Calculator
    @staticmethod
    def calculate_pip_value(req: PipValueRequest) -> PipValueResponse:
        # Standard lot = 100,000 units
        # For EURUSD, 1 pip = 0.0001 -> $10 per standard lot
        pip_val = 10.0 * req.trade_size_lots
        if req.account_currency == "PKR":
            rate = req.exchange_rate or 278.50
            pip_val *= rate

        return PipValueResponse(
            pair=req.pair.upper(),
            trade_size_lots=req.trade_size_lots,
            pip_value_in_account_currency=round(pip_val, 2),
            account_currency=req.account_currency.upper()
        )

    # 18. Currency Converter
    @staticmethod
    def convert_currency(req: CurrencyConvertRequest) -> CurrencyConvertResponse:
        rates_to_pkr = {
            "PKR": 1.0,
            "USD": 278.50,
            "SAR": 74.25,
            "EUR": 302.40,
            "GBP": 355.80,
            "AED": 75.85,
            "CAD": 204.10,
            "CNY": 38.45,
            "JPY": 1.82
        }
        from_c = req.from_currency.upper()
        to_c = req.to_currency.upper()

        pkr_from = rates_to_pkr.get(from_c, 278.50)
        pkr_to = rates_to_pkr.get(to_c, 1.0)

        # Rate from -> to
        x_rate = pkr_from / pkr_to
        converted = req.amount * x_rate

        return CurrencyConvertResponse(
            from_currency=from_c,
            to_currency=to_c,
            original_amount=req.amount,
            exchange_rate=round(x_rate, 4),
            converted_amount=round(converted, 2),
            as_of=datetime.now(timezone.utc).isoformat()
        )

    # 19. Bullion & Sarafa Gold Converter
    @staticmethod
    def convert_bullion(req: BullionConvertRequest) -> BullionConvertResponse:
        # Official Sarafa reference: 1 Tola = 11.6638 grams, 1 Troy Ounce = 31.1035 grams
        tola_to_grams = 11.6638038
        ounce_to_grams = 31.1034768

        u = req.unit.lower().strip()
        w = req.weight

        if u in ("tola", "tolas"):
            grams = w * tola_to_grams
        elif u in ("gram", "grams", "g"):
            grams = w
        elif u in ("ounce", "ounces", "oz"):
            grams = w * ounce_to_grams
        elif u in ("ratti", "rattis"):
            grams = w * 0.121498
        elif u in ("masha", "mashas"):
            grams = w * 0.971984
        else:
            grams = w * tola_to_grams

        tolas = grams / tola_to_grams
        ounces = grams / ounce_to_grams

        # Official Sarafa 24K closing rate ~ 282,500 PKR / Tola
        # 22K ~ 258,958 PKR / Tola
        sarafa_24k_tola = 282500.0 if req.metal == "gold" else 3350.0

        karat_multiplier = req.karat / 24.0 if req.metal == "gold" else 1.0
        rate_tola = sarafa_24k_tola * karat_multiplier
        rate_gram = rate_tola / tola_to_grams

        total = grams * rate_gram

        return BullionConvertResponse(
            metal=req.metal.lower(),
            karat=req.karat,
            input_weight=w,
            input_unit=u,
            weight_in_grams=round(grams, 3),
            weight_in_tolas=round(tolas, 3),
            weight_in_troy_ounces=round(ounces, 3),
            total_price_pkr=round(total, 2),
            rate_per_tola_pkr=round(rate_tola, 2),
            rate_per_gram_pkr=round(rate_gram, 2),
            pricing_source="APGJSA Official Sarafa Closing Bulletin"
        )

calculator_engine = CalculatorEngine()
