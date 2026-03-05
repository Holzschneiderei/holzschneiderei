import { OPTIONAL_STEPS, FIXED_STEP_IDS } from '../../data/constants';
import ToggleSwitch from '../ui/ToggleSwitch';

export default function AdminSteps({ enabledSteps, toggleStep, stepOrder }) {
  return (
    <div>
      <div className="flex flex-col gap-1.5 mb-3.5">
        {OPTIONAL_STEPS.map((s) => {
          const on = enabledSteps[s.id];
          const locked = s.required;
          return (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              className={`flex items-center justify-between gap-3.5 py-3.5 px-4 border-[1.5px] rounded cursor-pointer font-body text-left transition-all duration-200 w-full ${
                on ? 'border-brand bg-[rgba(31,59,49,0.05)]' : 'border-border bg-field'
              }`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-[22px] leading-none">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-text">{s.label}</span>
                    {locked && <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-brand bg-brand-medium px-1.5 py-0.5 rounded-sm">Pflicht</span>}
                  </div>
                  <span className="text-[11px] text-muted leading-[1.35]">{s.desc}</span>
                  {!on && !locked && <div className="text-xs text-border mt-1 italic leading-[1.3]">Standard: {s.defaultLabel}</div>}
                </div>
              </div>
              <ToggleSwitch on={on} locked={locked} size="md" />
            </button>
          );
        })}
      </div>
      <div className="mt-6 px-4 py-3.5 bg-field border border-border rounded text-center">
        <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2.5">
          Ablauf \u2014 {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).length} Schritte
        </div>
        <div className="flex flex-wrap justify-center items-center gap-1">
          {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).map((id, i, arr) => {
            const o = OPTIONAL_STEPS.find((x) => x.id === id);
            const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
            const ic = o?.icon || (id === "kontakt" ? "\u{1F4CB}" : "\u2713");
            return (
              <div key={id} className="flex items-center">
                <div className="flex items-center gap-1 px-2 py-1 bg-brand-light rounded-sm">
                  <span className="text-[13px]">{ic}</span>
                  <span className="text-[10px] font-semibold">{lb}</span>
                </div>
                {i < arr.length - 1 && <span className="text-border mx-1 text-[13px]">{"\u203A"}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
