import type { Market, Quote, OrderBook, DepthLevel, Trade, OHLCBar, Category } from "../types";

// Seeded random for deterministic behavior
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const CATEGORIES: Category[] = [
  "Politics",
  "Sports",
  "Culture",
  "Crypto",
  "Climate",
  "Economics",
  "Companies",
  "Financials",
  "Tech & Science",
];

const MARKET_TEMPLATES = [
  { ticker: "CPI", title: "CPI > 3.5% in December", category: "Economics" as Category },
  { ticker: "UNEMPL", title: "Unemployment rate < 4% in Q4", category: "Economics" as Category },
  { ticker: "FED", title: "Fed cuts rates by 25bp in December", category: "Economics" as Category },
  { ticker: "BTC100K", title: "Bitcoin reaches $100k by EOY", category: "Crypto" as Category },
  { ticker: "ETH5K", title: "Ethereum above $5k by EOY", category: "Crypto" as Category },
  { ticker: "PREZ24", title: "Presidential Election Winner 2024", category: "Politics" as Category },
  { ticker: "SENATE", title: "Senate Majority in 2025", category: "Politics" as Category },
  { ticker: "AAPL3T", title: "Apple reaches $3T market cap", category: "Companies" as Category },
  { ticker: "TSLA500", title: "Tesla stock above $500 by Q1", category: "Companies" as Category },
  { ticker: "OPENAI", title: "OpenAI IPO in 2025", category: "Tech & Science" as Category },
  { ticker: "SBOWL", title: "Super Bowl Winner 2025", category: "Sports" as Category },
  { ticker: "TEMP2C", title: "2024 Global Temp > 1.5°C above baseline", category: "Climate" as Category },
];

export class MockAdapter {
  private markets: Market[];
  private quotes: Map<string, Quote>;
  private orderBooks: Map<string, OrderBook>;
  private trades: Map<string, Trade[]>;

  constructor() {
    this.markets = this.generateMarkets();
    this.quotes = new Map();
    this.orderBooks = new Map();
    this.trades = new Map();

    this.markets.forEach((market) => {
      this.quotes.set(market.id, this.generateQuote(market));
      this.orderBooks.set(market.id, this.generateOrderBook(market));
      this.trades.set(market.id, []);
    });
  }

  private generateMarkets(): Market[] {
    return MARKET_TEMPLATES.map((template, idx) => ({
      id: `MKT${idx + 1}`,
      ticker: template.ticker,
      title: template.title,
      category: template.category,
      expiry: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active" as const,
      description: `Market for: ${template.title}`,
      rules: `This market resolves to YES if the condition is met by the expiry date, otherwise NO.`,
    }));
  }

  private generateQuote(market: Market): Quote {
    const rng = new SeededRandom(market.id.charCodeAt(0) + market.id.charCodeAt(1));
    const last = 0.3 + rng.next() * 0.4; // 0.3 to 0.7
    const spread = 0.01 + rng.next() * 0.03;
    const bid = last - spread / 2;
    const ask = last + spread / 2;
    const volume = Math.floor(10000 + rng.next() * 50000);
    const openInterest = Math.floor(50000 + rng.next() * 200000);
    const change24h = (rng.next() - 0.5) * 0.1;

    return {
      marketId: market.id,
      ticker: market.ticker,
      last,
      bid,
      ask,
      spread,
      volume,
      openInterest,
      change24h,
      changePercent24h: (change24h / last) * 100,
      high24h: last + Math.abs(change24h) * 0.5,
      low24h: last - Math.abs(change24h) * 0.5,
      timestamp: Date.now(),
    };
  }

  private generateOrderBook(market: Market, levels = 10): OrderBook {
    const quote = this.quotes.get(market.id)!;
    const rng = new SeededRandom(market.id.charCodeAt(2) + Date.now());

    const bids: DepthLevel[] = [];
    const asks: DepthLevel[] = [];

    let cumulativeBid = 0;
    for (let i = 0; i < levels; i++) {
      const price = quote.bid - i * 0.01;
      const size = Math.floor(500 + rng.next() * 2000);
      cumulativeBid += size;
      bids.push({ price, size, cumulative: cumulativeBid, side: "bid" });
    }

    let cumulativeAsk = 0;
    for (let i = 0; i < levels; i++) {
      const price = quote.ask + i * 0.01;
      const size = Math.floor(500 + rng.next() * 2000);
      cumulativeAsk += size;
      asks.push({ price, size, cumulative: cumulativeAsk, side: "ask" });
    }

    return {
      marketId: market.id,
      bids,
      asks,
      timestamp: Date.now(),
    };
  }

  // Public API
  getMarkets(category?: Category): Market[] {
    if (category && category !== "All") {
      return this.markets.filter((m) => m.category === category);
    }
    return this.markets;
  }

  getMarket(tickerOrId: string): Market | undefined {
    return this.markets.find(
      (m) => m.ticker.toLowerCase() === tickerOrId.toLowerCase() || m.id === tickerOrId
    );
  }

  searchMarkets(query: string): Market[] {
    const q = query.toLowerCase();
    return this.markets.filter(
      (m) =>
        m.ticker.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  getQuote(marketId: string): Quote | undefined {
    return this.quotes.get(marketId);
  }

  getOrderBook(marketId: string, levels = 10): OrderBook | undefined {
    const market = this.markets.find((m) => m.id === marketId);
    if (!market) return undefined;
    return this.generateOrderBook(market, levels);
  }

  generateOHLCData(marketId: string, timeframe: string, bars = 100): OHLCBar[] {
    const quote = this.quotes.get(marketId);
    if (!quote) return [];

    const rng = new SeededRandom(marketId.charCodeAt(0) + timeframe.charCodeAt(0));
    const interval = timeframe === "1m" ? 60000 : timeframe === "5m" ? 300000 : timeframe === "1h" ? 3600000 : 86400000;

    const data: OHLCBar[] = [];
    let currentPrice = quote.last - 0.05;

    for (let i = bars; i > 0; i--) {
      const open = currentPrice;
      const change = (rng.next() - 0.5) * 0.02;
      const close = Math.max(0.01, Math.min(0.99, open + change));
      const high = Math.max(open, close) + rng.next() * 0.01;
      const low = Math.min(open, close) - rng.next() * 0.01;
      const volume = Math.floor(100 + rng.next() * 500);

      data.push({
        timestamp: Date.now() - i * interval,
        open,
        high,
        low,
        close,
        volume,
      });

      currentPrice = close;
    }

    return data;
  }

  // Simulated streaming
  subscribeTrades(marketId: string, callback: (trade: Trade) => void): () => void {
    const interval = setInterval(() => {
      const quote = this.quotes.get(marketId);
      if (!quote) return;

      const rng = new SeededRandom(Date.now());
      const side = rng.next() > 0.5 ? "buy" : "sell";
      const price = side === "buy" ? quote.ask + rng.next() * 0.01 : quote.bid - rng.next() * 0.01;
      const quantity = Math.floor(10 + rng.next() * 100);

      const trade: Trade = {
        id: `T${Date.now()}-${Math.random()}`,
        marketId,
        timestamp: Date.now(),
        side,
        price: Math.max(0.01, Math.min(0.99, price)),
        quantity,
      };

      callback(trade);
    }, 500 + Math.random() * 1500); // Random interval 0.5-2s

    return () => clearInterval(interval);
  }
}

// Singleton
export const mockAdapter = new MockAdapter();
