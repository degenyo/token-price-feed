import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN_MAP: Record<string, string> = {
  SOL: "solana",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  LINK: "chainlink",
  UNI: "uniswap",
  DOGE: "dogecoin",
  ADA: "cardano",
  BONK: "bonk",
  JUP: "jupiter-exchange-solana",
};

app.post("/skills/token-price/execute", async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Missing required field: token (string)" });
    return;
  }

  const upperToken = token.toUpperCase();
  const coinId = TOKEN_MAP[upperToken];

  if (!coinId) {
    res.status(400).json({
      error: `Unknown token: ${token}. Supported: ${Object.keys(TOKEN_MAP).join(", ")}`,
    });
    return;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    const resp = await fetch(url);

    if (!resp.ok) {
      res.status(502).json({ error: `CoinGecko API error: ${resp.status}` });
      return;
    }

    const data = (await resp.json()) as Record<string, any>;
    const info = data[coinId];

    if (!info) {
      res.status(502).json({ error: "No data returned from CoinGecko" });
      return;
    }

    res.json({
      token: upperToken,
      priceUsd: info.usd,
      change24h: info.usd_24h_change ?? 0,
      marketCap: info.usd_market_cap ?? 0,
      source: "coingecko",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch price: ${err.message}` });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Token Price Feed running on :${PORT}`));
