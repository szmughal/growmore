from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from backend.app.schemas.macro import MacroSnapshot, SBPPolicyRegimes, SBPPolicyRegimeDecision
from backend.app.services.market_gateway import market_gateway

router = APIRouter(prefix="/macro", tags=["Pakistan Macroeconomic Intelligence"])

@router.get("/dashboard", response_model=MacroSnapshot)
async def get_macro_dashboard():
    """
    Retrieve comprehensive Pakistan Macroeconomic Dashboard:
    - Official State Bank of Pakistan (SBP) policy rate & recent decisions
    - Pakistan Bureau of Statistics (PBS) National CPI Inflation (Headline & Core)
    - Foreign Exchange Reserves (Central Bank SBP + Commercial Banks total)
    - Balance of Payments (Current Account Balance, Trade Deficit, Worker Remittances)
    - Real Economy (Large-Scale Manufacturing Index, GDP Growth Estimates)
    - Upcoming Central Bank MPC Meetings & Statistical Release Calendar
    """
    return await market_gateway.get_macro_snapshot()

@router.get("/sbp-cycle")
async def get_sbp_policy_regimes():
    """
    Retrieve historical SBP Monetary Policy rate cycles and equity market performance overlays.
    Analyzes historical KSE-100 returns during Easing vs Tightening regimes.
    """
    macro_data = await market_gateway.get_macro_snapshot()
    decisions = macro_data.policy_rate.decisions

    # SBP Policy Regimes with Historical KSE-100 Return Correlation
    regimes = [
        {
            "cycle_name": "Post-COVID Monetary Easing",
            "period": "March 2020 – September 2021",
            "start_rate": 13.25,
            "trough_rate": 7.00,
            "action": "Easing (Cut by 625 bps)",
            "kse100_start": 38000,
            "kse100_end": 47500,
            "kse100_return_pct": 25.0,
            "summary": "Aggressive central bank liquidity injections supported an equity bull market."
        },
        {
            "cycle_name": "Inflation & External Shock Tightening",
            "period": "September 2021 – June 2023",
            "start_rate": 7.00,
            "peak_rate": 22.00,
            "action": "Tightening (Hiked by 1500 bps)",
            "kse100_start": 47500,
            "kse100_end": 41500,
            "kse100_return_pct": -12.6,
            "summary": "Historic rate hikes to combat 38% CPI inflation suppressed market valuations."
        },
        {
            "cycle_name": "Peak Plateau & Disinflation Easing",
            "period": "June 2024 – Present",
            "start_rate": 22.00,
            "current_rate": macro_data.policy_rate.current_rate,
            "action": f"Easing (Cut by {int((22.0 - macro_data.policy_rate.current_rate) * 100)} bps)",
            "kse100_start": 75000,
            "kse100_end": 93500,
            "kse100_return_pct": 24.7,
            "summary": "Sharply declining CPI inflation enabled cumulative interest rate cuts, driving record KSE-100 highs."
        }
    ]

    return {
        "market": "PK",
        "current_policy_rate": macro_data.policy_rate.current_rate,
        "total_historical_decisions_recorded": len(decisions),
        "recent_decisions": decisions[-10:] if decisions else [],
        "monetary_cycles": regimes,
        "as_of": datetime.now(timezone.utc).isoformat()
    }
