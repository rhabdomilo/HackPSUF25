import { mockAdapter } from "@/lib/adapters/mock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface OverviewPanelProps {
  marketId: string;
}

export const OverviewPanel = ({ marketId }: OverviewPanelProps) => {
  const market = mockAdapter.getMarkets().find((m) => m.id === marketId);
  const quote = mockAdapter.getQuote(marketId);

  if (!market || !quote) {
    return <div className="p-4 text-muted-foreground">Market not found</div>;
  }

  const isPositive = quote.change24h >= 0;

  return (
    <div className="h-full overflow-auto bg-card p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold font-mono text-primary">{market.ticker}</h2>
          <Badge variant="secondary">{market.category}</Badge>
          <Badge variant={market.status === "active" ? "default" : "outline"}>{market.status}</Badge>
        </div>
        <p className="text-foreground">{market.title}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Last</div>
          <div className="text-2xl font-bold font-mono">{(quote.last * 100).toFixed(1)}¢</div>
          <div className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {quote.changePercent24h.toFixed(2)}% 24h
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Bid / Ask</div>
          <div className="text-lg font-mono">
            {(quote.bid * 100).toFixed(1)} / {(quote.ask * 100).toFixed(1)}¢
          </div>
          <div className="text-xs text-muted-foreground mt-1">Spread: {(quote.spread * 100).toFixed(2)}¢</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Volume (24h)</div>
          <div className="text-lg font-mono">{quote.volume.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">contracts</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Open Interest</div>
          <div className="text-lg font-mono">{quote.openInterest.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">contracts</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted-foreground">{market.description}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-2">Rules</h3>
        <p className="text-sm text-muted-foreground">{market.rules}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-2">Expiry</h3>
        <p className="text-sm font-mono">{new Date(market.expiry).toLocaleString()}</p>
      </Card>
    </div>
  );
};
