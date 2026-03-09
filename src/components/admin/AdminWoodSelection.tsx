import { holzarten } from '../../data/constants';

export default function AdminWoodSelection({ enabledHolzarten, toggleHolz, activeCount }) {
  return (
    <div className="flex flex-col gap-1.5">
      {holzarten.map((h) => {
        const on = enabledHolzarten[h.value];
        const isLast = activeCount === 1 && on;
        return (
          <button key={h.value} onClick={() => !isLast && toggleHolz(h.value)}
            className={`flex items-center gap-2.5 py-2.5 px-3 border-[1.5px] rounded cursor-pointer font-body text-left transition-all duration-200 ${
              on ? 'border-brand bg-[rgba(31,59,49,0.05)]' : 'border-border bg-field'
            } ${isLast ? 'cursor-not-allowed opacity-70' : ''}`}>
            <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 ${
              on ? 'border-brand bg-brand' : 'border-border bg-transparent'
            }`}>
              {on && <span className="text-white text-[11px] font-bold">{"\u2713"}</span>}
            </div>
            <span className="text-lg leading-none">{h.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className={`text-[13px] font-bold ${on ? 'text-text' : 'text-muted'}`}>{h.label}</span>
              <span className="text-[11px] text-muted ml-1.5">{h.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
