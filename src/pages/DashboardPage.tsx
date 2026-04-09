import { usePortfolio } from '../context/PortfolioContext';
import { usePrices } from '../hooks/usePrices';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { HoldingsTable } from '../components/dashboard/HoldingsTable';
import { DonutChart } from '../components/dashboard/DonutChart';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { ErrorBanner } from '../components/shared/ErrorBanner';

export function DashboardPage() {
  const { state, dispatch } = usePortfolio();
  const { pricesError, holdings } = state;

  // Trigger price fetch whenever holdings change
  usePrices();

  if (!holdings.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-secondary">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-30">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="text-sm">No holdings yet.</p>
        <button
          onClick={() => dispatch({ type: 'SET_MODAL_OPEN', payload: true })}
          className="text-sm text-accent hover:underline"
        >
          Add your first trade →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pricesError && (
        <ErrorBanner
          message={pricesError}
          onDismiss={() => dispatch({ type: 'SET_PRICES_ERROR', payload: null })}
        />
      )}

      {/* Summary cards */}
      <SummaryCards />

      {/* Holdings + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HoldingsTable />
        </div>
        <div className="lg:col-span-2">
          <DonutChart />
        </div>
      </div>

      {/* Performance chart */}
      <PerformanceChart />
    </div>
  );
}
