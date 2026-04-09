import type { AssetType } from '../../types';

interface AssetTypePillsProps {
  value: AssetType;
  onChange: (v: AssetType) => void;
}

export function AssetTypePills({ value, onChange }: AssetTypePillsProps) {
  const options: { id: AssetType; label: string }[] = [
    { id: 'stock', label: 'Stock' },
    { id: 'crypto', label: 'Crypto' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-[8px] py-2 text-sm font-semibold transition-colors ${
            value === o.id
              ? o.id === 'stock'
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/40'
              : 'bg-bg border border-border text-secondary hover:text-primary'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
