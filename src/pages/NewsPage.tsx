import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { fetchTickerNews, timeAgo, isToday, type NewsItem } from '../utils/newsApi';
import { Spinner } from '../components/shared/Spinner';

interface TickerNews {
  ticker: string;
  assetType: 'stock' | 'crypto';
  items: NewsItem[];
  loading: boolean;
  error: boolean;
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="inline ml-1 opacity-50">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const today = isToday(item.publishedAt);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-1.5 rounded-[8px] border border-border bg-bg p-3 hover:border-accent/40 hover:bg-accent/5 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {item.title}
          <ExternalLinkIcon />
        </span>
        {today && (
          <span className="shrink-0 text-[10px] font-bold tracking-widest text-gain bg-gain/10 px-1.5 py-0.5 rounded">
            TODAY
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-secondary">
        <span className="font-medium">{item.publisher}</span>
        <span>·</span>
        <span>{timeAgo(item.publishedAt)}</span>
      </div>
    </a>
  );
}

function TickerSection({ data }: { data: TickerNews }) {
  const [expanded, setExpanded] = useState(true);
  const todayCount = data.items.filter((i) => isToday(i.publishedAt)).length;
  const dotColor = data.assetType === 'crypto' ? '#FFB347' : 'rgb(var(--color-accent))';

  return (
    <div className="rounded-[8px] border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-border/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          <span className="text-sm font-semibold text-primary">{data.ticker}</span>
          {todayCount > 0 && (
            <span className="text-[10px] font-bold tracking-widest text-gain bg-gain/10 px-1.5 py-0.5 rounded">
              {todayCount} new
            </span>
          )}
          {data.loading && <Spinner size={12} />}
          {data.error && <span className="text-xs text-secondary">Could not load news</span>}
          {!data.loading && !data.error && data.items.length === 0 && (
            <span className="text-xs text-secondary">No recent news</span>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && data.items.length > 0 && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {data.items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NewsPage() {
  const { state } = usePortfolio();
  const { holdings } = state;

  const [feed, setFeed] = useState<TickerNews[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const loadNews = useCallback(async () => {
    if (!holdings.length) return;

    // Initialise with loading state
    setFeed(
      holdings.map((h) => ({
        ticker: h.ticker,
        assetType: h.asset_type,
        items: [],
        loading: true,
        error: false,
      }))
    );

    // Fetch all in parallel
    await Promise.allSettled(
      holdings.map(async (h) => {
        const items = await fetchTickerNews(h.ticker, h.asset_type);
        setFeed((prev) =>
          prev.map((entry) =>
            entry.ticker === h.ticker
              ? { ...entry, items, loading: false, error: false }
              : entry
          )
        );
      })
    );

    setLastFetched(new Date());
  }, [holdings]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const totalToday = feed.reduce(
    (s, t) => s + t.items.filter((i) => isToday(i.publishedAt)).length,
    0
  );
  const isLoading = feed.some((t) => t.loading);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-primary">News Feed</h2>
          <p className="text-xs text-secondary mt-0.5">
            {lastFetched
              ? `Last updated ${timeAgo(lastFetched)}`
              : 'Fetching latest news for your holdings…'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalToday > 0 && (
            <span className="text-xs font-semibold text-gain bg-gain/10 px-2.5 py-1 rounded-full">
              {totalToday} stories today
            </span>
          )}
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary hover:border-secondary transition-colors disabled:opacity-50"
          >
            {isLoading ? <Spinner size={12} /> : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* No holdings */}
      {holdings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-secondary">
          <p className="text-sm">No holdings loaded yet. Upload your portfolio to see news.</p>
        </div>
      )}

      {/* News sections */}
      <div className="flex flex-col gap-3">
        {feed.map((data) => (
          <TickerSection key={data.ticker} data={data} />
        ))}
      </div>
    </div>
  );
}
