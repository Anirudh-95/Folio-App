import { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatCurrency, formatPercent, formatShares } from '../../utils/formatters';
import type { Holding } from '../../types';

type SortKey = 'ticker' | 'current_price' | 'quantity' | 'marketValue' | 'gainPct' | 'weight';
type SortDir = 'asc' | 'desc';
type Filter = 'all' | 'stock' | 'crypto';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={`inline ml-1 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}
    >
      {dir === 'asc' || !active ? (
        <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
      ) : (
        <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
      )}
    </svg>
  );
}

export function HoldingsTable() {
  const { state } = usePortfolio();
  const { holdings, pricesLoading } = state;

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('marketValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const totalValue = useMemo(
    () => holdings.reduce((s, h) => s + h.quantity * h.current_price, 0),
    [holdings]
  );

  const enriched = useMemo(() => {
    return holdings.map((h) => ({
      ...h,
      marketValue: h.quantity * h.current_price,
      gainPct: h.avg_cost_basis > 0 ? ((h.current_price - h.avg_cost_basis) / h.avg_cost_basis) * 100 : 0,
      weight: totalValue > 0 ? (h.quantity * h.current_price / totalValue) * 100 : 0,
    }));
  }, [holdings, totalValue]);

  const filtered = useMemo(() => {
    return enriched
      .filter((h) => (filter === 'all' ? true : h.asset_type === filter))
      .filter((h) => !search || h.ticker.toUpperCase().includes(search.toUpperCase()));
  }, [enriched, filter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortKey === 'ticker') { va = a.ticker; vb = b.ticker; }
      else if (sortKey === 'current_price') { va = a.current_price; vb = b.current_price; }
      else if (sortKey === 'quantity') { va = a.quantity; vb = b.quantity; }
      else if (sortKey === 'marketValue') { va = a.marketValue; vb = b.marketValue; }
      else if (sortKey === 'gainPct') { va = a.gainPct; vb = b.gainPct; }
      else { va = a.weight; vb = b.weight; }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const ColHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-2.5 text-left text-[10px] font-semibold tracking-widest text-secondary cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      {label}
      <SortIcon active={sortKey === k} dir={sortDir} />
    </th>
  );

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'stock', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
  ];

  return (
    <div className="flex flex-col rounded-[8px] border border-border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <span className="text-sm font-semibold text-primary">Portfolio Holdings</span>
        <button className="text-xs text-accent hover:underline">VIEW ALL ASSETS</button>
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-accent/20 text-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-36 rounded-[6px] border border-border bg-bg px-3 py-1 text-xs text-primary placeholder-secondary focus:outline-none focus:border-accent/60 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <ColHeader label="TICKER" k="ticker" />
              <ColHeader label="PRICE" k="current_price" />
              <ColHeader label="QTY" k="quantity" />
              <ColHeader label="MARKET VALUE" k="marketValue" />
              <ColHeader label="G/L %" k="gainPct" />
              <ColHeader label="WEIGHT" k="weight" />
            </tr>
          </thead>
          <tbody>
            {pricesLoading && sorted.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 rounded bg-border animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.map((h) => (
                  <HoldingRow key={h.ticker} holding={h} gainPct={h.gainPct} weight={h.weight} marketValue={h.marketValue} />
                ))}
            {!pricesLoading && sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-secondary">
                  No holdings match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HoldingRow({
  holding,
  gainPct,
  weight,
  marketValue,
}: {
  holding: Holding;
  gainPct: number;
  weight: number;
  marketValue: number;
}) {
  const isGain = gainPct >= 0;
  const dotColor = holding.asset_type === 'crypto' ? '#FFB347' : '#4F8CFF';

  return (
    <tr
      className="border-b border-border/50 hover:bg-border/30 transition-colors"
      style={{ borderLeft: `2px solid ${isGain ? '#00D897' : '#FF4757'}` }}
    >
      <td className="px-3 h-12">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <span className="font-semibold text-sm text-primary">{holding.ticker}</span>
        </div>
      </td>
      <td className="px-3 h-12 font-mono text-sm text-primary">
        {formatCurrency(holding.current_price)}
      </td>
      <td className="px-3 h-12 font-mono text-sm text-primary">
        {formatShares(holding.quantity, holding.asset_type === 'crypto')}
      </td>
      <td className="px-3 h-12 font-mono text-sm text-primary">
        {formatCurrency(marketValue)}
      </td>
      <td className="px-3 h-12 font-mono text-sm" style={{ color: isGain ? '#00D897' : '#FF4757' }}>
        {formatPercent(gainPct, true)}
      </td>
      <td className="px-3 h-12 font-mono text-sm text-secondary">
        {weight.toFixed(1)}%
      </td>
    </tr>
  );
}
