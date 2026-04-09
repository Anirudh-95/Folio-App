import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useExcel } from '../../hooks/useExcel';
import { createEmptyWorkbook } from '../../utils/excelWriter';
import { DropZone } from './DropZone';
import { Spinner } from '../shared/Spinner';

export function EmptyState() {
  const { dispatch } = usePortfolio();
  const { loadFile } = useExcel();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const warnings = await loadFile(file);
      if (warnings.length) {
        console.warn('Parse warnings:', warnings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  }

  function handleStartFresh() {
    // Download empty template and load an empty portfolio
    createEmptyWorkbook();
    dispatch({
      type: 'LOAD_FILE',
      payload: { holdings: [], transactions: [], fileName: 'folio_portfolio.xlsx', cash: 0 },
    });
    dispatch({ type: 'SET_MODAL_OPEN', payload: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[560px] rounded-[12px] border border-border bg-card p-8">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight text-primary">Folio</span>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-secondary hover:text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-secondary hover:text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero text */}
        <div className="mt-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Start your journey.</h1>
          <p className="mt-3 text-sm text-secondary leading-relaxed">
            Let Folio be the Obsidian Analyst for your private wealth. Simply upload
            your portfolio file to begin.
          </p>
        </div>

        {/* Drop zone */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <Spinner size={28} />
            <span className="text-sm text-secondary">Parsing your portfolio…</span>
          </div>
        ) : (
          <DropZone onFile={handleFile} error={error} />
        )}

        {/* Start fresh */}
        <div className="mt-5 text-center">
          <button
            onClick={handleStartFresh}
            className="text-sm text-accent hover:underline"
          >
            or create manually
          </button>
        </div>

        {/* Bottom decorative cards */}
        <div className="mt-8 grid grid-cols-3 gap-3 opacity-30 pointer-events-none">
          {['Holdings', 'P&L Analysis', 'Charts'].map((label) => (
            <div
              key={label}
              className="h-16 rounded-[8px] border border-border bg-bg flex items-end px-3 py-2"
            >
              <span className="text-[10px] font-semibold tracking-widest text-secondary">
                {label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
