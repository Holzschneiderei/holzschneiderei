import { FLOWS } from '../../data/constants';

export default function FlowPicker({ flow, onChange }) {
  return (
    <div className="flex gap-0.5 bg-field border border-border rounded p-0.5">
      {FLOWS.map((f) => (
        <button
          key={f.id}
          onClick={(e) => { e.stopPropagation(); onChange(f.id); }}
          title={f.title}
          className={`w-7 h-6 flex items-center justify-center border rounded-sm text-xs font-body cursor-pointer font-semibold transition-all duration-200 p-0 leading-none ${
            flow === f.id
              ? 'bg-brand text-white border-brand'
              : 'bg-transparent text-muted border-border'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
