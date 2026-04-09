import { getCoinGeckoIds } from './coinGeckoIdMap';
import type { PriceMap } from '../types';

interface StockPriceResult {
  price: number;
  prevClose: number;
}

async function fetchYahooChart(ticker: string): Promise<StockPriceResult | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
          };
        }>;
      };
    };
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose ?? meta.regularMarketPrice,
    };
  } catch {
    return null;
  }
}

export async function fetchStockPrices(
  tickers: string[]
): Promise<{ prices: PriceMap; prevPrices: PriceMap }> {
  if (!tickers.length) return { prices: {}, prevPrices: {} };

  const results = await Promise.allSettled(
    tickers.map((t) => fetchYahooChart(t).then((r) => ({ ticker: t, result: r })))
  );

  const prices: PriceMap = {};
  const prevPrices: PriceMap = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.result) {
      prices[r.value.ticker] = r.value.result.price;
      prevPrices[r.value.ticker] = r.value.result.prevClose;
    }
  }
  return { prices, prevPrices };
}

export async function fetchCryptoPrices(
  tickers: string[]
): Promise<{ prices: PriceMap; prevPrices: PriceMap }> {
  if (!tickers.length) return { prices: {}, prevPrices: {} };

  const idMap = getCoinGeckoIds(tickers);
  const ids = Object.values(idMap);

  if (!ids.length) {
    // Fallback: try Yahoo Finance with -USD suffix
    return fetchStockPrices(tickers.map((t) => `${t}-USD`)).then(({ prices, prevPrices }) => {
      const p: PriceMap = {};
      const pp: PriceMap = {};
      for (const t of tickers) {
        if (prices[`${t}-USD`] !== undefined) p[t] = prices[`${t}-USD`];
        if (prevPrices[`${t}-USD`] !== undefined) pp[t] = prevPrices[`${t}-USD`];
      }
      return { prices: p, prevPrices: pp };
    });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

    const data = await res.json() as Record<string, { usd?: number; usd_24h_change?: number }>;
    const prices: PriceMap = {};
    const prevPrices: PriceMap = {};

    for (const [ticker, coinId] of Object.entries(idMap)) {
      const entry = data[coinId];
      if (entry?.usd !== undefined) {
        prices[ticker] = entry.usd;
        const change24h = entry.usd_24h_change ?? 0;
        prevPrices[ticker] = entry.usd / (1 + change24h / 100);
      }
    }
    return { prices, prevPrices };
  } catch {
    // Fallback to Yahoo -USD
    return fetchStockPrices(tickers.map((t) => `${t}-USD`)).then(({ prices, prevPrices }) => {
      const p: PriceMap = {};
      const pp: PriceMap = {};
      for (const t of tickers) {
        if (prices[`${t}-USD`] !== undefined) p[t] = prices[`${t}-USD`];
        if (prevPrices[`${t}-USD`] !== undefined) pp[t] = prevPrices[`${t}-USD`];
      }
      return { prices: p, prevPrices: pp };
    });
  }
}

export async function fetchSinglePrice(ticker: string, assetType: 'stock' | 'crypto'): Promise<number | null> {
  if (assetType === 'crypto') {
    const { prices } = await fetchCryptoPrices([ticker]);
    return prices[ticker] ?? null;
  }
  const result = await fetchYahooChart(ticker);
  return result?.price ?? null;
}

export async function fetchStockHistory(
  ticker: string,
  range: string
): Promise<Array<{ date: string; close: number }>> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=${range}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{ close?: (number | null)[] }>;
          };
        }>;
      };
    };
    const result = data?.chart?.result?.[0];
    if (!result) return [];
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[i] ?? 0,
      }))
      .filter((d) => d.close > 0);
  } catch {
    return [];
  }
}
