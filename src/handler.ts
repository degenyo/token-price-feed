const TOKEN_MAP: Record<string, string> = {
  SOL: "solana", BTC: "bitcoin", ETH: "ethereum", USDC: "usd-coin",
  USDT: "tether", MATIC: "matic-network", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", DOGE: "dogecoin",
  ADA: "cardano", BONK: "bonk", JUP: "jupiter-exchange-solana",
};

// Cache prices for 30 seconds to avoid CoinGecko rate limits
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30_000;

export async function handler(input: any): Promise<any> {
  const { token } = input;
  if (!token || typeof token !== "string") throw new Error("Missing required field: token");

  const upperToken = token.toUpperCase();
  const coinId = TOKEN_MAP[upperToken];
  if (!coinId) throw new Error(`Unknown token: ${token}. Supported: ${Object.keys(TOKEN_MAP).join(", ")}`);

  // Check cache
  const cached = cache.get(coinId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { ...cached.data, cached: true, timestamp: new Date().toISOString() };
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
  const resp = await fetch(url);

  // If rate limited but have stale cache, return stale
  if (!resp.ok && cached) {
    return { ...cached.data, cached: true, stale: true, timestamp: new Date().toISOString() };
  }
  if (!resp.ok) throw new Error(`CoinGecko API error: ${resp.status}`);

  const data = (await resp.json()) as Record<string, any>;
  const info = data[coinId];
  if (!info) throw new Error("No data returned from CoinGecko");

  const result = {
    token: upperToken,
    priceUsd: info.usd,
    change24h: info.usd_24h_change ?? 0,
    marketCap: info.usd_market_cap ?? 0,
    source: "coingecko",
  };

  // Update cache
  cache.set(coinId, { data: result, ts: Date.now() });

  return { ...result, cached: false, timestamp: new Date().toISOString() };
}
