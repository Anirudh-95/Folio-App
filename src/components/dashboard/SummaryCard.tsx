interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

export function SummaryCard({ label, value, sub }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[8px] border border-border bg-card p-4 min-w-0">
      <span className="text-[10px] font-semibold tracking-widest text-secondary uppercase truncate">
        {label}
      </span>
      <div className="text-xl font-bold font-mono text-primary leading-tight truncate">{value}</div>
      {sub && <div className="text-xs font-mono">{sub}</div>}
    </div>
  );
}
