import { usePortfolio } from './context/PortfolioContext';
import { PageShell } from './components/layout/PageShell';
import { UploadPage } from './pages/UploadPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AddTradeModal } from './components/modal/AddTradeModal';

function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-secondary">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-30">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 16l4-5 4 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium text-secondary">Reports coming soon</p>
      <p className="text-xs text-secondary/60">Advanced analytics and tax reports are on the roadmap.</p>
    </div>
  );
}

function AppContent() {
  const { state } = usePortfolio();
  const { holdings, transactions, fileName, modalOpen, activeView } = state;

  const hasData = holdings.length > 0 || transactions.length > 0 || fileName !== null;

  if (!hasData) {
    return <UploadPage />;
  }

  return (
    <PageShell>
      {activeView === 'dashboard' && <DashboardPage />}
      {activeView === 'transactions' && <TransactionsPage />}
      {activeView === 'reports' && <ReportsPage />}
      {modalOpen && <AddTradeModal />}
    </PageShell>
  );
}

export function App() {
  return <AppContent />;
}
