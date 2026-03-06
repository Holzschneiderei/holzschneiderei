export default function AdminHeader({ mode, onModeChange }) {
  const openCustomerView = () => {
    window.open(`${window.location.pathname}?mode=workflow`, '_blank');
  };

  return (
    <header className="admin-header sticky top-0 z-10 bg-brand border-b border-[rgba(255,255,255,0.08)]">
      <div className="admin-header-inner max-w-[1600px] mx-auto px-4 h-[52px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[rgba(255,255,255,0.12)] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 16V6l6-3 6 3v10" />
              <path d="M4 16h12" />
              <line x1="8" y1="8" x2="8" y2="13" />
              <line x1="12" y1="8" x2="12" y2="13" />
            </svg>
          </div>
          <span className="text-white font-bold tracking-[0.08em] text-[13px] uppercase opacity-90">Holzschneiderei</span>
          <span className="text-[rgba(255,255,255,0.4)] text-[10px] tracking-[0.08em] uppercase font-bold">Admin</span>
        </div>
        <button onClick={openCustomerView}
          className="px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.06em] uppercase cursor-pointer font-body transition-all duration-200 border-none bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.15)]">
          Kunde {"\u2192"}
        </button>
      </div>
    </header>
  );
}
