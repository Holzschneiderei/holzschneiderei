import type React from 'react';
import { useState } from 'react';
import { OPTIONAL_STEPS, FIXED_STEP_IDS } from '../../data/constants';
import type { ToggleMap } from '../../types/config';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface StepPipelineProps {
  stepOrder: string[];
  setStepOrder: Setter<string[]>;
  enabledSteps: ToggleMap;
  toggleStep: (id: string) => void;
}

export default function StepPipeline({ stepOrder, setStepOrder, enabledSteps, toggleStep }: StepPipelineProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const visibleSteps = stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id));

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => { e.preventDefault(); setOverIdx(idx); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    setStepOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1) as [string];
      next.splice(dropIdx, 0, moved);
      return next;
    });
    setDragIdx(null); setOverIdx(null);
  };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  const moveStep = (idx: number, dir: number) => {
    const target = idx + dir;
    if (target < 0 || target >= visibleSteps.length) return;
    if (FIXED_STEP_IDS.includes(visibleSteps[target]!)) return;
    setStepOrder((prev) => {
      const fromId = visibleSteps[idx]!;
      const fromPrev = prev.indexOf(fromId);
      const toId = visibleSteps[target]!;
      const toPrev = prev.indexOf(toId);
      const next = [...prev];
      [next[fromPrev], next[toPrev]] = [next[toPrev]!, next[fromPrev]!];
      return next;
    });
  };

  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">Schritte anordnen</div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {visibleSteps.map((id, i) => {
          const o = OPTIONAL_STEPS.find((x) => x.id === id);
          const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
          const ic = o?.icon || (id === "kontakt" ? "\u{1F4CB}" : "\u2713");
          const isFixed = FIXED_STEP_IDS.includes(id);
          const isOptional = !isFixed && o && !o.required;
          const canMoveUp = !isFixed && i > 0 && !FIXED_STEP_IDS.includes(visibleSteps[i - 1]!);
          const canMoveDown = !isFixed && i < visibleSteps.length - 1 && !FIXED_STEP_IDS.includes(visibleSteps[i + 1]!);
          return (
            <div key={id} className="flex items-center">
              <div
                draggable={!isFixed}
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={(e) => onDrop(e, i)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-1 px-2 py-1 bg-brand-light rounded-sm relative ${isFixed ? 'cursor-default' : 'cursor-grab'}`}
                style={{
                  opacity: dragIdx === i ? 0.4 : 1,
                  outline: overIdx === i ? "2px solid var(--color-brand)" : "none",
                  outlineOffset: 2,
                  paddingRight: isOptional ? 28 : undefined,
                }}
              >
                {!isFixed && (
                  <div className="flex flex-col gap-0 mr-0.5">
                    <button onClick={(e) => { e.stopPropagation(); if (canMoveUp) moveStep(i, -1); }} disabled={!canMoveUp}
                      className="text-[8px] text-muted hover:text-brand disabled:opacity-30 cursor-pointer bg-transparent border-none p-0 font-body leading-none">{"\u25B2"}</button>
                    <button onClick={(e) => { e.stopPropagation(); if (canMoveDown) moveStep(i, 1); }} disabled={!canMoveDown}
                      className="text-[8px] text-muted hover:text-brand disabled:opacity-30 cursor-pointer bg-transparent border-none p-0 font-body leading-none">{"\u25BC"}</button>
                  </div>
                )}
                <span className="text-[13px]">{ic}</span>
                <span className="text-[10px] font-semibold">{lb}</span>
                {isOptional && (
                  <button onClick={(e) => { e.stopPropagation(); toggleStep(id); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[11px] text-muted font-body p-0 px-0.5">
                    {"\u00D7"}
                  </button>
                )}
              </div>
              {i < visibleSteps.length - 1 && <span className="text-border mx-1 text-[13px]">{"\u203A"}</span>}
            </div>
          );
        })}
      </div>
      {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-[10px] text-muted self-center">Deaktiviert:</span>
          {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).map((s) => (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-sm opacity-50 cursor-pointer border border-dashed border-border bg-transparent">
              <span className="text-[11px]">{s.icon}</span>
              <span className="text-[10px]">+ {s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
