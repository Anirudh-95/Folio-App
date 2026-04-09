export function formatCurrency(value: number, compact = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number, showSign = false): string {
  const abs = Math.abs(value);
  const str = abs.toFixed(2) + '%';
  if (!showSign) return value < 0 ? `-${str}` : str;
  return value > 0 ? `+${str}` : value < 0 ? `-${str}` : str;
}

export function formatShares(value: number, isCrypto = false): string {
  if (isCrypto) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 });
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

export function gainColor(value: number): string {
  return value >= 0 ? 'rgb(var(--color-gain))' : 'rgb(var(--color-loss))';
}

export function gainBgClass(value: number): string {
  return value >= 0 ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss';
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatChartDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
