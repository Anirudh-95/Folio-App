import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export function TransactionsPage() {
  const { state, dispatch } = usePortfolio();
  const { transactions } = state;

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-primary">Transaction History</h2>
          <p className="text-xs text-secondary mt-0.5">{transactions.length} transactions total</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_MODAL_OPEN', payload: true })}
          className="flex items-center gap-1.5 rounded-[8px] bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Add Trade
        </button>
      </div>

      <div className="rounded-[8px] border border-border bg-card overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-sm text-secondary">
            No transactions yet. Add your first trade to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['DATE', 'TICKER', 'TYPE', 'ACTION', 'QTY', 'PRICE', 'FEES', 'TOTAL', 'NOTES'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-secondary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((t, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                    <td className="px-4 h-12 text-xs text-secondary whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 h-12 text-sm font-semibold text-primary">{t.ticker}</td>
                    <td className="px-4 h-12">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        t.asset_type === 'crypto'
                          ? 'bg-[#FFB347]/10 text-[#FFB347]'
                          : 'bg-accent/10 text-accent'
                      }`}>
                        {t.asset_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 h-12">
                      <span className={`text-xs font-semibold ${t.action === 'buy' ? 'text-gain' : 'text-loss'}`}>
                        {t.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 h-12 font-mono text-sm text-primary">{t.quantity}</td>
                    <td className="px-4 h-12 font-mono text-sm text-primary">{formatCurrency(t.price_per_unit)}</td>
                    <td className="px-4 h-12 font-mono text-sm text-secondary">{t.fees ? formatCurrency(t.fees) : '—'}</td>
                    <td className="px-4 h-12 font-mono text-sm text-primary">
                      {formatCurrency(t.quantity * t.price_per_unit + t.fees)}
                    </td>
                    <td className="px-4 h-12 text-xs text-secondary max-w-[180px] truncate">{t.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
