import * as XLSX from 'xlsx';
import type { Holding, Transaction } from '../types';

export function downloadWorkbook(
  holdings: Holding[],
  transactions: Transaction[],
  fileName: string,
  cash = 0
): void {
  const wb = XLSX.utils.book_new();

  const cashRow = cash > 0
    ? [{ ticker: 'CASH', asset_type: 'stock', quantity: 1, avg_cost_basis: cash, current_price: cash, date_acquired: new Date().toISOString().split('T')[0] }]
    : [];

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      ...holdings.map((h) => ({
        ticker: h.ticker,
        asset_type: h.asset_type,
        quantity: h.quantity,
        avg_cost_basis: h.avg_cost_basis,
        current_price: h.current_price,
        date_acquired: h.date_acquired,
      })),
      ...cashRow,
    ]),
    'Holdings'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        date: t.date,
        ticker: t.ticker,
        asset_type: t.asset_type,
        action: t.action,
        quantity: t.quantity,
        price_per_unit: t.price_per_unit,
        fees: t.fees,
        notes: t.notes,
      }))
    ),
    'Transactions'
  );

  const name = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, name);
}

export function createEmptyWorkbook(): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['ticker', 'asset_type', 'quantity', 'avg_cost_basis', 'current_price', 'date_acquired'],
    ]),
    'Holdings'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['date', 'ticker', 'asset_type', 'action', 'quantity', 'price_per_unit', 'fees', 'notes'],
    ]),
    'Transactions'
  );

  XLSX.writeFile(wb, 'folio_portfolio.xlsx');
}
