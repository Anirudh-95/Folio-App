import { usePortfolio } from '../../context/PortfolioContext';

type View = 'dashboard' | 'transactions' | 'reports';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'DASHBOARD',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'TRANSACTIONS',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'REPORTS',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 16l4-5 4 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { state, dispatch } = usePortfolio();
  const { activeView } = state;

  return (
    <aside className="flex flex-col w-[180px] min-h-screen bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="text-xl font-bold tracking-tight text-primary">Folio</div>
        <div className="text-[10px] font-medium tracking-widest text-secondary mt-0.5">
          OBSIDIAN ANALYST
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-xs font-semibold tracking-widest transition-colors ${
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-secondary hover:text-primary hover:bg-border/60'
              }`}
            >
              <span className={active ? 'text-accent' : 'text-secondary'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-4 py-5 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold shrink-0">
            JD
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-primary truncate">Jane Doe</div>
            <div className="text-[10px] text-secondary truncate">PRO ANALYST</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
