import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

type View = 'dashboard' | 'transactions' | 'reports' | 'simulate' | 'news';

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
    id: 'simulate',
    label: 'SIMULATOR',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 19V6l12-3v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'news',
    label: 'NEWS',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 14h-8M18 10h-8M18 18h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  function toggle() {
    const next = !isDark;
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('folio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('folio_theme', 'light');
    }
    setIsDark(next);
  }

  return { isDark, toggle };
}

export function Sidebar() {
  const { state, dispatch } = usePortfolio();
  const { activeView } = state;
  const { isDark, toggle } = useDarkMode();

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

      {/* Theme toggle */}
      <div className="px-4 pb-3 pt-2 border-t border-border mt-2">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold text-secondary hover:text-primary hover:bg-border/60 transition-colors"
        >
          <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
          <span className="flex items-center gap-1">
            {isDark ? (
              // Moon icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              // Sun icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </button>
      </div>

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
