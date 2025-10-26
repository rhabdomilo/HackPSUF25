export async function api<T = any>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export const getMarkets = () => api("/v1/markets");
export const getContracts = (marketId: string) =>
  api(`/v1/contracts?market_id=${marketId}`);
export const getOrderbook = (contractId: string) =>
  api(`/v1/orderbook/${contractId}`);
export const getTrades = (contractId: string, limit = 50) =>
  api(`/v1/trades?contract_id=${contractId}&limit=${limit}`);
export const getCandles = (contractId: string, tf = "1m", limit = 240) =>
  api(`/v1/candles?contract_id=${contractId}&tf=${tf}&limit=${limit}`);
