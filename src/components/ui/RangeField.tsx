interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
}

export default function RangeField({ label, value, onChange, min, max, step, format, minLabel, maxLabel }: RangeFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-semibold text-text">{label}</label>
        <span className="text-[11px] text-muted">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-brand cursor-pointer"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
