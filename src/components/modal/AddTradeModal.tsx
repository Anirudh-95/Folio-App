import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useExcel } from '../../hooks/useExcel';
import { fetchSinglePrice } from '../../utils/priceApi';
import { formatCurrency } from '../../utils/formatters';
import { ModalOverlay } from './ModalOverlay';
import { TickerAutocomplete } from './TickerAutocomplete';
import { AssetTypePills } from './AssetTypePills';
import type { Transaction, AssetType, TradeAction } from '../../types';

interface FormState {
  ticker: string;
  assetType: AssetType;
  action: TradeAction;
  quantity: string;
  price: string;
  date: string;
  fees: string;
  notes: string;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export function AddTradeModal() {
  const { state, dispatch } = usePortfolio();
  const { saveFile } = useExcel();

  const [form, setForm] = useState<FormState>({
    ticker: '',
    assetType: 'stock',
    action: 'buy',
    quantity: '',
    price: '',
    date: today(),
    fees: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [assetDetected, setAssetDetected] = useState(false);

  function close() {
    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
  }

  async function handleTickerSelect(ticker: string) {
    setForm((f) => ({ ...f, ticker }));
    const existing = state.holdings.find((h) => h.ticker === ticker);
    if (existing) {
      setForm((f) => ({ ...f, assetType: existing.asset_type }));
      setAssetDetected(true);
    }
    if (ticker.length >= 1) {
      setPriceLoading(true);
      const assetType = existing?.asset_type ?? form.assetType;
      const price = await fetchSinglePrice(ticker, assetType);
      if (price !== null) {
        setForm((f) => ({ ...f, price: price.toFixed(2) }));
      }
      setPriceLoading(false);
    }
  }

  async function handleTickerChange(val: string) {
    setForm((f) => ({ ...f, ticker: val }));
    setAssetDetected(false);
    if (val.length >= 2) {
      setPriceLoading(true);
      const price = await fetchSinglePrice(val, form.assetType);
      if (price !== null) {
        setForm((f) => ({ ...f, price: price.toFixed(2) }));
      }
      setPriceLoading(false);
    }
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.ticker) e.ticker = 'Ticker is required';
    if (!form.quantity || parseFloat(form.quantity) <= 0) e.quantity = 'Enter a valid quantity';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const tx: Transaction = {
      date: form.date,
      ticker: form.ticker.toUpperCase(),
      asset_type: form.assetType,
      action: form.action,
      quantity: parseFloat(form.quantity),
      price_per_unit: parseFloat(form.price),
      fees: form.fees ? parseFloat(form.fees) : 0,
      notes: form.notes,
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    saveFile();
    close();
  }

  const estimatedTotal =
    (parseFloat(form.quantity) || 0) * (parseFloat(form.price) || 0) +
    (parseFloat(form.fees) || 0);

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-[8px] border ${errors[field] ? 'border-loss/60' : 'border-border'} bg-bg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent/60 transition-colors`;

  return (
    <ModalOverlay onClose={close}>
      <div className="rounded-[12px] border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-xs font-bold tracking-widest text-primary">ADD NEW TRADE</span>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-border transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Ticker */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
              TICKER / ASSET
            </label>
            <TickerAutocomplete
              value={form.ticker}
              onChange={handleTickerChange}
              onSelect={handleTickerSelect}
            />
            {errors.ticker && <p className="mt-1 text-xs text-loss">{errors.ticker}</p>}
          </div>

          {/* Asset type */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
              ASSET TYPE
            </label>
            <AssetTypePills
              value={form.assetType}
              onChange={(v) => setForm((f) => ({ ...f, assetType: v }))}
            />
            {assetDetected && (
              <p className="mt-1 text-[10px] text-accent">Auto-detected from existing holdings</p>
            )}
          </div>

          {/* Action toggle */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
              TRANSACTION TYPE
            </label>
            <div className="flex gap-2">
              {(['buy', 'sell'] as TradeAction[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, action: a }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-sm font-semibold transition-colors ${
                    form.action === a
                      ? a === 'buy'
                        ? 'bg-gain text-bg'
                        : 'bg-loss/80 text-white'
                      : 'bg-bg border border-border text-secondary hover:text-primary'
                  }`}
                >
                  {a === 'buy' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {a === 'buy' ? 'Buy' : 'Sell'}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
                QUANTITY
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="0.00"
                className={inputCls('quantity')}
              />
              {errors.quantity && <p className="mt-1 text-xs text-loss">{errors.quantity}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
                PRICE PER UNIT
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={priceLoading ? '' : form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder={priceLoading ? 'Fetching...' : '0.00'}
                  className={`${inputCls('price')} pl-6`}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-loss">{errors.price}</p>}
            </div>
          </div>

          {/* Date + Fees */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
                DATE
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputCls('date')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-widest text-secondary">
                FEES <span className="normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.fees}
                  onChange={(e) => setForm((f) => ({ ...f, fees: e.target.value }))}
                  placeholder="0.00"
                  className={`${inputCls('fees')} pl-6`}
                />
              </div>
            </div>
          </div>

          {/* Summary row */}
          <div className="flex items-center justify-between rounded-[8px] bg-bg px-4 py-3">
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-secondary">
                ESTIMATED TOTAL
              </div>
              <div className="mt-0.5 font-mono text-lg font-bold text-gain">
                {formatCurrency(estimatedTotal)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold tracking-widest text-secondary">
                ASSET TYPE
              </div>
              <div className="mt-0.5 text-xs font-semibold text-primary">
                {assetDetected || form.ticker
                  ? form.assetType.toUpperCase()
                  : 'NOT DETECTED'}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-[8px] bg-accent py-3 text-sm font-bold tracking-widest text-white hover:bg-accent/90 transition-colors"
          >
            SUBMIT TRANSACTION
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] italic text-secondary">
              Syncing with real-time market data...
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gain">
              <span
                className="h-1.5 w-1.5 rounded-full bg-gain"
                style={{ boxShadow: '0 0 5px #00D897' }}
              />
              LIVE
            </span>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
