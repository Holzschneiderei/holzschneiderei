export default function CollapsibleSection({ id, title, summary, icon, open, onToggle, children }) {
  const contentId = `${id}-content`;
  return (
    <div className="p-4 bg-[rgba(31,59,49,0.03)] border-[1.5px] border-border rounded mb-2.5">
      <button
        aria-expanded={open}
        aria-controls={contentId}
        className="flex items-center justify-between w-full bg-none border-none p-0 cursor-pointer font-body text-left gap-3 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 rounded-sm"
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xl leading-none" aria-hidden="true">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-text">{title}</div>
            {!open && summary && <div className="text-[11px] text-muted mt-0.5">{summary}</div>}
          </div>
        </div>
        <span className={`text-sm text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">{"\u25BE"}</span>
      </button>
      <div id={contentId} className="pt-3" hidden={!open}>{children}</div>
    </div>
  );
}
