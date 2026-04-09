import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercent, gainColor } from '../utils/formatters';

type Tab = 'whatif' | 'target';

// ── What If ───────────────────────────────────────────────────────────────────

function WhatIfSimulator() {
  const { state } = usePortfolio();
  const { holdings, cash } = state;

  const [targetPrices, setTargetPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(holdings.map((h) => [h.ticker, h.current_price.toString()]))
  );

  const metrics = useMemo(() => {
    let currentTotal = cash;
    let simulatedTotal = cash;

    const rows = holdings.map((h) => {
      const currentValue = h.quantity * h.current_price;
      const targetPrice = parseFloat(targetPrices[h.ticker] ?? h.current_price.toString()) || h.current_price;
      const simulatedValue = h.quantity * targetPrice;
      const delta = simulatedValue - currentValue;
      const deltaPct = currentValue > 0 ? (delta / currentValue) * 100 : 0;
      currentTotal += currentValue;
      simulatedTotal += simulatedValue;
      return { ...h, currentValue, targetPrice, simulatedValue, delta, deltaPct };
    });

    const totalDelta = simulatedTotal - currentTotal;
    const totalDeltaPct = currentTotal > 0 ? (totalDelta / currentTotal) * 100 : 0;
    return { rows, currentTotal, simulatedTotal, totalDelta, totalDeltaPct };
  }, [holdings, targetPrices, cash]);

  function setPrice(ticker: string, val: string) {
    setTargetPrices((p) => ({ ...p, [ticker]: val }));
  }

  function adjust(ticker: string, pct: number) {
    const current = parseFloat(targetPrices[ticker] ?? '0') || 0;
    setPrice(ticker, (current * (1 + pct / 100)).toFixed(4));
  }

  function resetAll() {
    setTargetPrices(Object.fromEntries(holdings.map((h) => [h.ticker, h.current_price.toString()])));
  }

  const hasDelta = metrics.totalDelta !== 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Current Portfolio', value: formatCurrency(metrics.currentTotal), sub: null },
          { label: 'Simulated Portfolio', value: formatCurrency(metrics.simulatedTotal), sub: null },
          {
            label: 'Simulated P&L',
            value: formatCurrency(metrics.totalDelta),
            sub: formatPercent(metrics.totalDeltaPct, true),
            gain: metrics.totalDelta,
          },
          {
            label: 'Required Return',
            value: formatPercent(metrics.totalDeltaPct, true),
            sub: hasDelta ? (metrics.totalDelta > 0 ? 'to hit target' : 'drawdown') : 'no change',
            gain: metrics.totalDelta,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[8px] border border-border bg-card p-4">
            <div className="text-[10px] font-semibold tracking-widest text-secondary mb-1.5">{card.label}</div>
            <div
              className="text-xl font-bold font-mono"
              style={card.gain !== undefined ? { color: gainColor(card.gain) } : { color: 'rgb(var(--color-primary))' }}
            >
              {card.value}
            </div>
            {card.sub && (
              <div className="text-xs font-mono mt-0.5" style={card.gain !== undefined ? { color: gainColor(card.gain) } : {}}>
                {card.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-primary">Adjust Target Prices</span>
          <button onClick={resetAll} className="text-xs text-accent hover:underline">Reset all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['TICKER', 'CURRENT PRICE', 'TARGET PRICE', 'QUICK ADJUST', 'CURRENT VALUE', 'SIMULATED VALUE', 'DELTA'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-secondary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.rows.map((row) => (
                <tr key={row.ticker} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  {/* Ticker */}
                  <td className="px-4 h-14">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.asset_type === 'crypto' ? '#FFB347' : 'rgb(var(--color-accent))' }} />
                      <span className="font-semibold text-sm text-primary">{row.ticker}</span>
                    </div>
                  </td>
                  {/* Current price */}
                  <td className="px-4 h-14 font-mono text-sm text-primary">{formatCurrency(row.current_price)}</td>
                  {/* Target price input */}
                  <td className="px-4 h-14">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-secondary">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={targetPrices[row.ticker] ?? ''}
                        onChange={(e) => setPrice(row.ticker, e.target.value)}
                        className="w-28 rounded-[6px] border border-border bg-bg pl-5 pr-2 py-1.5 text-xs font-mono text-primary focus:outline-none focus:border-accent/60 transition-colors"
                      />
                    </div>
                  </td>
                  {/* Quick adjust */}
                  <td className="px-4 h-14">
                    <div className="flex gap-1 flex-wrap">
                      {[10, 25, 50].map((pct) => (
                        <button key={`+${pct}`} onClick={() => adjust(row.ticker, pct)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gain/10 text-gain hover:bg-gain/20 transition-colors">
                          +{pct}%
                        </button>
                      ))}
                      {[10, 25].map((pct) => (
                        <button key={`-${pct}`} onClick={() => adjust(row.ticker, -pct)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-loss/10 text-loss hover:bg-loss/20 transition-colors">
                          -{pct}%
                        </button>
                      ))}
                    </div>
                  </td>
                  {/* Current value */}
                  <td className="px-4 h-14 font-mono text-sm text-primary">{formatCurrency(row.currentValue)}</td>
                  {/* Simulated value */}
                  <td className="px-4 h-14 font-mono text-sm text-primary">{formatCurrency(row.simulatedValue)}</td>
                  {/* Delta */}
                  <td className="px-4 h-14">
                    <div className="font-mono text-sm" style={{ color: gainColor(row.delta) }}>
                      {row.delta >= 0 ? '+' : ''}{formatCurrency(row.delta)}
                    </div>
                    <div className="font-mono text-xs" style={{ color: gainColor(row.delta) }}>
                      {formatPercent(row.deltaPct, true)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Reach Target ──────────────────────────────────────────────────────────────

function ReachTargetCalculator() {
  const { state } = usePortfolio();
  const { holdings, cash } = state;

  const [targetValue, setTargetValue] = useState('');
  const [focusTicker, setFocusTicker] = useState<string>('ALL');

  const currentTotal = useMemo(
    () => holdings.reduce((s, h) => s + h.quantity * h.current_price, 0) + cash,
    [holdings, cash]
  );

  const target = parseFloat(targetValue) || 0;
  const needed = target - currentTotal;
  const neededPct = currentTotal > 0 ? (needed / currentTotal) * 100 : 0;

  const projections = useMemo(() => {
    if (target <= currentTotal || !target) return [];

    return holdings.map((h) => {
      const currentValue = h.quantity * h.current_price;
      const weight = currentTotal > 0 ? currentValue / currentTotal : 0;

      if (focusTicker === 'ALL') {
        // Distribute gain proportionally by weight
        const requiredPrice = h.current_price * (1 + neededPct / 100);
        const requiredGain = (requiredPrice - h.current_price) / h.current_price * 100;
        return { ticker: h.ticker, asset_type: h.asset_type, currentPrice: h.current_price, requiredPrice, requiredGain, weight };
      } else if (focusTicker === h.ticker) {
        // This single stock carries all the required gain
        const requiredGainDollars = needed;
        const requiredPrice = h.current_price + requiredGainDollars / h.quantity;
        const requiredGain = (requiredPrice - h.current_price) / h.current_price * 100;
        return { ticker: h.ticker, asset_type: h.asset_type, currentPrice: h.current_price, requiredPrice, requiredGain, weight };
      }
      return { ticker: h.ticker, asset_type: h.asset_type, currentPrice: h.current_price, requiredPrice: h.current_price, requiredGain: 0, weight };
    });
  }, [holdings, target, currentTotal, neededPct, needed, focusTicker]);

  const isAchievable = target > 0 && target > currentTotal;
  const isAlreadyThere = target > 0 && target <= currentTotal;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Input */}
      <div className="rounded-[8px] border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-primary mb-4">What portfolio value do you want to reach?</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full rounded-[8px] border border-border bg-bg pl-7 pr-4 py-3 text-sm font-mono text-primary focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>
          <div className="text-sm text-secondary">
            Currently at <span className="font-mono font-semibold text-primary">{formatCurrency(currentTotal)}</span>
          </div>
        </div>

        {isAlreadyThere && (
          <p className="mt-3 text-sm text-gain font-medium">
            You've already reached this target! Your portfolio is worth {formatCurrency(currentTotal)}.
          </p>
        )}
      </div>

      {isAchievable && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[8px] border border-border bg-card p-4">
              <div className="text-[10px] font-semibold tracking-widest text-secondary mb-1">NEEDED GAIN</div>
              <div className="text-xl font-bold font-mono" style={{ color: gainColor(1) }}>+{formatCurrency(needed)}</div>
            </div>
            <div className="rounded-[8px] border border-border bg-card p-4">
              <div className="text-[10px] font-semibold tracking-widest text-secondary mb-1">REQUIRED RETURN</div>
              <div className="text-xl font-bold font-mono" style={{ color: gainColor(1) }}>+{formatPercent(neededPct)}</div>
            </div>
            <div className="rounded-[8px] border border-border bg-card p-4">
              <div className="text-[10px] font-semibold tracking-widest text-secondary mb-1">SCENARIO</div>
              <select
                value={focusTicker}
                onChange={(e) => setFocusTicker(e.target.value)}
                className="w-full rounded-[6px] border border-border bg-bg px-2 py-1.5 text-xs font-mono text-primary focus:outline-none focus:border-accent/60 mt-1"
              >
                <option value="ALL">All holdings proportionally</option>
                {holdings.map((h) => (
                  <option key={h.ticker} value={h.ticker}>{h.ticker} carries all the gain</option>
                ))}
              </select>
            </div>
          </div>

          {/* Projections table */}
          <div className="rounded-[8px] border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-secondary">
                {focusTicker === 'ALL'
                  ? 'Gain distributed proportionally across all holdings'
                  : `All required gain concentrated in ${focusTicker}`}
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['TICKER', 'CURRENT PRICE', 'REQUIRED PRICE', 'REQUIRED GAIN', 'WEIGHT'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projections.map((row) => (
                  <tr key={row.ticker} className={`border-b border-border/50 transition-colors ${
                    focusTicker === row.ticker || focusTicker === 'ALL' ? 'hover:bg-border/20' : 'opacity-40'
                  }`}>
                    <td className="px-4 h-12">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: row.asset_type === 'crypto' ? '#FFB347' : 'rgb(var(--color-accent))' }} />
                        <span className="font-semibold text-sm text-primary">{row.ticker}</span>
                      </div>
                    </td>
                    <td className="px-4 h-12 font-mono text-sm text-primary">{formatCurrency(row.currentPrice)}</td>
                    <td className="px-4 h-12 font-mono text-sm font-semibold" style={{ color: gainColor(1) }}>
                      {formatCurrency(row.requiredPrice)}
                    </td>
                    <td className="px-4 h-12 font-mono text-sm" style={{ color: gainColor(row.requiredGain) }}>
                      {formatPercent(row.requiredGain, true)}
                    </td>
                    <td className="px-4 h-12 font-mono text-sm text-secondary">{(row.weight * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SimulatorPage() {
  const [tab, setTab] = useState<Tab>('whatif');

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-primary">Portfolio Simulator</h2>
        <p className="text-xs text-secondary mt-0.5">Model price scenarios and forecast what you need to hit your goals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { id: 'whatif' as Tab, label: 'What If Prices' },
          { id: 'target' as Tab, label: 'Reach a Target' },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'whatif' ? <WhatIfSimulator /> : <ReachTargetCalculator />}
    </div>
  );
}
