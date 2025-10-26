import { useEffect } from "react";
import { Moon, Sun, Terminal, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTerminalStore } from "@/lib/store";
import type { Category } from "@/lib/types";
import { CommandPalette } from "./CommandPalette";
import { OverviewPanel } from "./panels/OverviewPanel";
import { LadderPanel } from "./panels/LadderPanel";
import { ChartPanel } from "./panels/ChartPanel";
import { TapePanel } from "./panels/TapePanel";
import { SearchPanel } from "./panels/SearchPanel";
import { X } from "lucide-react";

const CATEGORIES: Category[] = [
  "New",
  "All",
  "Politics",
  "Sports",
  "Culture",
  "Crypto",
  "Climate",
  "Economics",
  "Mentions",
  "Companies",
  "Financials",
  "Tech & Science",
  "Health",
  "World",
];

export const TerminalShell = () => {
  const { theme, toggleTheme, selectedCategory, setSelectedCategory, setCommandOpen, panels, removePanel } =
    useTerminalStore();

  useEffect(() => {
    // Set initial theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[hsl(var(--terminal-bg))]">
      {/* Top command bar */}
      <header className="h-12 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl">
              Sec<sup className="text-primary">2</sup>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="text-xs font-mono h-7"
          >
            <kbd className="mr-2">⌘K</kbd>
            Command Palette
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Mock Data
          </Badge>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Categories */}
        <aside className="w-48 border-r bg-card overflow-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Categories</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${
                  selectedCategory === cat ? "bg-accent font-medium" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Main canvas - Panels */}
        <main className="flex-1 overflow-auto p-2">
          {panels.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 max-w-md">
                <Terminal className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">Welcome to Sec²</h2>
                <p className="text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd> to open the command palette and
                  start exploring markets.
                </p>
                <div className="text-xs text-muted-foreground space-y-1 mt-4">
                  <div>• SEARCH &lt;query&gt; - discover markets</div>
                  <div>• QUOTE &lt;ticker&gt; - get quotes</div>
                  <div>• LADDER &lt;ticker&gt; - view order book</div>
                  <div>• G &lt;ticker&gt; - open chart</div>
                  <div>• DES &lt;ticker&gt; - market description</div>
                  <div>• MOST volume - top markets</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full auto-rows-[minmax(400px,1fr)]">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  className="border rounded-md overflow-hidden bg-card shadow-sm flex flex-col"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
                    <span className="text-sm font-medium">{panel.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePanel(panel.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {panel.type === "overview" && panel.marketId && <OverviewPanel marketId={panel.marketId} />}
                    {panel.type === "ladder" && panel.marketId && <LadderPanel marketId={panel.marketId} />}
                    {panel.type === "chart" && panel.marketId && <ChartPanel marketId={panel.marketId} />}
                    {panel.type === "tape" && panel.marketId && <TapePanel marketId={panel.marketId} />}
                    {panel.type === "search" && <SearchPanel query={panel.config?.query} />}
                    {panel.type === "quote" && panel.marketId && <OverviewPanel marketId={panel.marketId} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer status bar */}
      <footer className="h-8 border-t bg-card flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1 text-green-600" />
            WS Connected
          </Badge>
          <span className="text-muted-foreground">Latency: ~50ms</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Not a brokerage • Analytics only
        </Badge>
      </footer>

      <CommandPalette />
    </div>
  );
};
