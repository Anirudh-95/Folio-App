import { formatPercent } from '../../utils/formatters';

interface BadgeProps {
  value: number;
  showSign?: boolean;
  className?: string;
}

export function Badge({ value, showSign = true, className = '' }: BadgeProps) {
  const isGain = value >= 0;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium ${
        isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
      } ${className}`}
    >
      {formatPercent(value, showSign)}
    </span>
  );
}
