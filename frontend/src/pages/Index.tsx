// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Index() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.markets()
      .then(setMarkets)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading markets…</div>;
  if (err) return <div className="p-6 text-red-500">Error: {err}</div>;
  if (!markets.length) return <div className="p-6">No markets. Is the backend running on :4000?</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Markets</h1>
      <ul className="space-y-2">
        {markets.map(m => (
          <li key={m.market_id} className="rounded-lg p-4 bg-neutral-800">
            <div className="text-lg font-semibold">{m.title}</div>
            <div className="opacity-70 text-sm">{m.category}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
