"""Stock universe management service."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class StockUniverse:
    """Stock universe data."""
    name: str
    description: str
    stocks: List[str]
    universe_type: str  # predefined or custom
    created_at: datetime


class StockUniverseManager:
    """Manage stock universes for research."""
    
    # Predefined universes
    PREDEFINED_UNIVERSES = {
        "NSE_TOP_100": {
            "name": "NSE Top 100",
            "description": "Top 100 companies by market cap on NSE",
            "stocks": [
                "RELIANCE", "TCS", "INFY", "HINDUNILVR", "ICICIBANK",
                "SBIN", "BHARTIARTL", "MARUTI", "HDFCBANK", "WIPRO",
                "BAJAJFINSV", "ASIANPAINT", "DMARUTI", "SUNPHARMA", "KOTAKBANK",
                "ULTRACEMCO", "AXISBANK", "TITAN", "NESTLEIND", "POWERGRID",
                "BAJAJ-AUTO", "HCLTECH", "TECHM", "INDIGO", "JSWSTEEL",
                "TATASTEEL", "HEROMOTOCO", "ADANIPORTS", "ADANIGREEN", "ADANIPOWER",
                "ADANIENT", "APOLLOHOSP", "BIOCON", "BRITANNIA", "CIPLA",
                "COALINDIA", "COLPAL", "DIVISLAB", "DRREDDY", "EICHERMOT",
                "GAIL", "GRASIM", "HAVELLS", "HDFC", "HDFCLIFE",
                "HINDALCO", "HINDPETRO", "HONEYWELL", "IBREALEST", "ICICIPRULI",
                "IDEA", "IDFCFIRSTB", "INDIAMART", "INDIGO", "INDUSTOWER",
                "IOC", "IPCALAB", "JSWENERGY", "JSWINFRA", "JUBLFOOD",
                "KALYANKJIL", "KPITTECH", "LAXMIMACH", "LICHSGFIN", "LT",
                "LTIM", "LTTS", "LUPIN", "MAHABANK", "MANAPPURAM",
                "MARICO", "MAXHEALTH", "MCDOWELL-N", "METROPOLIS", "MINDTREE",
                "MOBILEYE", "MOTHERSON", "MPHASIS", "MRF", "MUTHOOTFIN",
                "NATIONALUM", "NAVINFLUOR", "NMDC", "NTPC", "ONGC",
                "PAGEIND", "PAYTM", "PERSISTENT", "PETRONET", "PFIZER",
                "PIDILITIND", "PIIND", "PNB", "PNBHOUSING", "POLICYBZR",
            ],
        },
        "NSE_BOTTOM_100": {
            "name": "NSE Bottom 100",
            "description": "Bottom 100 companies by market cap on NSE",
            "stocks": [
                "AARTIIND", "AAVAS", "ABCAPITAL", "ABSLBASIN", "ACCELYA",
                "ACME", "ADANIENSOL", "ADANIGAS", "ADANIGREEN", "ADANIPOWER",
                "ADANIENT", "ADANIPORTS", "ADFFOODS", "ADVANIHOTEL", "AEGISCHEM",
                "AETHER", "AFSL", "AGRITECH", "AHLADA", "AIAENG",
                "AIFL", "AIRTEL", "AIRTRANSP", "AJANTAPH", "AKZOINDIA",
                "ALEMBICLTD", "ALICON", "ALLCARGO", "ALLSEC", "ALMONDZ",
                "ALOKTEXT", "ALSTOM", "ALTISEC", "ALTNERGY", "ALUPRO",
                "AMAQUEST", "AMARAJABAT", "AMBUJACEM", "AMJLAND", "AMKLY",
                "AMRELIND", "AMRUTIND", "AMTD", "AMTX", "ANANTRAJ",
                "ANANTNAG", "ANDHRSUGAR", "ANDPHIBANK", "ANDHRABANK", "ANDHRPRADESH",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
            ],
        },
        "NSE_AVERAGE_100": {
            "name": "NSE Average 100",
            "description": "Average 100 companies by market cap on NSE",
            "stocks": [
                "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
                "META", "TSLA", "BRK.B", "JNJ", "V",
                "WMT", "JPM", "PG", "MA", "HD",
                "DIS", "PYPL", "ADBE", "CRM", "NFLX",
                "CSCO", "INTC", "AMD", "QCOM", "IBM",
                "ORCL", "SAP", "SALESFORCE", "WORKDAY", "ZOOM",
                "SLACK", "TWILIO", "DATADOG", "OKTA", "CROWDSTRIKE",
                "PALO", "FORTINET", "CLOUDFLARE", "FASTLY", "ZSCALER",
                "QUALCOMM", "BROADCOM", "MARVELL", "NVIDIA", "AMD",
                "INTEL", "XILINX", "ANALOG", "MAXIM", "MICROCHIP",
                "STMICRO", "NXP", "SKYWORKS", "QORVO", "CIRRUS",
                "SEMTECH", "POWER", "TRANSPHORM", "GAN", "AKOUSTIS",
                "AMKLY", "AMTX", "ANANTRAJ", "ANANTNAG", "ANDHRSUGAR",
                "ANDHRABANK", "ANDPHIBANK", "ANDHRAPRADESH", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
                "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR", "ANDHRASUGAR",
            ],
        },
    }
    
    def __init__(self):
        """Initialize stock universe manager."""
        self.custom_universes: Dict[str, StockUniverse] = {}
    
    def get_predefined_universe(self, universe_key: str) -> Optional[Dict[str, Any]]:
        """
        Get a predefined universe.
        
        Args:
            universe_key: Universe key (NSE_TOP_100, NSE_BOTTOM_100, NSE_AVERAGE_100)
            
        Returns:
            Universe data or None
        """
        if universe_key not in self.PREDEFINED_UNIVERSES:
            return None
        
        universe = self.PREDEFINED_UNIVERSES[universe_key]
        return {
            "key": universe_key,
            "name": universe["name"],
            "description": universe["description"],
            "stock_count": len(universe["stocks"]),
            "universe_type": "predefined",
        }
    
    def list_predefined_universes(self) -> List[Dict[str, Any]]:
        """
        List all predefined universes.
        
        Returns:
            List of predefined universes
        """
        universes = []
        for key, universe in self.PREDEFINED_UNIVERSES.items():
            universes.append({
                "key": key,
                "name": universe["name"],
                "description": universe["description"],
                "stock_count": len(universe["stocks"]),
                "universe_type": "predefined",
            })
        return universes
    
    def create_custom_universe(
        self,
        universe_id: str,
        name: str,
        description: str,
        stocks: List[str],
    ) -> Dict[str, Any]:
        """
        Create a custom universe.
        
        Args:
            universe_id: Universe ID
            name: Universe name
            description: Universe description
            stocks: List of stock symbols
            
        Returns:
            Created universe
        """
        universe = StockUniverse(
            name=name,
            description=description,
            stocks=stocks,
            universe_type="custom",
            created_at=datetime.now(),
        )
        
        self.custom_universes[universe_id] = universe
        
        logger.info(f"Created custom universe: {universe_id} with {len(stocks)} stocks")
        
        return {
            "universe_id": universe_id,
            "name": name,
            "description": description,
            "stock_count": len(stocks),
            "universe_type": "custom",
            "created_at": universe.created_at.isoformat(),
        }
    
    def get_universe_stocks(self, universe_key: str) -> Optional[List[str]]:
        """
        Get stocks in a universe.
        
        Args:
            universe_key: Universe key or ID
            
        Returns:
            List of stock symbols or None
        """
        # Check predefined universes
        if universe_key in self.PREDEFINED_UNIVERSES:
            return self.PREDEFINED_UNIVERSES[universe_key]["stocks"]
        
        # Check custom universes
        if universe_key in self.custom_universes:
            return self.custom_universes[universe_key].stocks
        
        return None
    
    def add_stocks_to_universe(
        self,
        universe_id: str,
        stocks: List[str],
    ) -> Dict[str, Any]:
        """
        Add stocks to a custom universe.
        
        Args:
            universe_id: Universe ID
            stocks: List of stock symbols to add
            
        Returns:
            Updated universe
        """
        if universe_id not in self.custom_universes:
            raise ValueError(f"Universe {universe_id} not found")
        
        universe = self.custom_universes[universe_id]
        universe.stocks.extend(stocks)
        
        logger.info(f"Added {len(stocks)} stocks to universe {universe_id}")
        
        return {
            "universe_id": universe_id,
            "name": universe.name,
            "stock_count": len(universe.stocks),
        }
    
    def remove_stocks_from_universe(
        self,
        universe_id: str,
        stocks: List[str],
    ) -> Dict[str, Any]:
        """
        Remove stocks from a custom universe.
        
        Args:
            universe_id: Universe ID
            stocks: List of stock symbols to remove
            
        Returns:
            Updated universe
        """
        if universe_id not in self.custom_universes:
            raise ValueError(f"Universe {universe_id} not found")
        
        universe = self.custom_universes[universe_id]
        universe.stocks = [s for s in universe.stocks if s not in stocks]
        
        logger.info(f"Removed {len(stocks)} stocks from universe {universe_id}")
        
        return {
            "universe_id": universe_id,
            "name": universe.name,
            "stock_count": len(universe.stocks),
        }

