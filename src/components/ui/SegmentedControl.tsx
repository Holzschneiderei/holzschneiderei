export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export default function SegmentedControl<T extends string>({
  options, value, onChange, size = 'md',
}: SegmentedControlProps<T>) {
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  return (
    <div className="flex rounded-sm border border-border overflow-hidden bg-field">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-center py-1.5 ${textSize} font-bold font-body border-none cursor-pointer transition-colors ${
            value === opt.value
              ? 'bg-brand text-white'
              : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
