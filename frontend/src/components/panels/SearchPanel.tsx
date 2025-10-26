import { useState, useEffect } from "react";
import { mockAdapter } from "@/lib/adapters/mock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTerminalStore } from "@/lib/store";
import type { Market, Quote } from "@/lib/types";

interface SearchPanelProps {
  query?: string;
}

export const SearchPanel = ({ query = "" }: SearchPanelProps) => {
  const [results, setResults] = useState<Array<{ market: Market; quote: Quote }>>([]);
  const { addPanel } = useTerminalStore();

  useEffect(() => {
    if (query.startsWith("most:")) {
      const metric = query.replace("most:", "");
      const markets = mockAdapter.getMarkets();
      const withQuotes = markets
        .map((m) => ({ market: m, quote: mockAdapter.getQuote(m.id)! }))
        .filter((r) => r.quote);

      if (metric === "volume") {
        withQuotes.sort((a, b) => b.quote.volume - a.quote.volume);
      } else if (metric === "movers") {
        withQuotes.sort((a, b) => Math.abs(b.quote.changePercent24h) - Math.abs(a.quote.changePercent24h));
      } else if (metric === "oi") {
        withQuotes.sort((a, b) => b.quote.openInterest - a.quote.openInterest);
      }

      setResults(withQuotes.slice(0, 20));
    } else {
      const markets = mockAdapter.searchMarkets(query);
      const withQuotes = markets
        .map((m) => ({ market: m, quote: mockAdapter.getQuote(m.id)! }))
        .filter((r) => r.quote);
      setResults(withQuotes);
    }
  }, [query]);

  const handleSelect = (marketId: string) => {
    addPanel({
      type: "overview",
      title: results.find((r) => r.market.id === marketId)?.market.ticker || "Market",
      marketId,
    });
  };

  return (
    <div className="h-full overflow-auto bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Search Results</h3>
        <p className="text-xs text-muted-foreground">
          {query ? `Query: ${query}` : "All markets"} • {results.length} results
        </p>
      </div>

      <div className="space-y-2">
        {results.map(({ market, quote }) => {
          const isPositive = quote.change24h >= 0;

          return (
            <Card
              key={market.id}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelect(market.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-primary">{market.ticker}</span>
                  <Badge variant="secondary" className="text-xs">
                    {market.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">{(quote.last * 100).toFixed(1)}¢</div>
                  <div className={`text-xs flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {quote.changePercent24h.toFixed(1)}%
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{market.title}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Vol: {quote.volume.toLocaleString()}</span>
                <span>OI: {quote.openInterest.toLocaleString()}</span>
                <span>Spread: {(quote.spread * 100).toFixed(2)}¢</span>
              </div>
            </Card>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No markets found. Try a different search query.
        </div>
      )}
    </div>
  );
};
