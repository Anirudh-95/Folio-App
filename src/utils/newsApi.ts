export interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: Date;
  ticker: string;
}

// Map crypto tickers to better search terms
const CRYPTO_SEARCH_TERMS: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  MON: 'Monad blockchain',
  FARTCOIN: 'Fartcoin Solana',
  USDT: 'Tether stablecoin',
  BNB: 'Binance BNB',
  DOGE: 'Dogecoin',
  ADA: 'Cardano',
  AVAX: 'Avalanche crypto',
};

function searchQuery(ticker: string, assetType: 'stock' | 'crypto'): string {
  if (assetType === 'crypto') {
    return CRYPTO_SEARCH_TERMS[ticker.toUpperCase()] ?? `${ticker} cryptocurrency`;
  }
  return ticker;
}

export async function fetchTickerNews(
  ticker: string,
  assetType: 'stock' | 'crypto',
  count = 4
): Promise<NewsItem[]> {
  const q = searchQuery(ticker, assetType);
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=${count}&enableFuzzyQuery=false&region=US&lang=en-US`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      news?: Array<{
        uuid: string;
        title: string;
        publisher: string;
        link: string;
        providerPublishTime: number;
      }>;
    };
    return (data.news ?? []).map((item) => ({
      id: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      publishedAt: new Date(item.providerPublishTime * 1000),
      ticker,
    }));
  } catch {
    return [];
  }
}

export function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
