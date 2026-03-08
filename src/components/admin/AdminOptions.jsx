import { useState, useRef, useEffect, useCallback } from 'react';

const EYE_OPEN = (
  <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EYE_CLOSED = (
  <svg className="w-3.5 h-3.5 text-muted opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
    <line x1="2" y1="14" x2="14" y2="2" />
  </svg>
);

function PanelContent({ open, children }) {
  const ref = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (open && ref.current) {
      setMaxHeight(ref.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
  }, [open]);

  // Re-measure when children change while open
  useEffect(() => {
    if (open && ref.current) {
      setMaxHeight(ref.current.scrollHeight);
    }
  }, [open, children]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <div className="px-4 py-3 border-t border-border">
        {children}
      </div>
    </div>
  );
}

function Panel({ panel, open, onToggle, categoryVisibility, onToggleCategory }) {
  const { id, icon, label, summary, categoryKey, content } = panel;
  const isVisible = categoryKey ? categoryVisibility?.[categoryKey] !== false : true;

  return (
    <div className={`border border-border rounded-lg transition-shadow duration-200 ${
      open ? 'shadow-[0_2px_8px_rgba(31,59,49,0.08)]' : ''
    }`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className="flex items-center gap-3 px-4 py-2.5 bg-field hover:bg-[rgba(31,59,49,0.06)] rounded-lg cursor-pointer transition-colors duration-200 select-none"
      >
        {/* Icon circle */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
          open
            ? 'bg-brand text-white shadow-[0_2px_8px_rgba(31,59,49,0.25)]'
            : 'bg-[rgba(31,59,49,0.06)] text-muted'
        }`}>
          {icon}
        </div>

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold tracking-[0.03em] transition-colors duration-200 ${
            open ? 'text-brand' : 'text-text'
          }`}>
            {label}
          </div>
          {!open && summary && (
            <div className="text-[10px] text-muted leading-tight mt-0.5 truncate">
              {summary}
            </div>
          )}
        </div>

        {/* Category eye toggle */}
        {categoryKey && onToggleCategory && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCategory(categoryKey); }}
            title={isVisible ? 'Für Kunden sichtbar' : 'Für Kunden ausgeblendet'}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded cursor-pointer bg-transparent border-none p-0 transition-all duration-200 hover:bg-[rgba(31,59,49,0.08)]"
          >
            {isVisible ? EYE_OPEN : EYE_CLOSED}
          </button>
        )}

        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </div>

      <PanelContent open={open}>
        {content}
      </PanelContent>
    </div>
  );
}

export default function AdminOptions({ panels, categoryVisibility, onToggleCategory, onPanelChange }) {
  const [openId, setOpenId] = useState(null);

  const handleToggle = useCallback((id) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id;
      onPanelChange?.(next);
      return next;
    });
  }, [onPanelChange]);

  return (
    <div className="flex flex-col gap-2">
      {panels.map((panel) => (
        <Panel
          key={panel.id}
          panel={panel}
          open={openId === panel.id}
          onToggle={() => handleToggle(panel.id)}
          categoryVisibility={categoryVisibility}
          onToggleCategory={onToggleCategory}
        />
      ))}
    </div>
  );
}
