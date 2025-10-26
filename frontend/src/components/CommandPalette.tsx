import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, TrendingUp, BarChart3, Layers, BookOpen, Bell, Eye } from "lucide-react";
import { useTerminalStore } from "@/lib/store";
import { mockAdapter } from "@/lib/adapters/mock";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const CommandPalette = () => {
  const { commandOpen, setCommandOpen, addPanel } = useTerminalStore();
  const [search, setSearch] = useState("");
  const [verb, setVerb] = useState<string | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
        setVerb(null);
        setSearch("");
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const handleCommand = (command: string) => {
    const parts = command.trim().split(" ");
    const cmd = parts[0].toUpperCase();
    const arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "SEARCH":
        if (arg) {
          addPanel({
            type: "search",
            title: `Search: ${arg}`,
            config: { query: arg },
          });
        }
        break;

      case "QUOTE":
        const market = mockAdapter.getMarket(arg);
        if (market) {
          addPanel({
            type: "quote",
            title: `Quote: ${market.ticker}`,
            marketId: market.id,
          });
        }
        break;

      case "LADDER":
        const ladderMarket = mockAdapter.getMarket(arg);
        if (ladderMarket) {
          addPanel({
            type: "ladder",
            title: `Ladder: ${ladderMarket.ticker}`,
            marketId: ladderMarket.id,
          });
        }
        break;

      case "G":
        const chartMarket = mockAdapter.getMarket(arg.split(" ")[0]);
        if (chartMarket) {
          addPanel({
            type: "chart",
            title: `Chart: ${chartMarket.ticker}`,
            marketId: chartMarket.id,
            config: { timeframe: "1h" },
          });
        }
        break;

      case "DES":
        const desMarket = mockAdapter.getMarket(arg);
        if (desMarket) {
          addPanel({
            type: "overview",
            title: desMarket.ticker,
            marketId: desMarket.id,
          });
        }
        break;

      case "MOST":
        addPanel({
          type: "search",
          title: `Most: ${arg || "volume"}`,
          config: { query: `most:${arg || "volume"}` },
        });
        break;

      default:
        // Try market search as fallback
        const results = mockAdapter.searchMarkets(command);
        if (results.length > 0) {
          addPanel({
            type: "overview",
            title: results[0].ticker,
            marketId: results[0].id,
          });
        }
    }

    setCommandOpen(false);
    setSearch("");
    setVerb(null);
  };

  const markets = mockAdapter.getMarkets();

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <Command className="bg-card border-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Enter command (SEARCH, QUOTE, LADDER, G, DES, MOST) or ticker..."
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search) {
                  handleCommand(search);
                }
              }}
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found. Try: SEARCH query, QUOTE ticker, LADDER ticker, G ticker, DES ticker, MOST volume
            </Command.Empty>

            <Command.Group heading="Commands">
              <Command.Item
                onSelect={() => {
                  setSearch("SEARCH ");
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <Search className="h-4 w-4" />
                <span>SEARCH &lt;query&gt;</span>
                <span className="ml-auto text-xs text-muted-foreground">Discover markets</span>
              </Command.Item>

              <Command.Item
                onSelect={() => setSearch("QUOTE ")}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <TrendingUp className="h-4 w-4" />
                <span>QUOTE &lt;ticker&gt;</span>
                <span className="ml-auto text-xs text-muted-foreground">Get quote</span>
              </Command.Item>

              <Command.Item
                onSelect={() => setSearch("LADDER ")}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <Layers className="h-4 w-4" />
                <span>LADDER &lt;ticker&gt;</span>
                <span className="ml-auto text-xs text-muted-foreground">Order book</span>
              </Command.Item>

              <Command.Item
                onSelect={() => setSearch("G ")}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4" />
                <span>G &lt;ticker&gt;</span>
                <span className="ml-auto text-xs text-muted-foreground">Chart</span>
              </Command.Item>

              <Command.Item
                onSelect={() => setSearch("DES ")}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" />
                <span>DES &lt;ticker&gt;</span>
                <span className="ml-auto text-xs text-muted-foreground">Description</span>
              </Command.Item>

              <Command.Item
                onSelect={() => setSearch("MOST volume")}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
              >
                <Eye className="h-4 w-4" />
                <span>MOST volume</span>
                <span className="ml-auto text-xs text-muted-foreground">Top markets</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick access">
              {markets.slice(0, 8).map((market) => (
                <Command.Item
                  key={market.id}
                  onSelect={() => handleCommand(market.ticker)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent"
                >
                  <span className="font-mono text-primary">{market.ticker}</span>
                  <span className="text-xs text-muted-foreground truncate">{market.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
