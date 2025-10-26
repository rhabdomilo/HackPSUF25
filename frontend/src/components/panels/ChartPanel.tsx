import { useState, useEffect } from "react";
import { mockAdapter } from "@/lib/adapters/mock";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TimeFrame, OHLCBar } from "@/lib/types";

interface ChartPanelProps {
  marketId: string;
}

export const ChartPanel = ({ marketId }: ChartPanelProps) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1h");
  const [data, setData] = useState<OHLCBar[]>([]);

  useEffect(() => {
    const bars = mockAdapter.generateOHLCData(marketId, timeframe, 100);
    setData(bars);
  }, [marketId, timeframe]);

  const market = mockAdapter.getMarkets().find((m) => m.id === marketId);

  const chartData = data.map((bar) => ({
    time: new Date(bar.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    price: bar.close * 100, // Convert to cents
    volume: bar.volume,
  }));

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="font-mono text-sm text-primary">{market?.ticker}</div>
        <div className="flex gap-1">
          {(["1m", "5m", "1h", "1d"] as TimeFrame[]).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className="h-7 px-2 text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              stroke="hsl(var(--border))"
              label={{ value: "Price (¢)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t p-2 text-xs text-muted-foreground">
        Mid-price as probability • {data.length} bars
      </div>
    </div>
  );
};
