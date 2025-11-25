"""Price data integration service."""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)


@dataclass
class PriceData:
    """Price data."""
    stock_symbol: str
    date: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int


class PriceDataService:
    """Manage price data for stocks."""
    
    def __init__(self):
        """Initialize price data service."""
        self.price_cache: Dict[str, List[PriceData]] = {}
    
    def fetch_historical_prices(
        self,
        stock_symbol: str,
        start_date: datetime,
        end_date: datetime,
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical prices for a stock.
        
        Args:
            stock_symbol: Stock symbol
            start_date: Start date
            end_date: End date
            
        Returns:
            List of price data
        """
        # Generate mock price data
        prices = []
        current_date = start_date
        base_price = random.uniform(100, 1000)
        
        while current_date <= end_date:
            # Skip weekends
            if current_date.weekday() < 5:
                # Generate OHLCV data
                daily_change = random.uniform(-0.05, 0.05)
                open_price = base_price
                close_price = base_price * (1 + daily_change)
                high_price = max(open_price, close_price) * random.uniform(1.0, 1.02)
                low_price = min(open_price, close_price) * random.uniform(0.98, 1.0)
                volume = random.randint(1000000, 10000000)
                
                prices.append({
                    "stock_symbol": stock_symbol,
                    "date": current_date.isoformat(),
                    "open": round(open_price, 2),
                    "high": round(high_price, 2),
                    "low": round(low_price, 2),
                    "close": round(close_price, 2),
                    "volume": volume,
                })
                
                base_price = close_price
            
            current_date += timedelta(days=1)
        
        logger.info(f"Fetched {len(prices)} price records for {stock_symbol}")
        
        return prices
    
    def calculate_returns(
        self,
        prices: List[Dict[str, Any]],
        periods: Optional[List[int]] = None,
    ) -> Dict[str, float]:
        """
        Calculate returns over multiple horizons.
        
        Args:
            prices: List of price data
            periods: List of periods (days) to calculate returns for
            
        Returns:
            Returns for each period
        """
        if not periods:
            periods = [1, 5, 10, 20, 60]
        
        if len(prices) < 2:
            return {}
        
        returns = {}
        first_price = prices[0]["close"]
        
        for period in periods:
            if len(prices) > period:
                period_price = prices[period]["close"]
                period_return = ((period_price - first_price) / first_price) * 100
                returns[f"return_{period}d"] = round(period_return, 2)
            else:
                returns[f"return_{period}d"] = 0.0
        
        logger.info(f"Calculated returns for {len(periods)} periods")
        
        return returns
    
    def calculate_volatility(
        self,
        prices: List[Dict[str, Any]],
        window: int = 20,
    ) -> float:
        """
        Calculate volatility.
        
        Args:
            prices: List of price data
            window: Window size for volatility calculation
            
        Returns:
            Volatility (annualized)
        """
        if len(prices) < window:
            return 0.0
        
        # Calculate daily returns
        daily_returns = []
        for i in range(1, len(prices)):
            prev_close = prices[i-1]["close"]
            curr_close = prices[i]["close"]
            daily_return = (curr_close - prev_close) / prev_close
            daily_returns.append(daily_return)
        
        # Calculate standard deviation
        if not daily_returns:
            return 0.0
        
        mean_return = sum(daily_returns) / len(daily_returns)
        variance = sum((r - mean_return) ** 2 for r in daily_returns) / len(daily_returns)
        std_dev = variance ** 0.5
        
        # Annualize (252 trading days)
        annualized_volatility = std_dev * (252 ** 0.5)
        
        logger.info(f"Calculated volatility: {annualized_volatility:.3f}")
        
        return round(annualized_volatility, 3)
    
    def calculate_moving_average(
        self,
        prices: List[Dict[str, Any]],
        window: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Calculate moving average.
        
        Args:
            prices: List of price data
            window: Window size
            
        Returns:
            Prices with moving average
        """
        result = []
        
        for i, price in enumerate(prices):
            if i < window - 1:
                ma = None
            else:
                window_prices = [p["close"] for p in prices[i-window+1:i+1]]
                ma = sum(window_prices) / len(window_prices)
            
            result.append({
                **price,
                f"ma_{window}": round(ma, 2) if ma else None,
            })
        
        logger.info(f"Calculated {window}-day moving average")
        
        return result
    
    def get_price_summary(
        self,
        prices: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Get price summary statistics.
        
        Args:
            prices: List of price data
            
        Returns:
            Summary statistics
        """
        if not prices:
            return {}
        
        closes = [p["close"] for p in prices]
        
        return {
            "total_records": len(prices),
            "start_date": prices[0]["date"],
            "end_date": prices[-1]["date"],
            "current_price": closes[-1],
            "min_price": min(closes),
            "max_price": max(closes),
            "avg_price": round(sum(closes) / len(closes), 2),
            "price_change": round(closes[-1] - closes[0], 2),
            "price_change_pct": round(((closes[-1] - closes[0]) / closes[0]) * 100, 2),
        }

