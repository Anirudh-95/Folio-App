import * as XLSX from 'xlsx';
import type { Holding, Transaction, AssetType, TradeAction } from '../types';
import { HOLDINGS_SHEET, TRANSACTIONS_SHEET } from '../constants/schema';

function normalizeHeader(h: unknown): string {
  return String(h ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .trim();
}

function parseDate(val: unknown): string {
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string' && val.length >= 8) return val.split('T')[0];
  if (typeof val === 'number') {
    // Excel serial number
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

function toNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export interface ParseResult {
  holdings: Holding[];
  transactions: Transaction[];
  warnings: string[];
  cash: number;
}

export function parseWorkbook(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const warnings: string[] = [];

  // --- Holdings ---
  const holdingsSheet = wb.Sheets[HOLDINGS_SHEET];
  if (!holdingsSheet) {
    throw new Error(`Sheet "${HOLDINGS_SHEET}" not found. Expected sheets: Holdings, Transactions.`);
  }

  const holdingsRaw = XLSX.utils.sheet_to_json<unknown[]>(holdingsSheet, { header: 1 }) as unknown[][];
  if (holdingsRaw.length < 2) {
    throw new Error('Holdings sheet has no data rows.');
  }

  const holdingHeaders = (holdingsRaw[0] as unknown[]).map(normalizeHeader);
  const holdings: Holding[] = holdingsRaw
    .slice(1)
    .filter((row) => Array.isArray(row) && (row as unknown[]).some((c) => c !== undefined && c !== ''))
    .map((row) => {
      const r = row as unknown[];
      const obj: Record<string, unknown> = {};
      holdingHeaders.forEach((h, i) => { obj[h] = r[i]; });

      const ticker = String(obj['ticker'] ?? '').toUpperCase().trim();
      const asset_type = String(obj['asset_type'] ?? 'stock').toLowerCase() as AssetType;
      const quantity = toNum(obj['quantity']);
      const avg_cost_basis = toNum(obj['avg_cost_basis']);
      const current_price = toNum(obj['current_price']);
      const date_acquired = parseDate(obj['date_acquired']);

      if (!ticker) warnings.push('Skipped holding row: missing ticker');
      if (quantity < 0) warnings.push(`Negative quantity for ${ticker}`);
      if (!['stock', 'crypto'].includes(asset_type)) {
        warnings.push(`Unrecognized asset_type "${asset_type}" for ${ticker}, defaulting to "stock"`);
      }

      return { ticker, asset_type, quantity, avg_cost_basis, current_price, date_acquired };
    })
    .filter((h) => h.ticker && h.quantity > 0);

  // Extract CASH row and remove from holdings
  const cashRow = holdings.find((h) => h.ticker === 'CASH');
  const cash = cashRow ? cashRow.current_price : 0;
  const holdingsWithoutCash = holdings.filter((h) => h.ticker !== 'CASH');

  // --- Transactions ---
  const txSheet = wb.Sheets[TRANSACTIONS_SHEET];
  if (!txSheet) {
    throw new Error(`Sheet "${TRANSACTIONS_SHEET}" not found. Expected sheets: Holdings, Transactions.`);
  }

  const txRaw = XLSX.utils.sheet_to_json<unknown[]>(txSheet, { header: 1 }) as unknown[][];
  let transactions: Transaction[] = [];

  if (txRaw.length >= 2) {
    const txHeaders = (txRaw[0] as unknown[]).map(normalizeHeader);

    if (txRaw.length > 501) {
      warnings.push('Transactions sheet exceeds 500 rows — performance may be affected.');
    }

    transactions = txRaw
      .slice(1)
      .filter((row) => Array.isArray(row) && (row as unknown[]).some((c) => c !== undefined && c !== ''))
      .map((row) => {
        const r = row as unknown[];
        const obj: Record<string, unknown> = {};
        txHeaders.forEach((h, i) => { obj[h] = r[i]; });

        return {
          date: parseDate(obj['date']),
          ticker: String(obj['ticker'] ?? '').toUpperCase().trim(),
          asset_type: String(obj['asset_type'] ?? 'stock').toLowerCase() as AssetType,
          action: String(obj['action'] ?? 'buy').toLowerCase() as TradeAction,
          quantity: toNum(obj['quantity']),
          price_per_unit: toNum(obj['price_per_unit']),
          fees: toNum(obj['fees']),
          notes: String(obj['notes'] ?? ''),
        };
      })
      .filter((t) => t.ticker && t.quantity > 0);
  }

  return { holdings: holdingsWithoutCash, transactions, warnings, cash };
}
