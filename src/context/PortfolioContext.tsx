import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { Holding, Transaction, PriceMap, PortfolioState } from '../types';

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_FILE'; payload: { holdings: Holding[]; transactions: Transaction[]; fileName: string } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_PRICES'; payload: { prices: PriceMap; prevPrices: PriceMap } }
  | { type: 'SET_PRICES_LOADING'; payload: boolean }
  | { type: 'SET_PRICES_ERROR'; payload: string | null }
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_VIEW'; payload: PortfolioState['activeView'] }
  | { type: 'CLEAR_DATA' };

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: PortfolioState = {
  holdings: [],
  transactions: [],
  prices: {},
  prevPrices: {},
  pricesLoading: false,
  pricesError: null,
  fileName: null,
  modalOpen: false,
  activeView: 'dashboard',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function recalculateHolding(holdings: Holding[], tx: Transaction): Holding[] {
  const existing = holdings.find((h) => h.ticker === tx.ticker);

  if (tx.action === 'buy') {
    if (existing) {
      const newQty = existing.quantity + tx.quantity;
      const newAvg =
        (existing.quantity * existing.avg_cost_basis + tx.quantity * tx.price_per_unit) / newQty;
      return holdings.map((h) =>
        h.ticker === tx.ticker ? { ...h, quantity: newQty, avg_cost_basis: newAvg } : h
      );
    }
    const newHolding: Holding = {
      ticker: tx.ticker,
      asset_type: tx.asset_type,
      quantity: tx.quantity,
      avg_cost_basis: tx.price_per_unit,
      current_price: tx.price_per_unit,
      date_acquired: tx.date,
    };
    return [...holdings, newHolding];
  }

  // sell
  if (!existing) return holdings;
  const newQty = existing.quantity - tx.quantity;
  if (newQty <= 0) return holdings.filter((h) => h.ticker !== tx.ticker);
  return holdings.map((h) => (h.ticker === tx.ticker ? { ...h, quantity: newQty } : h));
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: PortfolioState, action: Action): PortfolioState {
  switch (action.type) {
    case 'LOAD_FILE':
      return {
        ...state,
        holdings: action.payload.holdings,
        transactions: action.payload.transactions,
        fileName: action.payload.fileName,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
        holdings: recalculateHolding(state.holdings, action.payload),
      };
    case 'SET_PRICES':
      return {
        ...state,
        holdings: state.holdings.map((h) =>
          action.payload.prices[h.ticker] !== undefined
            ? { ...h, current_price: action.payload.prices[h.ticker] }
            : h
        ),
        prices: { ...state.prices, ...action.payload.prices },
        prevPrices: { ...state.prevPrices, ...action.payload.prevPrices },
      };
    case 'SET_PRICES_LOADING':
      return { ...state, pricesLoading: action.payload };
    case 'SET_PRICES_ERROR':
      return { ...state, pricesError: action.payload };
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.payload };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'CLEAR_DATA':
      return { ...initialState };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'folio_portfolio_v1';

interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<Action>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PortfolioState>;
        return { ...init, ...saved, modalOpen: false, pricesLoading: false };
      }
    } catch {
      // ignore corrupt storage
    }
    return init;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          holdings: state.holdings,
          transactions: state.transactions,
          fileName: state.fileName,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [state.holdings, state.transactions, state.fileName]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
