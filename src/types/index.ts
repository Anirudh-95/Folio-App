export type AssetType = 'stock' | 'crypto';
export type TradeAction = 'buy' | 'sell';

export interface Holding {
  ticker: string;
  asset_type: AssetType;
  quantity: number;
  avg_cost_basis: number;
  current_price: number;
  date_acquired: string;
}

export interface Transaction {
  date: string;
  ticker: string;
  asset_type: AssetType;
  action: TradeAction;
  quantity: number;
  price_per_unit: number;
  fees: number;
  notes: string;
}

export type PriceMap = Record<string, number>;

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

export interface PortfolioState {
  holdings: Holding[];
  transactions: Transaction[];
  prices: PriceMap;
  prevPrices: PriceMap;
  pricesLoading: boolean;
  pricesError: string | null;
  fileName: string | null;
  modalOpen: boolean;
  activeView: 'dashboard' | 'transactions' | 'reports';
  cash: number;
}
