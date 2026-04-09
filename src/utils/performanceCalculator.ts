import type { Transaction, PortfolioSnapshot } from '../types';

type PriceHistory = Record<string, Record<string, number>>;

export function buildPerformanceHistory(
  transactions: Transaction[],
  priceHistory: PriceHistory
): PortfolioSnapshot[] {
  if (!transactions.length) return [];

  const allDates = new Set<string>();
  for (const dates of Object.values(priceHistory)) {
    for (const date of Object.keys(dates)) {
      allDates.add(date);
    }
  }

  const sortedDates = Array.from(allDates).sort();
  if (!sortedDates.length) return [];

  const sortedTxs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const ledger: Record<string, number> = {};
  let txIdx = 0;

  const snapshots: PortfolioSnapshot[] = [];

  for (const date of sortedDates) {
    while (txIdx < sortedTxs.length && sortedTxs[txIdx].date <= date) {
      const tx = sortedTxs[txIdx];
      if (tx.action === 'buy') {
        ledger[tx.ticker] = (ledger[tx.ticker] ?? 0) + tx.quantity;
      } else {
        ledger[tx.ticker] = Math.max(0, (ledger[tx.ticker] ?? 0) - tx.quantity);
      }
      txIdx++;
    }

    let value = 0;
    for (const [ticker, qty] of Object.entries(ledger)) {
      if (qty <= 0) continue;
      const tickerHistory = priceHistory[ticker];
      if (!tickerHistory) continue;

      // Forward-fill: find the most recent available price on or before this date
      let price = tickerHistory[date];
      if (price === undefined) {
        const availDates = Object.keys(tickerHistory).filter((d) => d <= date).sort();
        if (availDates.length) price = tickerHistory[availDates[availDates.length - 1]];
      }
      if (price !== undefined && price > 0) {
        value += qty * price;
      }
    }

    if (value > 0) {
      snapshots.push({ date, value });
    }
  }

  return snapshots;
}
