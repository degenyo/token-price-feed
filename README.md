# Token Price Feed

Real-time cryptocurrency price data via CoinGecko. Built for [Silktrade](https://silktrade.vercel.app).

## What it does

Returns current price, 24h change, and market cap for any supported token.

**Supported tokens:** SOL, BTC, ETH, USDC, USDT, MATIC, AVAX, DOT, LINK, UNI, DOGE, ADA, BONK, JUP

## API

```
POST /skills/token-price/execute
Content-Type: application/json

{ "token": "BTC" }
```

**Response:**
```json
{
  "token": "BTC",
  "priceUsd": 97234.51,
  "change24h": 2.34,
  "marketCap": 1920000000000,
  "source": "coingecko",
  "timestamp": "2026-02-18T21:00:00.000Z"
}
```

## Run locally

```bash
npm install
npm start
```

Server runs on port 3002. Test with:
```bash
curl -X POST http://localhost:3002/skills/token-price/execute \
  -H "Content-Type: application/json" \
  -d '{"token": "SOL"}'
```

## Stack

- Express + TypeScript
- CoinGecko free API (no key needed)
- Zero dependencies beyond express

## License

MIT
