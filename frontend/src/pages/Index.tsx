import { useEffect, useState } from "react";

export default function Index() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const [orderbook, setOrderbook] = useState<any | null>(null);
  const [trades, setTrades] = useState<any[]>([]);

  // Load markets on load
  useEffect(() => {
    fetch("/v1/markets")
      .then((res) => res.json())
      .then(setMarkets);
  }, []);

  // When market selected → load contracts
  useEffect(() => {
  if (!selected) {
    setContracts([]);
    setSelectedContract(null);
    return;
  }

  fetch(`/v1/contracts?market_id=${selected.market_id}`)
    .then((res) => res.json())
    .then(setContracts);
}, [selected]);


  // When contract selected → load orderbook + trades
  useEffect(() => {
  if (!selectedContract) {
    setOrderbook(null);
    setTrades([]);
    return;
  }

  fetch(`/v1/orderbook/${selectedContract.contract_id}`)
    .then((res) => res.json())
    .then(setOrderbook);

  fetch(`/v1/trades?contract_id=${selectedContract.contract_id}&limit=20`)
    .then((res) => res.json())
    .then(setTrades);
  }, [selectedContract]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Markets</h1>

      {/* MARKETS */}
      <ul className="space-y-2">
        {markets.map((m) => (
          <li
            key={m.market_id}
            onClick={() =>
              setSelected((prev) =>
              prev?.market_id === m.market_id ? null : m
                )}
            className={`p-4 rounded cursor-pointer ${
              selected?.market_id === m.market_id
                ? "bg-blue-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm opacity-70">{m.category}</div>
          </li>
        ))}
      </ul>

      {/* CONTRACTS */}
      {selected && (
        <div className="mt-8 border-t border-neutral-700 pt-4">
          <h2 className="text-xl font-semibold mb-3">
            Contracts for: {selected.title}
          </h2>

          {contracts.length === 0 ? (
            <div className="opacity-50">No contracts available</div>
          ) : (
            <ul className="space-y-2">
              {contracts.map((c) => (
                <li
                  key={c.contract_id}
                  onClick={() =>
                    setSelectedContract((prev) =>
                      prev?.contract_id === c.contract_id ? null : c
                    )
                  }
                  className={`p-3 rounded flex justify-between items-center cursor-pointer ${
                    selectedContract?.contract_id === c.contract_id
                      ? "bg-green-600"
                      : "bg-neutral-900 hover:bg-neutral-800"
                  }`}
                >
                  <span>{c.display}</span>
                  <span className="font-bold">
                    {c.last_price_cents}¢ ({Math.round(c.probability * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ORDERBOOK + TRADES */}
      {selectedContract && orderbook && (
        <div className="mt-10 border-t border-neutral-700 pt-4">
          <h2 className="text-xl font-semibold mb-4">Order Book</h2>

          <div className="flex gap-10 text-sm">
            <div>
              <div className="text-green-400 font-semibold mb-1">Bids</div>
              {orderbook.bid.map((b: any) => (
                <div key={b.level} className="flex gap-4">
                  <span>{b.size}</span>
                  <span>{b.price_cents}¢</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-red-400 font-semibold mb-1">Asks</div>
              {orderbook.ask.map((a: any) => (
                <div key={a.level} className="flex gap-4">
                  <span>{a.price_cents}¢</span>
                  <span>{a.size}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-2">Recent Trades</h2>
          <div className="text-sm space-y-1">
            {trades.map((t) => (
              <div
                key={t.trade_id}
                className="flex justify-between w-64"
              >
                <span>{t.ts.split("T")[1].split("Z")[0]}</span>
                <span
                  className={
                    t.aggressor === "BUYER"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {t.price_cents}¢
                </span>
                <span>{t.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
