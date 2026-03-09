import { useState, useRef, useEffect } from 'react';

interface NavSection {
  id: string;
  label: string;
  short: string;
  icon: string;
}

interface NavGroupData {
  label: string;
  sections: NavSection[];
}

const NAV_GROUPS: NavGroupData[] = [
  {
    label: 'Produkte',
    sections: [
      { id: 'products', label: 'Produkte & Typen', short: 'Prod.', icon: 'P' },
      { id: 'options', label: 'Optionen', short: 'Opt.', icon: 'O' },
      { id: 'showroom', label: 'Showroom', short: 'Show', icon: 'W' },
    ],
  },
  {
    label: 'Konfiguration',
    sections: [
      { id: 'produktwahl', label: 'Produktwahl', short: 'Start', icon: 'T' },
      { id: 'dimensions', label: 'Masse & Grenzen', short: 'Masse', icon: 'M' },
      { id: 'steps', label: 'Wizard-Schritte', short: 'Schritte', icon: 'S' },
      { id: 'pricing', label: 'Preiskalkulation', short: 'Preise', icon: '$' },
      { id: 'fusion', label: 'Fusion 360', short: 'Fusion', icon: 'F' },
    ],
  },
  {
    label: 'System',
    sections: [
      { id: 'importExport', label: 'Import / Export', short: 'I/O', icon: 'E' },
    ],
  },
];

// Flat list for backwards compat
const SECTIONS = NAV_GROUPS.flatMap((g) => g.sections);

interface NavItemProps {
  section: NavSection;
  active: boolean;
  onClick: () => void;
  summary?: string;
}

function NavItem({ section, active, onClick, summary }: NavItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`admin-nav-item group relative w-full text-left transition-all duration-200 cursor-pointer ${
        active ? 'admin-nav-active' : ''
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className={`admin-nav-marker w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
          active
            ? 'bg-brand text-white shadow-[0_2px_8px_rgba(31,59,49,0.25)]'
            : 'bg-[rgba(31,59,49,0.06)] text-muted group-hover:bg-[rgba(31,59,49,0.12)] group-hover:text-text'
        }`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0 admin-nav-text">
          <div className={`text-[11px] font-bold tracking-[0.03em] transition-colors duration-200 ${
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
      {active && <div className="absolute right-0 top-1.5 bottom-1.5 w-[3px] bg-brand rounded-l" />}
    </div>
  );
}

interface NavGroupProps {
  group: NavGroupData;
  activeId: string;
  onSelect: (id: string) => void;
  summaries: Record<string, string>;
  defaultOpen: boolean;
}

function NavGroup({ group, activeId, onSelect, summaries, defaultOpen }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const containsActive = group.sections.some((s) => s.id === activeId);

  // Auto-open when a section within this group becomes active
  useEffect(() => {
    if (containsActive && !open) setOpen(true);
  }, [containsActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="admin-nav-group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-1.5 group cursor-pointer bg-transparent border-none"
      >
        <span className={`text-[9px] font-bold tracking-[0.12em] uppercase transition-colors duration-150 ${
          containsActive ? 'text-brand' : 'text-muted group-hover:text-text'
        }`}>
          {group.label}
        </span>
        <svg
          className={`w-3 h-3 text-muted transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      <div className={`admin-nav-group-items overflow-hidden transition-all duration-200 ${
        open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {group.sections.map((s) => (
          <NavItem
            key={s.id}
            section={s}
            active={activeId === s.id}
            onClick={() => onSelect(s.id)}
            summary={summaries[s.id]}
          />
        ))}
      </div>
    </div>
  );
}

interface MobileTabBarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

function MobileTabBar({ activeId, onSelect }: MobileTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeId]);

  // Find which group the active section belongs to
  const activeGroup = NAV_GROUPS.find((g) => g.sections.some((s) => s.id === activeId));

  return (
    <div className="admin-mobile-tabs sticky top-[52px] z-[9] bg-[var(--wz-bg,#f3f1ea)] border-b border-border">
      {/* Group pills row */}
      <div className="flex gap-1 px-3 pt-2 pb-1 scrollbar-none overflow-x-auto">
        {NAV_GROUPS.map((g) => {
          const isActiveGroup = g === activeGroup;
          return (
            <button
              key={g.label}
              onClick={() => onSelect(g.sections[0]!.id)}
              className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-bold tracking-[0.06em] uppercase border transition-all duration-200 whitespace-nowrap font-body ${
                isActiveGroup
                  ? 'bg-brand text-white border-brand'
                  : 'bg-transparent text-muted border-transparent hover:text-brand'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      {/* Section pills for active group */}
      {activeGroup && activeGroup.sections.length > 1 && (
        <div ref={scrollRef} className="flex overflow-x-auto gap-1 px-3 py-1.5 scrollbar-none">
          {activeGroup.sections.map((s) => (
            <button
              key={s.id}
              ref={activeId === s.id ? activeRef : null}
              onClick={() => onSelect(s.id)}
              className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-bold tracking-[0.03em] border transition-all duration-200 whitespace-nowrap font-body ${
                activeId === s.id
                  ? 'bg-field text-brand border-brand shadow-[0_1px_4px_rgba(31,59,49,0.12)]'
                  : 'bg-transparent text-muted border-border hover:border-brand hover:text-brand'
              }`}
            >
              {s.short}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminLayoutProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  summaries: Record<string, string>;
  children: React.ReactNode;
}

export default function AdminLayout({ activeSection, onSectionChange, summaries, children }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <div className="py-2">
          <nav className="flex flex-col gap-1.5">
            {NAV_GROUPS.map((g, i) => (
              <NavGroup
                key={g.label}
                group={g}
                activeId={activeSection}
                onSelect={onSectionChange}
                summaries={summaries}
                defaultOpen={i < 3}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <MobileTabBar
        activeId={activeSection}
        onSelect={onSectionChange}
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
