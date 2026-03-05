import { OPTIONAL_STEPS, FIXED_STEP_IDS } from '../../data/constants';

export default function SideRail({ steps, stepData, currentIndex, onNavigate, onBack, onSubmit, isFirst, isLast, submitting }) {
  return (
    <nav className="w-[220px] shrink-0 sticky top-[70px] self-start hidden flex-col gap-0 py-6 border-r border-border mr-8 h-fit cq-side-rail-show">
      <div className="text-xs font-bold tracking-widest uppercase text-muted px-4 pb-3 border-b border-border">Schritte</div>
      <div className="flex flex-col gap-0 py-2">
        {steps.map((id, i) => {
          const step = stepData.find((s) => s.id === id);
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const label = step ? step.label : (id === "kontakt" ? "Kontakt" : "\u00DCbersicht");
          const icon = step ? step.icon : (id === "kontakt" ? "\u{1F4C7}" : "\u{1F4CB}");
          return (
            <button key={id} onClick={() => onNavigate(i)}
              className={`flex items-center gap-2.5 px-4 py-2.5 border-none cursor-pointer font-body text-left transition-all duration-200 w-full border-l-[3px] ${
                isCurrent ? 'bg-brand-light border-l-brand' : 'bg-transparent border-l-transparent'
              }`}>
              <span className={`text-base ${isPast ? 'opacity-50' : ''}`}>{icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs tracking-[0.02em] ${
                  isCurrent ? 'font-bold text-brand' : isPast ? 'font-medium text-muted' : 'font-medium text-text'
                }`}>{label}</div>
              </div>
              {isPast && <span className="text-[11px] text-brand">{"\u2713"}</span>}
            </button>
          );
        })}
      </div>
      <div className="px-4 pt-3 border-t border-border flex flex-col gap-2 mt-2">
        <button className="inline-flex items-center justify-center w-full h-9 text-[11px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border" onClick={onBack}>
          {isFirst ? "\u2190 Typ ändern" : "\u2190 Zurück"}
        </button>
        <button
          className={`inline-flex items-center justify-center w-full h-9 text-[11px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-white bg-brand border border-brand ${isLast && submitting ? 'opacity-60' : ''}`}
          onClick={isLast ? onSubmit : () => onNavigate(currentIndex + 1)}
          disabled={isLast && submitting}
        >
          {isLast ? (submitting ? "Wird gesendet\u2026" : "Bestellen") : "Weiter \u2192"}
        </button>
      </div>
    </nav>
  );
}
