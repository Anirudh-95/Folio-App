import { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

interface TickerAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (ticker: string) => void;
}

export function TickerAutocomplete({ value, onChange, onSelect }: TickerAutocompleteProps) {
  const { state } = usePortfolio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = state.holdings
    .map((h) => h.ticker)
    .filter((t) => !value || t.toUpperCase().startsWith(value.toUpperCase()))
    .slice(0, 6);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-[8px] border border-border bg-bg px-3 focus-within:border-accent/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-secondary shrink-0">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={value}
          placeholder="AAPL or BTC"
          autoComplete="off"
          className="flex-1 bg-transparent py-2.5 text-sm text-primary placeholder-secondary focus:outline-none uppercase"
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-[8px] border border-border bg-card py-1 shadow-lg">
          {suggestions.map((t) => (
            <li
              key={t}
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-border/60 cursor-pointer"
              onMouseDown={() => {
                onSelect(t);
                setOpen(false);
              }}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
