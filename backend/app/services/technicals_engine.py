from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
import math
from backend.app.schemas.technicals import (
    MovingAverages,
    RSIIndicator,
    MACDIndicator,
    BollingerBands,
    PivotLevels,
    TechnicalScenario,
    TechnicalVerdict,
    TechnicalAnalysisResponse
)

class TechnicalsEngine:
    """
    Algorithmic Technical Indicator Engine & Automated Verdict Generator.
    Computes SMAs, EMAs, RSI, MACD, Bollinger Bands, ATR, Standard/Fibonacci/Camarilla pivots,
    and outputs multi-factor conviction verdicts and trade setups.
    """

    @staticmethod
    def calculate_sma(prices: List[float], period: int) -> Optional[float]:
        if len(prices) < period:
            return None
        return round(sum(prices[-period:]) / period, 2)

    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> Optional[float]:
        if len(prices) < period:
            return None
        multiplier = 2.0 / (period + 1.0)
        # Seed with initial SMA
        ema = sum(prices[:period]) / period
        for p in prices[period:]:
            ema = (p * multiplier) + (ema * (1.0 - multiplier))
        return round(ema, 2)

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> RSIIndicator:
        if len(prices) < period + 1:
            return RSIIndicator(value=50.0, period=period, state="Neutral", signal="Neutral")

        gains = []
        losses = []
        for i in range(1, len(prices)):
            diff = prices[i] - prices[i - 1]
            if diff >= 0:
                gains.append(diff)
                losses.append(0.0)
            else:
                gains.append(0.0)
                losses.append(abs(diff))

        # Initial averages
        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period

        # Smoothed Wilder averages
        for i in range(period, len(gains)):
            avg_gain = ((avg_gain * (period - 1)) + gains[i]) / period
            avg_loss = ((avg_loss * (period - 1)) + losses[i]) / period

        if avg_loss == 0:
            rsi_val = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi_val = 100.0 - (100.0 / (1.0 + rs))

        rsi_val = round(max(min(rsi_val, 100.0), 0.0), 2)

        if rsi_val >= 70.0:
            state = "Overbought"
            sig = "Bearish Reversal Risk"
        elif rsi_val <= 30.0:
            state = "Oversold"
            sig = "Bullish Rebound Candidate"
        elif rsi_val > 55.0:
            state = "Bullish Momentum"
            sig = "Bullish"
        elif rsi_val < 45.0:
            state = "Bearish Momentum"
            sig = "Bearish"
        else:
            state = "Neutral"
            sig = "Neutral"

        return RSIIndicator(value=rsi_val, period=period, state=state, signal=sig)

    @staticmethod
    def calculate_macd(
        prices: List[float],
        fast: int = 12,
        slow: int = 26,
        signal: int = 9
    ) -> MACDIndicator:
        if len(prices) < slow + signal:
            return MACDIndicator(macd_line=0.0, signal_line=0.0, histogram=0.0, crossover="Neutral")

        # Compute fast and slow EMA series
        k_fast = 2.0 / (fast + 1)
        k_slow = 2.0 / (slow + 1)

        ema_fast = sum(prices[:fast]) / fast
        fast_series = [ema_fast]
        for p in prices[fast:]:
            ema_fast = (p * k_fast) + (ema_fast * (1.0 - k_fast))
            fast_series.append(ema_fast)

        ema_slow = sum(prices[:slow]) / slow
        macd_series = []
        for i, p in enumerate(prices[slow:]):
            ema_slow = (p * k_slow) + (ema_slow * (1.0 - k_slow))
            idx_fast = (slow - fast) + i
            if idx_fast < len(fast_series):
                macd_val = fast_series[idx_fast] - ema_slow
                macd_series.append(macd_val)

        if len(macd_series) < signal:
            return MACDIndicator(macd_line=0.0, signal_line=0.0, histogram=0.0, crossover="Neutral")

        k_sig = 2.0 / (signal + 1)
        ema_sig = sum(macd_series[:signal]) / signal
        for m in macd_series[signal:]:
            ema_sig = (m * k_sig) + (ema_sig * (1.0 - k_sig))

        latest_macd = macd_series[-1]
        latest_sig = ema_sig
        hist = latest_macd - latest_sig

        if latest_macd > latest_sig and hist > 0:
            crossover = "Bullish (Above Signal)"
        elif latest_macd < latest_sig and hist < 0:
            crossover = "Bearish (Below Signal)"
        else:
            crossover = "Neutral"

        return MACDIndicator(
            macd_line=round(latest_macd, 2),
            signal_line=round(latest_sig, 2),
            histogram=round(hist, 2),
            crossover=crossover
        )

    @staticmethod
    def calculate_bollinger_bands(
        prices: List[float],
        period: int = 20,
        num_std: float = 2.0
    ) -> BollingerBands:
        if len(prices) < period:
            current = prices[-1] if prices else 100.0
            return BollingerBands(upper=current*1.05, middle=current, lower=current*0.95, bandwidth=10.0, percent_b=0.5)

        slice_p = prices[-period:]
        mid = sum(slice_p) / period
        variance = sum((p - mid) ** 2 for p in slice_p) / period
        std = math.sqrt(variance)

        upper = mid + (num_std * std)
        lower = mid - (num_std * std)
        current = prices[-1]

        bandwidth = ((upper - lower) / mid * 100.0) if mid > 0 else 0.0
        percent_b = ((current - lower) / (upper - lower)) if (upper - lower) > 0 else 0.5

        if current >= upper:
            pos = "At / Above Upper Band"
        elif current <= lower:
            pos = "At / Below Lower Band"
        else:
            pos = "Within Bands"

        return BollingerBands(
            upper=round(upper, 2),
            middle=round(mid, 2),
            lower=round(lower, 2),
            bandwidth=round(bandwidth, 2),
            percent_b=round(percent_b, 4),
            position=pos
        )

    @staticmethod
    def calculate_atr(
        highs: List[float],
        lows: List[float],
        closes: List[float],
        period: int = 14
    ) -> float:
        if len(closes) < period + 1:
            return round((highs[-1] - lows[-1]), 2) if highs and lows else 2.0

        tr_list = []
        for i in range(1, len(closes)):
            tr = max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i - 1]),
                abs(lows[i] - closes[i - 1])
            )
            tr_list.append(tr)

        atr = sum(tr_list[:period]) / period
        for i in range(period, len(tr_list)):
            atr = ((atr * (period - 1)) + tr_list[i]) / period

        return round(atr, 2)

    @staticmethod
    def calculate_pivots(
        high: float,
        low: float,
        close: float
    ) -> Dict[str, PivotLevels]:
        rng = high - low

        # 1. Standard (Floor) Pivots
        p_std = (high + low + close) / 3.0
        r1_std = (2.0 * p_std) - low
        s1_std = (2.0 * p_std) - high
        r2_std = p_std + rng
        s2_std = p_std - rng
        r3_std = high + (2.0 * (p_std - low))
        s3_std = low - (2.0 * (high - p_std))

        # 2. Fibonacci Pivots
        p_fib = p_std
        r1_fib = p_fib + (0.382 * rng)
        s1_fib = p_fib - (0.382 * rng)
        r2_fib = p_fib + (0.618 * rng)
        s2_fib = p_fib - (0.618 * rng)
        r3_fib = p_fib + (1.000 * rng)
        s3_fib = p_fib - (1.000 * rng)

        # 3. Camarilla Pivots
        r1_cam = close + (1.1 * rng / 12.0)
        s1_cam = close - (1.1 * rng / 12.0)
        r2_cam = close + (1.1 * rng / 6.0)
        s2_cam = close - (1.1 * rng / 6.0)
        r3_cam = close + (1.1 * rng / 4.0)
        s3_cam = close - (1.1 * rng / 4.0)

        return {
            "standard": PivotLevels(
                pivot=round(p_std, 2),
                r1=round(r1_std, 2), r2=round(r2_std, 2), r3=round(r3_std, 2),
                s1=round(s1_std, 2), s2=round(s2_std, 2), s3=round(s3_std, 2)
            ),
            "fibonacci": PivotLevels(
                pivot=round(p_fib, 2),
                r1=round(r1_fib, 2), r2=round(r2_fib, 2), r3=round(r3_fib, 2),
                s1=round(s1_fib, 2), s2=round(s2_fib, 2), s3=round(s3_fib, 2)
            ),
            "camarilla": PivotLevels(
                pivot=round(close, 2),
                r1=round(r1_cam, 2), r2=round(r2_cam, 2), r3=round(r3_cam, 2),
                s1=round(s1_cam, 2), s2=round(s2_cam, 2), s3=round(s3_cam, 2)
            )
        }

    @staticmethod
    def generate_verdict(
        current_price: float,
        mas: MovingAverages,
        rsi: RSIIndicator,
        macd: MACDIndicator,
        bb: BollingerBands,
        atr: float,
        pivots: Dict[str, PivotLevels]
    ) -> TechnicalVerdict:
        """
        Synthesizes technical signals into a single multi-factor Verdict
        with Conviction Score (0-100) and actionable scenarios.
        """
        bullish = 0
        bearish = 0
        neutral = 0

        # Moving Average Signals (Weight 35)
        if mas.ema20 and current_price > mas.ema20:
            bullish += 1
        else:
            bearish += 1

        if mas.ema50 and current_price > mas.ema50:
            bullish += 1
        else:
            bearish += 1

        if mas.ema200 and current_price > mas.ema200:
            bullish += 1
        else:
            bearish += 1

        if mas.golden_cross:
            bullish += 2
        elif mas.death_cross:
            bearish += 2

        # RSI Signals (Weight 25)
        if 50.0 < rsi.value < 70.0:
            bullish += 1
        elif 30.0 < rsi.value <= 50.0:
            bearish += 1
        elif rsi.value <= 30.0:
            bullish += 1  # oversold bounce potential
        elif rsi.value >= 70.0:
            bearish += 1  # overbought exhaustion

        # MACD Signals (Weight 20)
        if macd.histogram > 0:
            bullish += 1
        else:
            bearish += 1

        if macd.macd_line > macd.signal_line:
            bullish += 1
        else:
            bearish += 1

        # Bollinger Signals (Weight 20)
        if bb.percent_b > 0.5:
            bullish += 1
        else:
            bearish += 1

        total_signals = bullish + bearish + neutral
        bull_ratio = bullish / total_signals if total_signals > 0 else 0.5
        conviction = round(abs(bull_ratio - 0.5) * 200.0, 1)

        if bull_ratio >= 0.75:
            verdict = "Strong Buy"
            summary = "Robust bullish trend across daily moving averages, positive MACD momentum, and expanding upper channel."
        elif bull_ratio >= 0.60:
            verdict = "Buy"
            summary = "Constructive upside momentum above key short-term moving averages with moderate RSI confirmation."
        elif bull_ratio <= 0.25:
            verdict = "Strong Sell"
            summary = "Severe downtrend breakdown below long-term moving averages and negative momentum confirmation."
        elif bull_ratio <= 0.40:
            verdict = "Sell"
            summary = "Weakening price action trading below short-term moving averages with negative MACD slope."
        else:
            verdict = "Neutral"
            summary = "Range-bound consolidation without decisive directional breakout."

        std_pivot = pivots["standard"]

        # Actionable Trade Scenarios
        bull_scenario = TechnicalScenario(
            trigger_level=round(std_pivot.pivot, 2),
            target_1=round(std_pivot.r1, 2),
            target_2=round(std_pivot.r2, 2),
            stop_loss=round(std_pivot.s1, 2),
            risk_reward_ratio=round((std_pivot.r1 - current_price) / max(current_price - std_pivot.s1, 0.01), 2),
            description=f"Long breakout entry above {std_pivot.pivot:.2f} targeting R1 ({std_pivot.r1:.2f}) with stop loss at S1 ({std_pivot.s1:.2f})."
        )

        bear_scenario = TechnicalScenario(
            trigger_level=round(std_pivot.s1, 2),
            target_1=round(std_pivot.s2, 2),
            target_2=round(std_pivot.s3, 2),
            stop_loss=round(std_pivot.pivot, 2),
            risk_reward_ratio=round((current_price - std_pivot.s2) / max(std_pivot.pivot - current_price, 0.01), 2),
            description=f"Short invalidation breakdown below {std_pivot.s1:.2f} targeting S2 ({std_pivot.s2:.2f}) with stop loss at Pivot ({std_pivot.pivot:.2f})."
        )

        return TechnicalVerdict(
            verdict=verdict,
            conviction_score=min(max(conviction, 10.0), 95.0),
            bullish_signals_count=bullish,
            bearish_signals_count=bearish,
            neutral_signals_count=neutral,
            summary=summary,
            bullish_scenario=bull_scenario,
            bearish_scenario=bear_scenario
        )

technicals_engine = TechnicalsEngine()
