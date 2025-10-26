import { useState, useEffect } from "react";
import { mockAdapter } from "@/lib/adapters/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrderBook } from "@/lib/types";

interface LadderPanelProps {
  marketId: string;
}

export const LadderPanel = ({ marketId }: LadderPanelProps) => {
  const [levels, setLevels] = useState<5 | 10 | 20>(10);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [highlightedPrice, setHighlightedPrice] = useState<number | null>(null);

  useEffect(() => {
    const updateBook = () => {
      const book = mockAdapter.getOrderBook(marketId, levels);
      if (book) setOrderBook(book);
    };

    updateBook();
    const interval = setInterval(updateBook, 1000); // Update every second

    return () => clearInterval(interval);
  }, [marketId, levels]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "[" && highlightedPrice !== null && orderBook) {
        const currentIdx = orderBook.bids.findIndex((b) => b.price === highlightedPrice);
        if (currentIdx < orderBook.bids.length - 1) {
          setHighlightedPrice(orderBook.bids[currentIdx + 1].price);
        }
      }
      if (e.key === "]" && highlightedPrice !== null && orderBook) {
        const currentIdx = orderBook.bids.findIndex((b) => b.price === highlightedPrice);
        if (currentIdx > 0) {
          setHighlightedPrice(orderBook.bids[currentIdx - 1].price);
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [highlightedPrice, orderBook]);

  if (!orderBook) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  const maxCumulative = Math.max(
    orderBook.bids[orderBook.bids.length - 1]?.cumulative || 0,
    orderBook.asks[orderBook.asks.length - 1]?.cumulative || 0
  );

  const totalBidSize = orderBook.bids[orderBook.bids.length - 1]?.cumulative || 0;
  const totalAskSize = orderBook.asks[orderBook.asks.length - 1]?.cumulative || 0;
  const imbalance = (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize || 1);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-1">
          <Button
            variant={levels === 5 ? "default" : "ghost"}
            size="sm"
            onClick={() => setLevels(5)}
            className="h-7 px-2"
          >
            5
          </Button>
          <Button
            variant={levels === 10 ? "default" : "ghost"}
            size="sm"
            onClick={() => setLevels(10)}
            className="h-7 px-2"
          >
            10
          </Button>
          <Button
            variant={levels === 20 ? "default" : "ghost"}
            size="sm"
            onClick={() => setLevels(20)}
            className="h-7 px-2"
          >
            20
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">[ / ] navigate</div>
      </div>

      {/* Imbalance bar */}
      <div className="px-2 py-1 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Imbalance:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${imbalance > 0 ? "bg-green-600" : "bg-red-600"}`}
              style={{ width: `${50 + imbalance * 50}%` }}
            />
          </div>
          <span className="text-xs font-mono">{(imbalance * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Asks (reversed, highest first) */}
        <div className="border-b">
          {[...orderBook.asks].reverse().map((level) => {
            const widthPercent = (level.cumulative / maxCumulative) * 100;
            const isHighlighted = level.price === highlightedPrice;

            return (
              <div
                key={`ask-${level.price}`}
                className={`relative flex items-center justify-between px-3 py-1 text-xs font-mono cursor-pointer hover:bg-accent/50 ${
                  isHighlighted ? "bg-primary/20" : ""
                }`}
                onClick={() => setHighlightedPrice(level.price)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-600/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="relative z-10 text-red-600">{(level.price * 100).toFixed(1)}¢</span>
                <span className="relative z-10">{level.size.toLocaleString()}</span>
                <span className="relative z-10 text-muted-foreground">{level.cumulative.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Spread indicator */}
        <div className="bg-muted/50 py-2 text-center text-xs font-mono text-muted-foreground">
          ── Spread: {((orderBook.asks[0].price - orderBook.bids[0].price) * 100).toFixed(2)}¢ ──
        </div>

        {/* Bids */}
        <div>
          {orderBook.bids.map((level) => {
            const widthPercent = (level.cumulative / maxCumulative) * 100;
            const isHighlighted = level.price === highlightedPrice;

            return (
              <div
                key={`bid-${level.price}`}
                className={`relative flex items-center justify-between px-3 py-1 text-xs font-mono cursor-pointer hover:bg-accent/50 ${
                  isHighlighted ? "bg-primary/20" : ""
                }`}
                onClick={() => setHighlightedPrice(level.price)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-green-600/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="relative z-10 text-green-600">{(level.price * 100).toFixed(1)}¢</span>
                <span className="relative z-10">{level.size.toLocaleString()}</span>
                <span className="relative z-10 text-muted-foreground">{level.cumulative.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
