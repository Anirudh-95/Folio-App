import { formatCurrency, formatChartDate } from '../../utils/formatters';

interface PerfTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

export function PerfTooltip({ active, payload, label }: PerfTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;

  return (
    <div className="rounded-[8px] border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="text-secondary mb-1">{label ? formatChartDate(label) : ''}</div>
      <div className="font-mono font-semibold text-primary">{formatCurrency(value)}</div>
    </div>
  );
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload?: { ticker?: string; pct?: number } }>;
}

export function DonutTooltip({ active, payload }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: extra } = payload[0];

  return (
    <div className="rounded-[8px] border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-primary mb-1">{extra?.ticker ?? name}</div>
      <div className="font-mono text-secondary">{formatCurrency(value)}</div>
      {extra?.pct !== undefined && (
        <div className="font-mono text-secondary">{extra.pct.toFixed(1)}%</div>
      )}
    </div>
  );
}
