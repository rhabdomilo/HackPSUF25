import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "data", "mock_data.json");
const DB = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const app = express();
app.use(cors());
// Health (keep)
app.get("/health", (_req, res) => res.json({ ok: true }));

// Markets (keep)
app.get("/v1/markets", (req, res) => {
  const q = (req.query.q as string)?.toLowerCase() || "";
  const rows = q
    ? DB.markets.filter((m: any) =>
        (m.title || "").toLowerCase().includes(q) ||
        (m.slug || "").toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q)
      )
    : DB.markets;
  res.json(rows);
});

// Contracts (filter by market_id)
app.get("/v1/contracts", (req, res) => {
  const { market_id } = req.query as { market_id?: string };
  const rows = market_id
    ? DB.contracts.filter((c: any) => c.market_id === market_id)
    : DB.contracts;
  res.json(rows);
});

// Order book by contract_id
app.get("/v1/orderbook/:contract_id", (req, res) => {
  const { contract_id } = req.params;
  const rows = DB.order_book.filter((o: any) => o.contract_id === contract_id);
  const bid = rows.filter((r: any) => r.side === "BID").sort((a: any, b: any) => a.level - b.level);
  const ask = rows.filter((r: any) => r.side === "ASK").sort((a: any, b: any) => a.level - b.level);
  res.json({ contract_id, bid, ask });
});

// Trades (tape) with optional contract_id & limit
app.get("/v1/trades", (req, res) => {
  const { contract_id, limit } = req.query as { contract_id?: string; limit?: string };
  let rows = DB.trades as any[];
  if (contract_id) rows = rows.filter((t: any) => t.contract_id === contract_id);
  rows = rows.sort((a, b) => (a.ts < b.ts ? 1 : -1)); // newest first
  const lim = Math.min(500, Math.max(1, Number(limit) || 100));
  res.json(rows.slice(0, lim));
});

// Candles: ?contract_id=&tf=1m|1d&limit=#
app.get("/v1/candles", (req, res) => {
  const { contract_id, tf, limit } = req.query as { contract_id?: string; tf?: string; limit?: string };
  let rows = DB.candles as any[];
  if (contract_id) rows = rows.filter((c: any) => c.contract_id === contract_id);
  if (tf) rows = rows.filter((c: any) => c.timeframe === tf);
  rows = rows.sort((a, b) => (a.ts > b.ts ? 1 : -1)); // oldest first for charts
  const lim = Math.min(2000, Math.max(1, Number(limit) || 240));
  res.json(rows.slice(-lim));
});

// News & Calendar
app.get("/v1/news", (req, res) => {
  const { market_id } = req.query as { market_id?: string };
  const rows = market_id
    ? DB.news.filter((n: any) => (n.related_market_ids || "").includes(market_id))
    : DB.news;
  res.json(rows);
});

app.get("/v1/calendar", (_req, res) => {
  const rows = [...DB.calendar].sort((a: any, b: any) => (a.ts > b.ts ? 1 : -1));
  res.json(rows);
});

// Portfolio & Positions
app.get("/v1/portfolio/:user_id", (req, res) => {
  const item = DB.portfolio.find((p: any) => p.user_id === req.params.user_id);
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

app.get("/v1/positions/:user_id", (req, res) => {
  const items = DB.positions.filter((p: any) => p.user_id === req.params.user_id);
  res.json({ items });
});


const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);