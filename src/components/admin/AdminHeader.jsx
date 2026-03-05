export default function AdminHeader({ mode, onModeChange }) {
  const modes = [
    { id: "admin", label: "Admin", icon: "\u2699\uFE0F" },
    { id: "preview", label: "Vorschau", icon: "\uD83D\uDC41" },
    { id: "workflow", label: "Kunde", icon: "\uD83D\uDED2" },
  ];
  return (
    <header className="sticky top-0 z-10 bg-[var(--wz-bg,#f3f1ea)] border-b border-border">
      <div className="max-w-[600px] mx-auto px-5 py-2.5 flex justify-between items-center cq-admin-header-md cq-admin-header-lg cq-admin-header-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-muted opacity-75 shrink-0" />
          <span className="font-bold tracking-[0.06em] text-[13px] uppercase">Holzschneiderei</span>
        </div>
        <div className="flex gap-0.5 bg-field border border-border rounded p-0.5">
          {modes.map((m) => (
            <button key={m.id} onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1 px-2.5 py-1 border rounded-sm cursor-pointer font-body transition-all duration-200 whitespace-nowrap ${
                mode === m.id
                  ? 'bg-brand text-white border-brand'
                  : 'bg-transparent text-muted border-border'
              }`}>
              <span className="text-xs">{m.icon}</span>
              <span className="text-[10px] font-bold tracking-[0.04em]">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
