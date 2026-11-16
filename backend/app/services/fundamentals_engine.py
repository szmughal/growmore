from typing import Dict, Any, List, Optional
from decimal import Decimal
import math
from backend.app.schemas.fundamentals import (
    DCFValuationRequest,
    DCFValuationResponse,
    PeterLynchValuationResponse,
    FinancialScores
)

class FundamentalsEngine:
    """
    Financial Analysis Engine: DCF Intrinsic Valuation, Peter Lynch Fair Value,
    and 5-Factor Proprietary Scoring System (Health, Quality, Growth, Stability, Value).
    """

    @staticmethod
    def calculate_dcf(
        req: DCFValuationRequest,
        current_price: float
    ) -> DCFValuationResponse:
        """
        Calculates 2-Stage Discounted Cash Flow (DCF) intrinsic value per share.
        Stage 1: High growth phase (e.g. 5 years)
        Stage 2: Maturing growth phase (e.g. 5 years)
        Terminal: Gordon Growth perpetual annuity
        """
        fcf = req.fcf_base
        wacc = req.discount_rate_wacc
        g_term = req.terminal_growth_rate

        if wacc <= g_term:
            # WACC must be strictly greater than terminal growth rate
            wacc = g_term + 0.02

        projections = []
        pv_fcf_sum = 0.0
        year_idx = 1

        # Stage 1
        for _ in range(req.growth_years_stage1):
            fcf = fcf * (1.0 + req.growth_rate_stage1)
            discount_factor = 1.0 / ((1.0 + wacc) ** year_idx)
            pv_fcf = fcf * discount_factor
            pv_fcf_sum += pv_fcf
            projections.append({
                "year": year_idx,
                "stage": 1,
                "projected_fcf": round(fcf, 2),
                "discount_factor": round(discount_factor, 4),
                "present_value": round(pv_fcf, 2)
            })
            year_idx += 1

        # Stage 2
        for _ in range(req.growth_years_stage2):
            fcf = fcf * (1.0 + req.growth_rate_stage2)
            discount_factor = 1.0 / ((1.0 + wacc) ** year_idx)
            pv_fcf = fcf * discount_factor
            pv_fcf_sum += pv_fcf
            projections.append({
                "year": year_idx,
                "stage": 2,
                "projected_fcf": round(fcf, 2),
                "discount_factor": round(discount_factor, 4),
                "present_value": round(pv_fcf, 2)
            })
            year_idx += 1

        # Terminal Value
        terminal_fcf = fcf * (1.0 + g_term)
        terminal_value = terminal_fcf / (wacc - g_term)
        pv_terminal_value = terminal_value / ((1.0 + wacc) ** (year_idx - 1))

        # Enterprise Value & Equity Value
        enterprise_value = pv_fcf_sum + pv_terminal_value
        net_debt = req.total_debt - req.cash_and_equivalents
        equity_value = enterprise_value - net_debt

        intrinsic_per_share = max(equity_value / req.shares_outstanding, 0.0)

        # Margin of safety
        if intrinsic_per_share > 0:
            margin_of_safety = ((intrinsic_per_share - current_price) / intrinsic_per_share) * 100.0
        else:
            margin_of_safety = -100.0

        if margin_of_safety > 30.0:
            verdict = "Significantly Undervalued"
        elif margin_of_safety > 10.0:
            verdict = "Undervalued"
        elif margin_of_safety > -10.0:
            verdict = "Fairly Valued"
        else:
            verdict = "Overvalued"

        return DCFValuationResponse(
            fcf_projections=projections,
            present_value_cash_flows=round(pv_fcf_sum, 2),
            terminal_value=round(terminal_value, 2),
            present_value_terminal_value=round(pv_terminal_value, 2),
            enterprise_value=round(enterprise_value, 2),
            net_debt=round(net_debt, 2),
            equity_value=round(equity_value, 2),
            intrinsic_value_per_share=round(intrinsic_per_share, 2),
            current_market_price=round(current_price, 2),
            margin_of_safety_pct=round(margin_of_safety, 2),
            valuation_verdict=verdict
        )

    @staticmethod
    def calculate_peter_lynch(
        eps: float,
        earnings_growth_rate_pct: float,
        current_price: float,
        pe_ratio: Optional[float] = None
    ) -> PeterLynchValuationResponse:
        """
        Peter Lynch Fair Value Formula:
        Fair Value = EPS * min(Growth Rate %, 25.0)
        PEG Ratio = P/E / Growth Rate %
        """
        capped_growth = min(max(earnings_growth_rate_pct, 1.0), 25.0)
        fair_val = max(eps * capped_growth, 0.0)

        peg = None
        if pe_ratio and earnings_growth_rate_pct > 0:
            peg = round(pe_ratio / earnings_growth_rate_pct, 2)

        diff_pct = ((fair_val - current_price) / fair_val * 100.0) if fair_val > 0 else -100.0
        if diff_pct > 25.0:
            verdict = "Substantially Undervalued (Lynch Bargain)"
        elif diff_pct > 5.0:
            verdict = "Moderately Undervalued"
        elif diff_pct > -15.0:
            verdict = "Fairly Priced"
        else:
            verdict = "Overvalued"

        return PeterLynchValuationResponse(
            eps=round(eps, 2),
            earnings_growth_rate_pct=round(earnings_growth_rate_pct, 2),
            fair_value=round(fair_val, 2),
            current_price=round(current_price, 2),
            peg_ratio=peg,
            valuation_verdict=verdict
        )

    @staticmethod
    def calculate_scores(
        ratios: Dict[str, Optional[float]],
        growth_metrics: Dict[str, Optional[float]]
    ) -> FinancialScores:
        """
        Proprietary 5-Factor Scoring Model:
        - Health Score (Balance sheet solvency & liquidity)
        - Quality Score (Capital efficiency & operating margins)
        - Growth Score (Revenue & earnings velocity)
        - Stability Score (Earnings consistency & dividend coverage)
        - Value Score (Valuation multiples vs benchmarks)
        """
        # 1. Health Score (0 to 100)
        health = 50.0
        de = ratios.get("debt_to_equity")
        if de is not None:
            if de < 0.3: health += 20
            elif de < 0.8: health += 10
            elif de > 2.0: health -= 20
            elif de > 1.5: health -= 10

        cr = ratios.get("current_ratio")
        if cr is not None:
            if cr > 1.8: health += 15
            elif cr > 1.3: health += 10
            elif cr < 1.0: health -= 15

        ic = ratios.get("interest_coverage")
        if ic is not None:
            if ic > 8.0: health += 15
            elif ic > 4.0: health += 10
            elif ic < 2.0: health -= 15

        health_score = max(min(health, 100.0), 0.0)

        # 2. Quality Score (0 to 100)
        quality = 40.0
        roe = ratios.get("roe_pct")
        if roe is not None:
            if roe > 25.0: quality += 25
            elif roe > 18.0: quality += 18
            elif roe > 10.0: quality += 10
            elif roe < 0.0: quality -= 20

        roa = ratios.get("roa_pct")
        if roa is not None:
            if roa > 12.0: quality += 20
            elif roa > 7.0: quality += 12
            elif roa < 2.0: quality -= 10

        op_margin = ratios.get("operating_margin_pct")
        if op_margin is not None:
            if op_margin > 22.0: quality += 15
            elif op_margin > 12.0: quality += 10
            elif op_margin < 5.0: quality -= 10

        quality_score = max(min(quality, 100.0), 0.0)

        # 3. Growth Score (0 to 100)
        growth = 45.0
        rev_growth = growth_metrics.get("revenue_growth_pct")
        if rev_growth is not None:
            if rev_growth > 20.0: growth += 25
            elif rev_growth > 10.0: growth += 15
            elif rev_growth < 0.0: growth -= 20

        eps_growth = growth_metrics.get("eps_growth_pct")
        if eps_growth is not None:
            if eps_growth > 20.0: growth += 25
            elif eps_growth > 10.0: growth += 15
            elif eps_growth < 0.0: growth -= 20

        growth_score = max(min(growth, 100.0), 0.0)

        # 4. Stability Score (0 to 100)
        stability = 50.0
        div_yield = ratios.get("dividend_yield_pct")
        if div_yield is not None:
            if div_yield > 6.0: stability += 25
            elif div_yield > 3.0: stability += 15
            elif div_yield == 0.0: stability -= 10

        payout = ratios.get("dividend_payout_pct")
        if payout is not None:
            if 30.0 <= payout <= 70.0: stability += 25
            elif payout > 90.0: stability -= 15

        stability_score = max(min(stability, 100.0), 0.0)

        # 5. Value Score (0 to 100)
        val = 50.0
        pe = ratios.get("pe_ratio")
        if pe is not None:
            if pe < 7.0: val += 30
            elif pe < 12.0: val += 18
            elif pe > 25.0: val -= 25
            elif pe > 18.0: val -= 10

        pb = ratios.get("pb_ratio")
        if pb is not None:
            if pb < 1.2: val += 20
            elif pb < 2.0: val += 10
            elif pb > 4.0: val -= 20

        value_score = max(min(val, 100.0), 0.0)

        # Overall Weighted Composite Score
        overall = (
            (health_score * 0.25) +
            (quality_score * 0.25) +
            (growth_score * 0.20) +
            (stability_score * 0.15) +
            (value_score * 0.15)
        )

        if overall >= 80:
            summary = "Exceptional Overall Fundamentals (Strong Buy Candidate)"
        elif overall >= 65:
            summary = "Solid Fundamental Quality & Reasonable Value"
        elif overall >= 50:
            summary = "Moderate Fundamentals (Hold / Selective Accumulation)"
        else:
            summary = "Weak Fundamentals / High Risk"

        health_verdict = "Robust Solvency" if health_score >= 70 else "Adequate Liquidity" if health_score >= 50 else "High Leverage Concern"

        return FinancialScores(
            health_score=round(health_score, 1),
            quality_score=round(quality_score, 1),
            growth_score=round(growth_score, 1),
            stability_score=round(stability_score, 1),
            value_score=round(value_score, 1),
            overall_score=round(overall, 1),
            health_verdict=health_verdict,
            summary_verdict=summary
        )

fundamentals_engine = FundamentalsEngine()
