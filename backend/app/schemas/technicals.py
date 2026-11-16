from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class MovingAverages(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    sma20: Optional[float] = None
    sma50: Optional[float] = None
    sma200: Optional[float] = None
    ema20: Optional[float] = None
    ema50: Optional[float] = None
    ema200: Optional[float] = None
    golden_cross: bool = False
    death_cross: bool = False
    trend_direction: str = "Neutral"  # "Bullish", "Bearish", "Neutral"

class RSIIndicator(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    value: float
    period: int = 14
    state: str = "Neutral"  # "Oversold", "Neutral", "Overbought"
    signal: str = "Neutral"

class MACDIndicator(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    macd_line: float
    signal_line: float
    histogram: float
    crossover: str = "Neutral"  # "Bullish Crossover", "Bearish Crossover", "Neutral"

class BollingerBands(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    upper: float
    middle: float
    lower: float
    bandwidth: float
    percent_b: float
    position: str = "Within Bands"

class PivotLevels(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pivot: float
    r1: float
    r2: float
    r3: float
    s1: float
    s2: float
    s3: float

class TechnicalScenario(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    trigger_level: float
    target_1: float
    target_2: float
    stop_loss: float
    risk_reward_ratio: float
    description: str

class TechnicalVerdict(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    verdict: str  # "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"
    conviction_score: float = Field(..., ge=0, le=100)
    bullish_signals_count: int
    bearish_signals_count: int
    neutral_signals_count: int
    summary: str
    bullish_scenario: TechnicalScenario
    bearish_scenario: TechnicalScenario

class TechnicalAnalysisResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    market: str
    current_price: float
    change_percent: float
    as_of_time: str
    moving_averages: MovingAverages
    rsi: RSIIndicator
    macd: MACDIndicator
    bollinger: BollingerBands
    atr: float
    pivots: Dict[str, PivotLevels]
    verdict: TechnicalVerdict
