import { berge, schriftarten, t } from '../../data/constants';

export default function AdminBergDisplay({ bergDisplay, setBergDisp }) {
  const sampleBerg = berge[0];
  const labelFont = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text">Darstellungsmodus</label>
        <div className="flex gap-2">
          {[{ value: "relief", label: "Relief (gefüllt)" }, { value: "clean", label: "Clean (Kontur)" }].map((m) => (
            <button key={m.value} onClick={() => setBergDisp("mode", m.value)}
              className={`flex-1 h-11 border-[1.5px] rounded-sm text-[15px] font-body cursor-pointer transition-all duration-200 ${
                bergDisplay.mode === m.value ? 'border-brand bg-brand-medium text-brand font-bold' : 'border-border bg-field text-muted font-normal'
              }`}>{m.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">Vorschau</div>
        <div className="flex gap-3 justify-center">
          {["relief", "clean"].map((mode) => {
            const active = bergDisplay.mode === mode;
            return (
              <div key={mode} onClick={() => setBergDisp("mode", mode)}
                className={`flex-1 max-w-[160px] p-2.5 border-[1.5px] rounded text-center transition-all duration-200 cursor-pointer ${
                  active ? 'border-brand bg-[rgba(31,59,49,0.04)]' : 'border-border bg-field'
                }`}>
                <svg viewBox="0 0 100 70" className="w-full h-[50px]" preserveAspectRatio="none">
                  <path d={sampleBerg.path}
                    fill={mode === "relief" ? (active ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)") : "none"}
                    stroke={active ? t.brand : t.muted} strokeWidth={active ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <div className={`text-[11px] font-bold ${active ? 'text-brand' : 'text-text'}`} style={{ fontFamily: labelFont?.family || "inherit" }}>{sampleBerg.label}</div>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && (
                  <div className="text-[9px] text-muted">{[bergDisplay.showHeight && sampleBerg.hoehe, bergDisplay.showRegion && sampleBerg.region].filter(Boolean).join(" \u00B7 ")}</div>
                )}
                <div className="text-[9px] text-muted mt-1 italic">{mode === "relief" ? "Relief" : "Clean"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text">Sichtbare Labels</label>
        <div className="flex flex-col gap-1.5">
          {[{ key: "showName", label: "Bergname" }, { key: "showHeight", label: "Höhe" }, { key: "showRegion", label: "Region" }].map((item) => {
            const on = bergDisplay[item.key];
            return (
              <button key={item.key} onClick={() => setBergDisp(item.key, !on)}
                className={`flex items-center gap-2.5 py-2 px-3 border-[1.5px] rounded cursor-pointer font-body text-left transition-all duration-200 ${
                  on ? 'border-brand bg-[rgba(31,59,49,0.05)]' : 'border-border bg-field'
                }`}>
                <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                  on ? 'border-brand bg-brand' : 'border-border bg-transparent'
                }`}>
                  {on && <span className="text-white text-[11px] font-bold">{"\u2713"}</span>}
                </div>
                <span className={`text-[13px] font-semibold ${on ? 'text-text' : 'text-muted'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text">Label-Schriftart</label>
        <select value={bergDisplay.labelFont} onChange={(e) => setBergDisp("labelFont", e.target.value)}
          className="w-full h-[46px] px-3.5 pr-9 text-base font-body text-text bg-field border border-border rounded-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%277%27%3E%3Cpath%20d=%27M1%201l5%205%205-5%27%20fill=%27none%27%20stroke=%27%235b615b%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]">
          <option value="">System (Standard)</option>
          {schriftarten.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        {bergDisplay.labelFont && labelFont && (
          <div className="mt-2 px-3 py-2 border border-border rounded bg-field text-center">
            <span className="text-lg text-text" style={{ fontFamily: labelFont.family, fontWeight: labelFont.weight }}>{sampleBerg.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
