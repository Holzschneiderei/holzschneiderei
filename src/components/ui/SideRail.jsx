import { computePrice } from '../../data/pricing';
import { fmtChf } from '../../lib/format';

export default function SideRail({ steps, stepData, currentIndex, onNavigate, onBack, onSubmit, isFirst, isLast, submitting, form, pricing }) {
  return (
    <nav aria-label="Konfigurationsschritte" className="w-[230px] shrink-0 sticky top-[70px] self-start hidden flex-col gap-0 py-6 border-r border-border mr-10 h-fit cq-side-rail-show">
      <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-muted px-5 pb-3 border-b border-border" aria-hidden="true">Schritte</div>
      <div className="flex flex-col gap-0 py-2">
        {steps.map((id, i) => {
          const step = stepData.find((s) => s.id === id);
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const label = step ? step.label : (id === "kontakt" ? "Kontakt" : "\u00DCbersicht");
          const icon = step ? step.icon : (id === "kontakt" ? "\u{1F4C7}" : "\u{1F4CB}");
          return (
            <button key={id} onClick={() => onNavigate(i)}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center gap-3 px-5 py-3 min-h-12 border-none cursor-pointer font-body text-left transition-all duration-200 w-full border-l-[3px] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[-2px] ${
                isCurrent ? 'bg-brand-light border-l-brand' : 'bg-transparent border-l-transparent hover:bg-brand-light/50'
              }`}>
              <span className={`text-base ${isPast ? 'opacity-50' : ''}`} aria-hidden="true">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs tracking-[0.02em] ${
                  isCurrent ? 'font-bold text-brand' : isPast ? 'font-medium text-muted' : 'font-medium text-text'
                }`}>{label}</div>
              </div>
              {isPast && <span className="text-[11px] text-brand font-bold" aria-hidden="true">{"\u2713"}</span>}
            </button>
          );
        })}
      </div>
      {pricing && (() => {
        const price = computePrice(form, pricing);
        const fmt = fmtChf;
        return (
          <div className="px-5 py-4 border-t border-border">
            <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-muted mb-1.5" aria-hidden="true">Richtpreis</div>
            <div className="text-lg font-extrabold text-brand tracking-[0.02em]" aria-label={`ab CHF ${fmt(price.customerPrice)}`}>ab CHF {fmt(price.customerPrice)}.–</div>
          </div>
        );
      })()}
      <div className="px-5 pt-4 border-t border-border flex flex-col gap-2.5 mt-2">
        <button className="wz-btn wz-btn-ghost w-full h-11 text-[11px]" onClick={onBack}>
          {isFirst ? "\u2190 Typ \u00E4ndern" : "\u2190 Zur\u00FCck"}
        </button>
        <button
          className={`wz-btn wz-btn-primary w-full h-11 text-[11px] ${isLast && submitting ? 'opacity-60' : ''}`}
          onClick={isLast ? onSubmit : () => onNavigate(currentIndex + 1)}
          disabled={isLast && submitting}
        >
          {isLast ? (submitting ? "Wird gesendet\u2026" : "Bestellen") : "Weiter \u2192"}
        </button>
      </div>
    </nav>
  );
}
