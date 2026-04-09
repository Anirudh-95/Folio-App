import { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { fetchStockHistory } from '../utils/priceApi';
import { buildPerformanceHistory } from '../utils/performanceCalculator';
import type { PortfolioSnapshot } from '../types';

const RANGE_MAP: Record<string, string> = {
  '1W': '5d',
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1Y': '1y',
};

export function usePerformanceHistory(range: string) {
  const { state } = usePortfolio();
  const { transactions, holdings } = state;

  const [history, setHistory] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  const depKey = `${transactions.length}-${holdings.length}-${range}`;
  const prevDep = useRef('');

  useEffect(() => {
    if (depKey === prevDep.current) return;
    prevDep.current = depKey;

    if (!transactions.length && !holdings.length) {
      setHistory([]);
      return;
    }

    setLoading(true);

    // Build ticker → asset_type map from holdings
    const assetTypeMap = new Map(holdings.map((h) => [h.ticker, h.asset_type]));
    const tickers = Array.from(
      new Set([...transactions.map((t) => t.ticker), ...holdings.map((h) => h.ticker)])
    );
    const yahooRange = RANGE_MAP[range] ?? '1mo';

    Promise.allSettled(
      tickers.map((ticker) => {
        const isCrypto = assetTypeMap.get(ticker) === 'crypto';
        const yticker = isCrypto ? `${ticker}-USD` : ticker;
        return fetchStockHistory(yticker, yahooRange).then((hist) => ({ ticker, hist }));
      })
    ).then((results) => {
      const priceHistory: Record<string, Record<string, number>> = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.hist.length) {
          const { ticker, hist } = r.value;
          priceHistory[ticker] = {};
          for (const { date, close } of hist) {
            priceHistory[ticker][date] = close;
          }
        }
      }
      setHistory(buildPerformanceHistory(transactions, priceHistory));
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return { history, loading };
}
