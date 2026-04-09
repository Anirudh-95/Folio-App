import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatCurrency } from '../../utils/formatters';
import { DonutTooltip } from './ChartTooltip';
import { chartPalette } from '../../constants/theme';

type DonutView = 'type' | 'holding';

export function DonutChart() {
  const { state } = usePortfolio();
  const { holdings } = state;

  const [view] = useState<DonutView>('type');

  const totalValue = useMemo(
    () => holdings.reduce((s, h) => s + h.quantity * h.current_price, 0),
    [holdings]
  );

  const slices = useMemo(() => {
    if (view === 'type') {
      let stockVal = 0;
      let cryptoVal = 0;
      for (const h of holdings) {
        const mv = h.quantity * h.current_price;
        if (h.asset_type === 'crypto') cryptoVal += mv;
        else stockVal += mv;
      }
      return [
        { name: 'STOCKS', value: stockVal, ticker: 'STOCKS', pct: totalValue > 0 ? (stockVal / totalValue) * 100 : 0, color: '#4F8CFF' },
        { name: 'CRYPTO', value: cryptoVal, ticker: 'CRYPTO', pct: totalValue > 0 ? (cryptoVal / totalValue) * 100 : 0, color: '#00D897' },
      ].filter((s) => s.value > 0);
    }

    return [...holdings]
      .sort((a, b) => b.quantity * b.current_price - a.quantity * a.current_price)
      .map((h, i) => {
        const mv = h.quantity * h.current_price;
        return {
          name: h.ticker,
          value: mv,
          ticker: h.ticker,
          pct: totalValue > 0 ? (mv / totalValue) * 100 : 0,
          color: chartPalette[i % chartPalette.length],
        };
      });
  }, [holdings, totalValue, view]);

  if (!holdings.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-[8px] border border-border bg-card p-6 text-secondary text-sm">
        No holdings to display
      </div>
    );
  }

  const legendItems = view === 'type'
    ? slices
    : slices.slice(0, 6);

  return (
    <div className="flex flex-col rounded-[8px] border border-border bg-card p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-primary">Asset Allocation</span>
      </div>

      {/* Donut */}
      <div className="relative flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="78%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color ?? chartPalette[i % chartPalette.length]} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold tracking-widest text-secondary">NET WORTH</span>
          <span className="text-lg font-bold font-mono text-primary leading-tight">
            {formatCurrency(totalValue, true)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-3">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-secondary">{item.name}</span>
            </div>
            <span className="text-xs font-mono text-primary">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
