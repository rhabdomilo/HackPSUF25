// src/lib/api.ts
async function get<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export const api = {
  markets: () => get<any[]>("/v1/markets"),
  contracts: (marketId: string) => get<any[]>(`/v1/contracts?market_id=${marketId}`),
  orderbook: (cid: string) => get<{ bid:any[]; ask:any[] }>(`/v1/orderbook/${cid}`),
  trades: (cid: string, limit=50) => get<any[]>(`/v1/trades?contract_id=${cid}&limit=${limit}`),
};
