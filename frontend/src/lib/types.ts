export type Category =
  | "New"
  | "All"
  | "Politics"
  | "Sports"
  | "Culture"
  | "Crypto"
  | "Climate"
  | "Economics"
  | "Mentions"
  | "Companies"
  | "Financials"
  | "Tech & Science"
  | "Health"
  | "World";

export interface Market {
  id: string;
  ticker: string;
  title: string;
  category: Category;
  expiry: string;
  status: "active" | "closed" | "settled";
  description: string;
  rules: string;
}

export interface Quote {
  marketId: string;
  ticker: string;
  last: number;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  openInterest: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface DepthLevel {
  price: number;
  size: number;
  cumulative: number;
  side: "bid" | "ask";
}

export interface OrderBook {
  marketId: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
  timestamp: number;
}

export interface Trade {
  id: string;
  marketId: string;
  timestamp: number;
  side: "buy" | "sell";
  price: number;
  quantity: number;
}

export interface OHLCBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: number;
  relevantMarkets: string[];
}

export interface AlertRule {
  id: string;
  condition: string;
  marketId: string;
  enabled: boolean;
  lastTriggered?: number;
}

export type TimeFrame = "1m" | "5m" | "1h" | "1d";
export type Indicator = "ema" | "rsi" | "bbands" | "macd";

export interface ChartConfig {
  timeframe: TimeFrame;
  indicators: Indicator[];
}
