import { useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SummaryCard } from './SummaryCard';
import { Spinner } from '../shared/Spinner';
import { formatCurrency, formatPercent, gainColor } from '../../utils/formatters';

export function SummaryCards() {
  const { state } = usePortfolio();
  const { holdings, prevPrices, pricesLoading } = state;

  const metrics = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let dayChange = 0;
    let stockValue = 0;
    let cryptoValue = 0;

    for (const h of holdings) {
      const mv = h.quantity * h.current_price;
      const cost = h.quantity * h.avg_cost_basis;
      totalValue += mv;
      totalCost += cost;

      const prev = prevPrices[h.ticker];
      if (prev !== undefined) {
        dayChange += h.quantity * (h.current_price - prev);
      }

      if (h.asset_type === 'stock') stockValue += mv;
      else cryptoValue += mv;
    }

    const unrealizedGain = totalValue - totalCost;
    const unrealizedPct = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;
    const dayChangePct = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;
    const stockPct = totalValue > 0 ? (stockValue / totalValue) * 100 : 0;
    const cryptoPct = totalValue > 0 ? (cryptoValue / totalValue) * 100 : 0;

    return { totalValue, totalCost, unrealizedGain, unrealizedPct, dayChange, dayChangePct, stockPct, cryptoPct };
  }, [holdings, prevPrices]);

  if (pricesLoading && holdings.length === 0) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center h-[90px] rounded-[8px] border border-border bg-card">
            <Spinner size={18} />
          </div>
        ))}
      </div>
    );
  }

  const gainStyle = (v: number) => ({ color: gainColor(v) });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <SummaryCard
        label="Total Value"
        value={formatCurrency(metrics.totalValue)}
      />
      <SummaryCard
        label="Cost Basis"
        value={formatCurrency(metrics.totalCost)}
      />
      <SummaryCard
        label="Unrealized P&L"
        value={
          <span style={gainStyle(metrics.unrealizedGain)}>
            {metrics.unrealizedGain >= 0 ? '+' : ''}
            {formatCurrency(metrics.unrealizedGain)}
          </span>
        }
        sub={
          <span style={gainStyle(metrics.unrealizedGain)}>
            {formatPercent(metrics.unrealizedPct, true)}
          </span>
        }
      />
      <SummaryCard
        label="Day Change"
        value={
          <span style={gainStyle(metrics.dayChange)}>
            {metrics.dayChange >= 0 ? '+' : ''}
            {formatCurrency(metrics.dayChange)}
          </span>
        }
        sub={
          <span style={gainStyle(metrics.dayChange)}>
            {formatPercent(metrics.dayChangePct, true)}
          </span>
        }
      />
      <SummaryCard
        label="Asset Split"
        value={
          <span className="flex items-center gap-1.5 text-base">
            <span className="text-accent font-mono">{Math.round(metrics.stockPct)}%</span>
            <span className="text-secondary font-normal text-xs">STOCKS</span>
            <span className="text-secondary">·</span>
            <span className="text-[#FFB347] font-mono">{Math.round(metrics.cryptoPct)}%</span>
            <span className="text-secondary font-normal text-xs">CRYPTO</span>
          </span>
        }
      />
    </div>
  );
}
