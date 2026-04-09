export const HOLDINGS_SHEET = 'Holdings';
export const TRANSACTIONS_SHEET = 'Transactions';

export const HOLDINGS_COLUMNS = [
  'ticker',
  'asset_type',
  'quantity',
  'avg_cost_basis',
  'current_price',
  'date_acquired',
] as const;

export const TRANSACTIONS_COLUMNS = [
  'date',
  'ticker',
  'asset_type',
  'action',
  'quantity',
  'price_per_unit',
  'fees',
  'notes',
] as const;
