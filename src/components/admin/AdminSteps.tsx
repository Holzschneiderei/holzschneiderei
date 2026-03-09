import { FIXED_STEP_IDS, OPTIONAL_STEPS } from '../../data/constants';
import ToggleSwitch from '../ui/ToggleSwitch';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface AdminStepsProps {
  enabledSteps: Record<string, boolean>;
  toggleStep: (id: string) => void;
  stepOrder: string[];
  setStepOrder?: Setter<string[]>;
}

export default function AdminSteps({ enabledSteps, toggleStep, stepOrder, setStepOrder }: AdminStepsProps) {
  const visibleSteps = stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id));

  const moveStep = (id: string, dir: number) => {
    if (!setStepOrder) return;
    setStepOrder((prev) => {
      const idx = prev.indexOf(id);
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx]!, next[target]!] = [next[target]!, next[idx]!];
      return next;
    });
  };

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
              <ToggleSwitch on={!!on} locked={locked} size="md" />
            </button>
          );
        })}
      </div>
      <div className="mt-6 px-4 py-3.5 bg-field border border-border rounded">
        <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2.5 text-center">
          {"Ablauf \u2014 "}{visibleSteps.length}{" Schritte"}
        </div>
        <div className="flex flex-col gap-1">
          {visibleSteps.map((id, i) => {
            const o = OPTIONAL_STEPS.find((x) => x.id === id);
            const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
            const ic = o?.icon || (id === "kontakt" ? "\u{1F4CB}" : "\u2713");
            const isFixed = FIXED_STEP_IDS.includes(id);
            const canMoveUp = !isFixed && i > 0 && !FIXED_STEP_IDS.includes(visibleSteps[i - 1]!);
            const canMoveDown = !isFixed && i < visibleSteps.length - 1 && !FIXED_STEP_IDS.includes(visibleSteps[i + 1]!);
            return (
              <div key={id} className="flex items-center gap-2">
                {!isFixed && setStepOrder ? (
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (canMoveUp) moveStep(id, -1); }}
                      disabled={!canMoveUp}
                      className="w-5 h-4 flex items-center justify-center text-[10px] text-muted hover:text-brand disabled:opacity-30 disabled:cursor-default cursor-pointer bg-transparent border-none p-0 font-body"
                    >{"\u25B2"}</button>
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (canMoveDown) moveStep(id, 1); }}
                      disabled={!canMoveDown}
                      className="w-5 h-4 flex items-center justify-center text-[10px] text-muted hover:text-brand disabled:opacity-30 disabled:cursor-default cursor-pointer bg-transparent border-none p-0 font-body"
                    >{"\u25BC"}</button>
                  </div>
                ) : (
                  <div className="w-5 shrink-0" />
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-light rounded-sm flex-1">
                  <span className="text-[13px]">{ic}</span>
                  <span className="text-[11px] font-semibold">{lb}</span>
                  {isFixed && <span className="text-[9px] text-muted ml-auto">fest</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
