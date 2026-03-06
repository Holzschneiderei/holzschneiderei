import { useState, useRef, useEffect } from 'react';

const SECTIONS = [
  { id: 'products', label: 'Produkte', short: 'Prod.', icon: 'P' },
  { id: 'typeDefaults', label: 'Produkt-Typ', short: 'Typ', icon: 'T' },
  { id: 'bergDisplay', label: 'Bergmotiv', short: 'Berg', icon: 'B' },
  { id: 'constraints', label: 'Produktgrenzen', short: 'Grenzen', icon: 'G' },
  { id: 'wood', label: 'Holzarten', short: 'Holz', icon: 'H' },
  { id: 'oberflaechen', label: 'Oberfl\u00E4chen', short: 'Ofl.', icon: 'O' },
  { id: 'extras', label: 'Extras', short: 'Ext.', icon: 'X' },
  { id: 'hakenMaterialien', label: 'Hakenmaterial', short: 'Hak.', icon: 'K' },
  { id: 'darstellungen', label: 'Darstellungen', short: 'Darst.', icon: 'D' },
  { id: 'dimensions', label: 'Abmessungen', short: 'Masse', icon: 'M' },
  { id: 'steps', label: 'Wizard-Schritte', short: 'Schritte', icon: 'S' },
  { id: 'pricing', label: 'Preiskalkulation', short: 'Preise', icon: '$' },
  { id: 'importExport', label: 'Import / Export', short: 'I/O', icon: 'E' },
];

function NavItem({ section, active, onClick, summary }) {
  return (
    <button
      onClick={onClick}
      className={`admin-nav-item group relative w-full text-left transition-all duration-200 ${
        active ? 'admin-nav-active' : ''
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`admin-nav-marker w-8 h-8 rounded flex items-center justify-center text-sm font-bold tracking-wide shrink-0 transition-all duration-200 ${
          active
            ? 'bg-brand text-white shadow-[0_2px_8px_rgba(31,59,49,0.25)]'
            : 'bg-[rgba(31,59,49,0.06)] text-muted group-hover:bg-[rgba(31,59,49,0.12)] group-hover:text-text'
        }`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0 admin-nav-text">
          <div className={`text-[12px] font-bold tracking-[0.03em] transition-colors duration-200 ${
            active ? 'text-brand' : 'text-text group-hover:text-brand'
          }`}>
            {section.label}
          </div>
          {summary && (
            <div className="text-[10px] text-muted leading-tight mt-0.5 truncate">
              {summary}
            </div>
          )}
        </div>
      </div>
      {active && <div className="absolute right-0 top-2 bottom-2 w-[3px] bg-brand rounded-l" />}
    </button>
  );
}

function MobileTabBar({ sections, activeId, onSelect, summaries }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <div className="admin-mobile-tabs sticky top-[52px] z-[9] bg-[var(--wz-bg,#f3f1ea)] border-b border-border">
      <div ref={scrollRef} className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-none">
        {sections.map((s) => (
          <button
            key={s.id}
            ref={activeId === s.id ? activeRef : null}
            onClick={() => onSelect(s.id)}
            className={`shrink-0 px-3 py-1.5 rounded text-[11px] font-bold tracking-[0.03em] border transition-all duration-200 whitespace-nowrap font-body ${
              activeId === s.id
                ? 'bg-brand text-white border-brand shadow-[0_2px_6px_rgba(31,59,49,0.2)]'
                : 'bg-field text-muted border-border hover:border-brand hover:text-brand'
            }`}
          >
            {s.short}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminLayout({ activeSection, onSectionChange, summaries, children }) {
  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <div className="py-3">
          <div className="px-4 mb-3">
            <div className="text-[9px] font-bold text-muted tracking-[0.12em] uppercase">Einstellungen</div>
          </div>
          <nav className="flex flex-col">
            {SECTIONS.map((s) => (
              <NavItem
                key={s.id}
                section={s}
                active={activeSection === s.id}
                onClick={() => onSectionChange(s.id)}
                summary={summaries[s.id]}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <MobileTabBar
        sections={SECTIONS}
        activeId={activeSection}
        onSelect={onSectionChange}
        summaries={summaries}
      />

      {/* Content */}
      <div className="admin-content">
        <div className="admin-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export { SECTIONS };
