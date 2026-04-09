import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { usePerformanceHistory } from '../../hooks/usePerformanceHistory';
import { PerfTooltip } from './ChartTooltip';
import { Spinner } from '../shared/Spinner';
import { formatCurrency, formatChartDate } from '../../utils/formatters';

const RANGES = ['1W', '1M', '3M', '6M', '1Y'] as const;
type Range = (typeof RANGES)[number];

export function PerformanceChart() {
  const [range, setRange] = useState<Range>('1M');
  const { history, loading } = usePerformanceHistory(range);

  const peak = history.length
    ? history.reduce((m, s) => (s.value > m.value ? s : m), history[0])
    : null;

  return (
    <div className="rounded-[8px] border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-sm font-semibold text-primary">Performance History</div>
          <div className="text-[10px] font-semibold tracking-widest text-secondary mt-0.5">
            PORTFOLIO VALUE OVER TIME
          </div>
        </div>

        {/* Range toggles */}
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors ${
                range === r
                  ? 'bg-accent/20 text-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Spinner size={24} />
        </div>
      ) : history.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-sm text-secondary">
          No historical data available for this range.
        </div>
      ) : (
        <div className="h-[220px] mt-3">
          {peak && (
            <div className="flex justify-end mb-1">
              <span className="text-[11px] font-mono text-secondary">
                Peak: <span className="text-primary">{formatCurrency(peak.value)}</span>
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fill: '#6B6B7B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v, true)}
                tick={{ fill: '#6B6B7B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<PerfTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4F8CFF"
                strokeWidth={2}
                fill="url(#perfGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#4F8CFF', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
