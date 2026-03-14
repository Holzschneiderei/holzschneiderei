import ToggleSwitch from './ToggleSwitch';

interface ToggleRowProps {
  label: string;
  on: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
  hint?: string;
}

export default function ToggleRow({ label, on, onChange, size = 'sm', hint }: ToggleRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-text">{label}</span>
        <ToggleSwitch on={on} onChange={onChange} size={size} />
      </div>
      {hint && <div className="text-[10px] text-muted mt-0.5">{hint}</div>}
    </div>
  );
}
