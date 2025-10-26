import { useState, useEffect } from "react";
import { mockAdapter } from "@/lib/adapters/mock";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import type { Trade } from "@/lib/types";

interface TapePanelProps {
  marketId: string;
}

export const TapePanel = ({ marketId }: TapePanelProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const unsubscribe = mockAdapter.subscribeTrades(marketId, (trade) => {
      if (!paused) {
        setTrades((prev) => [trade, ...prev].slice(0, 100)); // Keep last 100
      }
    });

    return unsubscribe;
  }, [marketId, paused]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const market = mockAdapter.getMarkets().find((m) => m.id === marketId);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="font-mono text-sm text-primary">{market?.ticker} Tape</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">P = pause</span>
          <Button variant="ghost" size="sm" onClick={() => setPaused(!paused)} className="h-7 w-7 p-0">
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-muted">
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Time</th>
              <th className="text-left p-2 font-medium">Side</th>
              <th className="text-right p-2 font-medium">Price</th>
              <th className="text-right p-2 font-medium">Qty</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b hover:bg-accent/50">
                <td className="p-2 text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td className={`p-2 font-semibold ${trade.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                  {trade.side.toUpperCase()}
                </td>
                <td className="p-2 text-right">{(trade.price * 100).toFixed(1)}¢</td>
                <td className="p-2 text-right">{trade.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {trades.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Waiting for trades...</div>
        )}
      </div>

      <div className="border-t p-2 text-xs text-muted-foreground">
        {paused ? "Paused" : "Live"} • {trades.length} trades
      </div>
    </div>
  );
};
