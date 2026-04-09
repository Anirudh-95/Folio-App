import { usePortfolio } from '../../context/PortfolioContext';
import { useExcel } from '../../hooks/useExcel';

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hours = et.getHours();
  const mins = et.getMinutes();
  const totalMins = hours * 60 + mins;
  if (day === 0 || day === 6) return false;
  return totalMins >= 570 && totalMins < 960; // 9:30 AM – 4:00 PM ET
}

export function TopBar() {
  const { dispatch } = usePortfolio();
  const { saveFile } = useExcel();
  const marketOpen = isMarketOpen();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6 bg-bg shrink-0">
      {/* Market status */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest text-secondary">MARKET STATUS</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${marketOpen ? 'bg-gain' : 'bg-loss'}`}
            style={{ boxShadow: marketOpen ? '0 0 6px #00D897' : '0 0 6px #FF4757' }}
          />
          <span
            className={`text-xs font-bold tracking-widest ${marketOpen ? 'text-gain' : 'text-loss'}`}
          >
            {marketOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Add Trade shortcut */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL_OPEN', payload: true })}
          className="flex h-8 items-center gap-1.5 rounded-[8px] bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Add Trade
        </button>

        {/* Export */}
        <button
          onClick={saveFile}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-secondary hover:text-primary hover:border-secondary transition-colors"
          title="Export portfolio"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13M8 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Settings / clear */}
        <button
          onClick={() => {
            if (confirm('Clear all portfolio data?')) {
              dispatch({ type: 'CLEAR_DATA' });
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-secondary hover:text-primary hover:border-secondary transition-colors"
          title="Settings"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
