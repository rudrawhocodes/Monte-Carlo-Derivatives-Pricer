"""
Market Data Module — Yahoo Finance Integration
Fetches live/delayed market data for Indian indices.
"""

from math import sqrt
from typing import Optional

import numpy as np
import yfinance as yf
from pydantic import BaseModel


SUPPORTED_INDICES = {
    "NIFTY 50": "^NSEI",
    "BANK NIFTY": "^NSEBANK",
    "SENSEX": "^BSESN",
    "NIFTY 100": "^CNX100",
    "NIFTY MIDCAP 50": "^NSEMDCP50",
}


class MarketDataResponse(BaseModel):
    index_name: str
    ticker: str
    current_price: float
    historical_volatility: float
    last_updated: str
    period_used: str
    data_points: int
    price_history: list[float]
    date_labels: list[str]


def fetch_market_data(
    index_name: str,
    period: str = "1y",
    volatility_window: Optional[int] = None,
) -> MarketDataResponse:
    """Fetch current price and estimated volatility from Yahoo Finance."""
    if index_name not in SUPPORTED_INDICES:
        raise ValueError(
            f"Unsupported index: {index_name}. "
            f"Choose from: {list(SUPPORTED_INDICES.keys())}"
        )

    ticker_symbol = SUPPORTED_INDICES[index_name]
    ticker = yf.Ticker(ticker_symbol)
    data = ticker.history(period=period)

    if data.empty:
        raise RuntimeError(
            f"No data returned for {ticker_symbol}. Market may be closed."
        )

    close = data["Close"]
    s0 = float(close.iloc[-1])

    returns = close.pct_change().dropna()
    if volatility_window and volatility_window < len(returns):
        returns = returns.iloc[-volatility_window:]
    sigma = float(returns.std() * sqrt(252))

    last_date = data.index[-1]
    last_updated = last_date.strftime("%Y-%m-%d %H:%M:%S")

    # Downsample price history to at most 252 points for the frontend chart
    prices = close.values.tolist()
    dates = [d.strftime("%Y-%m-%d") for d in data.index]
    if len(prices) > 252:
        step = len(prices) // 252
        prices = prices[::step]
        dates = dates[::step]

    return MarketDataResponse(
        index_name=index_name,
        ticker=ticker_symbol,
        current_price=round(s0, 2),
        historical_volatility=round(sigma, 6),
        last_updated=last_updated,
        period_used=period,
        data_points=len(returns),
        price_history=prices,
        date_labels=dates,
    )
