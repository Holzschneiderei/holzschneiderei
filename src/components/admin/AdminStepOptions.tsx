import { useCallback, useEffect, useRef, useState } from 'react';
import { FIXED_STEP_IDS, OPTIONAL_STEPS } from '../../data/constants';
import type { CategoryVisibility, FormState, Texts } from '../../types/config';

/* ── Step-to-panel mapping ── */
const STEP_PANELS: Record<string, string[]> = {
  motiv: ['schriftarten', 'berge', 'bergDisplay'],
  holzart: ['holzarten'],
  ausfuehrung: ['oberflaechen', 'hakenMaterialien', 'hutablage'],
  extras: ['extras'],
  darstellung: ['darstellungen'],
};

/* ── Fixed step labels/icons ── */
const FIXED_STEP_META: Record<string, { label: string; icon: string }> = {
  kontakt: { label: 'Kontakt', icon: '\u{1F4CB}' },
  uebersicht: { label: 'Absenden', icon: '\u2713' },
};

/* ── SVG icons ── */

const EYE_OPEN = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EYE_CLOSED = (
  <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
    <line x1="2" y1="14" x2="14" y2="2" />
  </svg>
);

const DRAG_HANDLE = (
  <svg className="w-3.5 h-4" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
    <circle cx="4" cy="3" r="1.3" /><circle cx="10" cy="3" r="1.3" />
    <circle cx="4" cy="8" r="1.3" /><circle cx="10" cy="8" r="1.3" />
    <circle cx="4" cy="13" r="1.3" /><circle cx="10" cy="13" r="1.3" />
  </svg>
);

/* ── Panel content area with animated expand/collapse ── */

function PanelContent({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (open && ref.current) {
      // Use rAF to measure after children render
      requestAnimationFrame(() => {
        if (ref.current) setMaxHeight(ref.current.scrollHeight);
      });
    } else {
      setMaxHeight(0);
    }
  }, [open]);

  // Re-measure when children change while open
  useEffect(() => {
    if (!open || !ref.current) return;
    const ro = new ResizeObserver(() => {
      if (ref.current) setMaxHeight(ref.current.scrollHeight);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [open]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: open ? `${maxHeight}px` : '0px' }}
    >
      <div className="border-t border-border">
        {children}
      </div>
    </div>
  );
}

/* ── Category eye toggle (for option panels within a step) ── */

function CategoryToggle({
  categoryKey,
  categoryVisibility,
  onToggleCategory,
}: {
  categoryKey: keyof CategoryVisibility;
  categoryVisibility: CategoryVisibility;
  onToggleCategory: (key: keyof CategoryVisibility) => void;
}) {
  const isVisible = categoryVisibility[categoryKey] !== false;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggleCategory(categoryKey); }}
      title={isVisible ? 'Für Kunden sichtbar' : 'Für Kunden ausgeblendet'}
      className="shrink-0 w-5 h-5 flex items-center justify-center rounded cursor-pointer bg-transparent border-none p-0 transition-all duration-200 hover:bg-[rgba(31,59,49,0.08)] text-muted"
    >
      {isVisible ? EYE_OPEN : EYE_CLOSED}
    </button>
  );
}

/* ── Types ── */

export interface StepDefaultOption {
  field: keyof FormState;
  label: string;
  options: { value: string; label: string }[];
}

export interface OptionPanelDef {
  id: string;
  icon: string;
  label: string;
  summary?: string;
  categoryKey?: keyof CategoryVisibility;
  content: React.ReactNode;
}

interface AdminStepOptionsProps {
  enabledSteps: Record<string, boolean>;
  toggleStep: (id: string) => void;
  stepOrder: string[];
  setStepOrder: React.Dispatch<React.SetStateAction<string[]>>;
  optionPanels: OptionPanelDef[];
  categoryVisibility: CategoryVisibility;
  onToggleCategory: (key: keyof CategoryVisibility) => void;
  onPanelChange?: (id: string | null) => void;
  texts?: Texts;
  setTexts?: React.Dispatch<React.SetStateAction<Texts>>;
  stepDefaults?: Record<string, Partial<FormState>>;
  setStepDefaults?: React.Dispatch<React.SetStateAction<Record<string, Partial<FormState>>>>;
  stepDefaultOptions?: Record<string, StepDefaultOption[]>;
}

/* ── Main component ── */

export default function AdminStepOptions({
  enabledSteps,
  toggleStep,
  stepOrder,
  setStepOrder,
  optionPanels,
  categoryVisibility,
  onToggleCategory,
  onPanelChange,
  texts,
  setTexts,
  stepDefaults,
  setStepDefaults,
  stepDefaultOptions,
}: AdminStepOptionsProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before');
  const listRef = useRef<HTMLDivElement>(null);

  // Build the full step list: ordered optional steps + unordered ones + fixed steps
  // Steps in stepOrder come first (in order), then any OPTIONAL_STEPS not yet in stepOrder
  const orderedOptional = stepOrder.filter((id) => OPTIONAL_STEPS.some((s) => s.id === id));
  const unorderedOptional = OPTIONAL_STEPS
    .filter((s) => !orderedOptional.includes(s.id))
    .map((s) => s.id);
  const allSteps = [...orderedOptional, ...unorderedOptional, ...FIXED_STEP_IDS];

  const getStepMeta = (id: string) => {
    const opt = OPTIONAL_STEPS.find((s) => s.id === id);
    if (opt) return { label: opt.label, icon: opt.icon, desc: opt.desc, required: opt.required, defaultLabel: opt.defaultLabel };
    const fixed = FIXED_STEP_META[id];
    if (fixed) return { label: fixed.label, icon: fixed.icon, desc: '', required: true, defaultLabel: '' };
    return { label: id, icon: '', desc: '', required: false, defaultLabel: '' };
  };

  const getPanelsForStep = (stepId: string): OptionPanelDef[] => {
    const panelIds = STEP_PANELS[stepId] ?? [];
    return panelIds.map((pid) => optionPanels.find((p) => p.id === pid)).filter(Boolean) as OptionPanelDef[];
  };

  const handleExpand = useCallback((stepId: string) => {
    setExpandedStep((prev) => {
      const next = prev === stepId ? null : stepId;
      // Notify parent of active panel for preview
      const panels = STEP_PANELS[next ?? ''] ?? [];
      onPanelChange?.(panels[0] ?? null);
      return next;
    });
  }, [onPanelChange]);

  const handleToggleStep = useCallback((e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    const wasEnabled = enabledSteps[stepId];
    toggleStep(stepId);
    // When enabling a step that's not in stepOrder, add it before fixed steps
    if (!wasEnabled && !stepOrder.includes(stepId)) {
      setStepOrder((prev) => [...prev, stepId]);
    }
  }, [toggleStep, enabledSteps, stepOrder, setStepOrder]);

  /* ── Drag & drop ── */

  const handleDragStart = useCallback((e: React.DragEvent, stepId: string) => {
    if (FIXED_STEP_IDS.includes(stepId)) { e.preventDefault(); return; }
    const opt = OPTIONAL_STEPS.find((s) => s.id === stepId);
    if (opt?.required) { e.preventDefault(); return; }
    setDraggedId(stepId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', stepId);
    // Dim the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      requestAnimationFrame(() => {
        (e.currentTarget as HTMLElement).style.opacity = '0.4';
      });
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
    }
    setDraggedId(null);
    setDropTargetId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stepId: string) => {
    if (!draggedId || FIXED_STEP_IDS.includes(stepId) || stepId === draggedId) {
      setDropTargetId(null);
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Determine if cursor is in top or bottom half of the element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropPosition(e.clientY < midY ? 'before' : 'after');
    setDropTargetId(stepId);
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId || FIXED_STEP_IDS.includes(targetId)) return;

    setStepOrder((prev) => {
      const next = prev.filter((id) => id !== sourceId);
      const targetIdx = next.indexOf(targetId);
      if (targetIdx === -1) return prev;
      const insertIdx = dropPosition === 'after' ? targetIdx + 1 : targetIdx;
      next.splice(insertIdx, 0, sourceId);
      return next;
    });

    setDraggedId(null);
    setDropTargetId(null);
  }, [setStepOrder, dropPosition]);

  // Step count summary
  const activeCount = allSteps.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).length;

  return (
    <div>
      {/* Step count header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold text-muted tracking-[0.1em] uppercase">
          {activeCount} Schritte aktiv
        </div>
        <div className="text-[10px] text-muted">
          Reihenfolge per Drag&Drop ändern
        </div>
      </div>

      {/* Step list */}
      <div ref={listRef} className="flex flex-col gap-1">
        {allSteps.map((stepId) => {
          const meta = getStepMeta(stepId);
          const isFixed = FIXED_STEP_IDS.includes(stepId);
          const isOptional = OPTIONAL_STEPS.some((s) => s.id === stepId);
          const isEnabled = isFixed || enabledSteps[stepId];
          const isExpanded = expandedStep === stepId;
          const panels = getPanelsForStep(stepId);
          const hasPanels = panels.length > 0;
          const isDragging = draggedId === stepId;
          const isDropTarget = dropTargetId === stepId;
          const isRequired = meta.required;
          const canDrag = isOptional && !isRequired;

          return (
            <div
              key={stepId}
              className={`rounded-lg border transition-all duration-200 ${
                isExpanded
                  ? 'border-brand shadow-[0_2px_12px_rgba(31,59,49,0.1)]'
                  : isEnabled
                    ? 'border-border'
                    : 'border-border opacity-60'
              } ${isDragging ? 'opacity-40' : ''} ${
                isDropTarget && dropPosition === 'before' ? 'ring-2 ring-brand ring-offset-1' : ''
              } ${
                isDropTarget && dropPosition === 'after' ? 'ring-2 ring-brand ring-offset-1' : ''
              }`}
              draggable={canDrag}
              onDragStart={(e) => handleDragStart(e, stepId)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, stepId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stepId)}
            >
              {/* Drop indicator line - before */}
              {isDropTarget && dropPosition === 'before' && (
                <div className="h-0.5 bg-brand rounded-full -mt-[3px] mx-2" />
              )}

              {/* Step header row */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => hasPanels && isEnabled ? handleExpand(stepId) : undefined}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && hasPanels && isEnabled) { e.preventDefault(); handleExpand(stepId); } }}
                className={`flex items-center gap-2 px-3 py-2.5 select-none transition-colors duration-150 rounded-lg ${
                  hasPanels && isEnabled ? 'cursor-pointer hover:bg-[rgba(31,59,49,0.03)]' : ''
                } ${!isEnabled ? 'cursor-default' : ''}`}
              >
                {/* Drag handle */}
                <div className={`shrink-0 w-5 flex items-center justify-center ${
                  canDrag ? 'cursor-grab active:cursor-grabbing text-border hover:text-muted' : 'text-transparent'
                }`}>
                  {canDrag ? DRAG_HANDLE : <div className="w-3.5" />}
                </div>

                {/* Step icon */}
                <span className="text-[18px] leading-none shrink-0">{meta.icon}</span>

                {/* Label area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[12px] font-bold tracking-[0.02em] transition-colors duration-200 ${
                      isExpanded ? 'text-brand' : isEnabled ? 'text-text' : 'text-muted'
                    }`}>
                      {meta.label}
                    </span>
                    {isFixed && (
                      <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-muted bg-[rgba(31,59,49,0.06)] px-1.5 py-0.5 rounded-sm">
                        fest
                      </span>
                    )}
                    {isRequired && !isFixed && (
                      <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-brand bg-brand-medium px-1.5 py-0.5 rounded-sm">
                        Pflicht
                      </span>
                    )}
                  </div>
                  {!isExpanded && meta.desc && (
                    <div className="text-[10px] text-muted leading-tight mt-0.5 truncate">
                      {!isEnabled && meta.defaultLabel
                        ? <span className="italic">Standard: {meta.defaultLabel}</span>
                        : meta.desc}
                    </div>
                  )}
                </div>

                {/* Eye toggle for optional, non-required steps */}
                {isOptional && !isRequired && (
                  <button
                    onClick={(e) => handleToggleStep(e, stepId)}
                    title={isEnabled ? 'Schritt aktiv' : 'Schritt deaktiviert'}
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-md cursor-pointer bg-transparent border-none p-0 transition-all duration-200 ${
                      isEnabled
                        ? 'text-brand hover:bg-brand-light'
                        : 'text-muted hover:bg-[rgba(31,59,49,0.06)]'
                    }`}
                  >
                    {isEnabled ? EYE_OPEN : EYE_CLOSED}
                  </button>
                )}

                {/* Expand chevron (only if step has panels and is enabled) */}
                {hasPanels && isEnabled && (
                  <svg
                    className={`w-3.5 h-3.5 text-muted shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 4.5l3 3 3-3" />
                  </svg>
                )}
              </div>

              {/* Default value selectors when step is disabled */}
              {!isEnabled && isOptional && !isRequired && stepDefaultOptions?.[stepId] && setStepDefaults && (
                <div className="px-4 pb-3 -mt-1">
                  <div className="flex flex-wrap gap-2">
                    {stepDefaultOptions[stepId]!.map((opt) => (
                      <div key={opt.field} className="flex items-center gap-1.5">
                        <label className="text-[10px] font-bold text-muted tracking-widest uppercase whitespace-nowrap">{opt.label}</label>
                        <select
                          value={(stepDefaults?.[stepId]?.[opt.field] as string) || ''}
                          onChange={(e) => setStepDefaults(prev => ({
                            ...prev,
                            [stepId]: { ...prev[stepId], [opt.field]: e.target.value || undefined },
                          }))}
                          className="h-6 px-1.5 text-[11px] font-body text-text bg-field border border-border rounded-sm cursor-pointer"
                        >
                          <option value="">Standard</option>
                          {opt.options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded panel content */}
              {(hasPanels || (texts && setTexts)) && isEnabled && (
                <PanelContent open={isExpanded}>
                  {/* Step title/subtitle overrides */}
                  {texts && setTexts && (() => {
                    const stepsSection = texts.steps ?? {};
                    const cur = (stepsSection as Record<string, string | boolean>)[stepId];
                    const curTitle = typeof cur === 'string' ? '' : ((stepsSection as unknown as Record<string, Record<string, string>>)[stepId]?.title ?? '');
                    const curSub = typeof cur === 'string' ? '' : ((stepsSection as unknown as Record<string, Record<string, string>>)[stepId]?.subtitle ?? '');
                    const updateStepText = (field: string, value: string) => {
                      setTexts(prev => {
                        const prevSteps = (prev.steps ?? {}) as unknown as Record<string, Record<string, string>>;
                        const prevStep = prevSteps[stepId] ?? {};
                        return { ...prev, steps: { ...prev.steps, [stepId]: { ...prevStep, [field]: value } as unknown as string } };
                      });
                    };
                    return (
                      <div className="px-4 py-3 border-b border-border">
                        <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-muted mb-2">Schritt-Texte</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Titel</label>
                            <input type="text" placeholder={meta.label} value={curTitle}
                              onChange={(e) => updateStepText('title', e.target.value)}
                              className="w-full h-7 px-2 text-[11px] font-body text-text bg-field border border-border rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Untertitel</label>
                            <input type="text" placeholder={meta.desc} value={curSub}
                              onChange={(e) => updateStepText('subtitle', e.target.value)}
                              className="w-full h-7 px-2 text-[11px] font-body text-text bg-field border border-border rounded-sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {panels.map((panel) => (
                    <div key={panel.id} className="px-4 py-3">
                      {/* Panel sub-header with category toggle */}
                      {panels.length > 1 && (
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 bg-[rgba(31,59,49,0.06)] text-muted`}>
                            {panel.icon}
                          </div>
                          <span className="text-[10px] font-bold tracking-[0.06em] uppercase text-muted flex-1">
                            {panel.label}
                          </span>
                          {panel.categoryKey && (
                            <CategoryToggle
                              categoryKey={panel.categoryKey}
                              categoryVisibility={categoryVisibility}
                              onToggleCategory={onToggleCategory}
                            />
                          )}
                        </div>
                      )}
                      {/* Single panel: just show category toggle inline */}
                      {panels.length === 1 && panel.categoryKey && (
                        <div className="flex items-center justify-end mb-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted">
                            <span>Sichtbar</span>
                            <CategoryToggle
                              categoryKey={panel.categoryKey}
                              categoryVisibility={categoryVisibility}
                              onToggleCategory={onToggleCategory}
                            />
                          </div>
                        </div>
                      )}
                      {panel.content}
                    </div>
                  ))}
                </PanelContent>
              )}

              {/* Drop indicator line - after */}
              {isDropTarget && dropPosition === 'after' && (
                <div className="h-0.5 bg-brand rounded-full -mb-[3px] mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
