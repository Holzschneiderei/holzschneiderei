import { FLOWS } from '../../data/constants';

export default function FlowPicker({ flow, onChange }) {
  return (
    <div role="group" aria-label="Ansichtsmodus wählen" className="flex gap-0.5 bg-field border border-border rounded p-0.5">
      {FLOWS.map((f) => (
        <button
          key={f.id}
          onClick={(e) => { e.stopPropagation(); onChange(f.id); }}
          title={f.title}
          aria-label={f.title}
          aria-pressed={flow === f.id}
          className={`w-9 h-8 flex items-center justify-center border rounded-sm text-xs font-body cursor-pointer font-semibold transition-all duration-200 p-0 leading-none focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1 ${
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
