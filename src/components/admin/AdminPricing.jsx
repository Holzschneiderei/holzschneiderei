import { holzarten, extrasOptions } from '../../data/constants';

export default function AdminPricing({ pricing, setPricing }) {
  const setField = (key, val) => setPricing((p) => ({ ...p, [key]: Math.max(0, parseFloat(val) || 0) }));
  const setWoodCost = (wood, val) => setPricing((p) => ({ ...p, woodCosts: { ...p.woodCosts, [wood]: Math.max(0, parseFloat(val) || 0) } }));
  const setExtraCost = (extra, val) => setPricing((p) => ({ ...p, extrasCosts: { ...p.extrasCosts, [extra]: Math.max(0, parseFloat(val) || 0) } }));

  const inputCls = "w-[60px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm shrink-0";
  const sectionLabel = "text-[10px] font-bold text-muted tracking-widest uppercase mb-2";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className={sectionLabel}>Materialkosten (CHF/m\u00B2)</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 cq-pricing-4">
          {holzarten.map((h) => (
            <div key={h.value} className="flex items-center gap-1.5">
              <span className="text-sm">{h.emoji}</span>
              <span className="text-[11px] text-muted flex-1">{h.label}</span>
              <input type="number" min="0" value={pricing.woodCosts[h.value] || 0} onChange={(e) => setWoodCost(h.value, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={sectionLabel}>Arbeitskosten</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 cq-pricing-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted flex-1">Stundenansatz (CHF)</span>
            <input type="number" min="0" value={pricing.labourRate} onChange={(e) => setField("labourRate", e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted flex-1">Basis-Stunden</span>
            <input type="number" min="0" value={pricing.hoursBase} onChange={(e) => setField("hoursBase", e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted flex-1">Std/m\u00B2 (zusätzlich)</span>
            <input type="number" min="0" step="0.1" value={pricing.hoursPerM2} onChange={(e) => setField("hoursPerM2", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>
      <div>
        <div className={sectionLabel}>Extras-Preise (CHF)</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 cq-pricing-4">
          {extrasOptions.map((ex) => (
            <div key={ex.value} className="flex items-center gap-1.5">
              <span className="text-sm">{ex.icon}</span>
              <span className="text-[11px] text-muted flex-1">{ex.label}</span>
              <input type="number" min="0" value={pricing.extrasCosts[ex.value] || 0} onChange={(e) => setExtraCost(ex.value, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={sectionLabel}>Marge</div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">Faktor:</span>
          <input type="number" min="1" step="0.1" value={pricing.margin} onChange={(e) => setField("margin", e.target.value)}
            className="w-[60px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm" />
          <span className="text-[11px] text-muted">= {Math.round((pricing.margin - 1) * 100)}% Aufschlag</span>
        </div>
      </div>
    </div>
  );
}
