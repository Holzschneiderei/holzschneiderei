import { schriftarten, berge, t } from '../../data/constants';
import SelectionCard from '../ui/SelectionCard';

export default function AdminTypeDefaults({ form, set, constr, limits, enabledSchriftarten, toggleSchriftart, enabledBerge, toggleBerg, bergDisplay }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text">Standard-Typ</label>
        <div className="flex gap-2">
          {["schriftzug", "bergmotiv"].map((typ) => (
            <button key={typ} onClick={() => set("typ", typ)}
              className={`flex-1 border-[1.5px] rounded py-2 cursor-pointer font-body transition-all duration-200 ${
                form.typ === typ ? 'border-brand bg-brand-medium text-brand font-bold' : 'border-border bg-field text-muted font-normal'
              }`}>
              {typ === "schriftzug" ? "\u270F\uFE0F Schriftzug" : "\u26F0\uFE0F Bergmotiv"}
            </button>
          ))}
        </div>
      </div>

      {form.typ === "schriftzug" && (
        <div className="mt-6 p-4 bg-field border border-border rounded">
          <label className="block text-sm font-semibold mb-1.5 text-text">Standard-Schriftzug</label>
          <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller \u2026" value={form.schriftzug}
            onChange={(e) => set("schriftzug", e.target.value)}
            className={`w-full h-[50px] px-3.5 text-base font-body text-text bg-field border rounded-sm text-center tracking-[0.06em] font-semibold ${limits.textTooLong ? 'border-error' : 'border-border'}`} />
          <div className={`text-[11px] mt-1.5 text-center ${limits.textTooLong ? 'text-error' : 'text-muted'}`}>
            {limits.textTooLong
              ? `Zu lang für ${constr.MAX_W} cm Breite \u2013 max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)`
              : `${limits.letters} / ${limits.maxLetters} Buchstaben \u00B7 Breite min. ${limits.minW} cm`}
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-1.5 text-text">Standard-Schriftart</label>
            <div className="text-[11px] text-muted mb-2">{Object.values(enabledSchriftarten).filter(Boolean).length} von {schriftarten.length} für Kunden sichtbar</div>
            <div className="flex flex-col gap-1.5">
              {schriftarten.map((f) => {
                const on = form.schriftart === f.value;
                const enabled = enabledSchriftarten[f.value];
                const isLastEnabled = Object.values(enabledSchriftarten).filter(Boolean).length === 1 && enabled;
                return (
                  <div key={f.value} className={`relative transition-opacity duration-200 ${enabled ? '' : 'opacity-40'}`}>
                    <SelectionCard selected={on} onClick={() => set("schriftart", f.value)}
                      shade="light" badgeClassName="top-1/2 right-3 -translate-y-1/2"
                      className="flex items-center justify-center w-full px-4 pr-9 py-3.5 text-center">
                      <span className="text-2xl leading-[1.1] tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                        style={{ fontFamily: f.family, fontWeight: f.weight, color: on ? 'var(--color-brand)' : 'var(--color-text)' }}>
                        {form.schriftzug || "Beispiel"}
                      </span>
                    </SelectionCard>
                    <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleSchriftart(f.value); }}
                      title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
                      className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-sm p-0 font-body ${
                        enabled ? 'border-brand bg-brand-medium' : 'border-border bg-[rgba(200,197,187,0.15)]'
                      } ${isLastEnabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      {enabled ? "\uD83D\uDC41" : "\uD83D\uDEAB"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {form.schriftzug && form.schriftart && (() => {
            const font = schriftarten.find((f) => f.value === form.schriftart);
            return (
              <div className="mt-5">
                <div className="text-[10px] font-bold text-muted tracking-widest uppercase text-center mb-2">Live-Vorschau</div>
                <div className="flex justify-center">
                  <svg viewBox="0 0 320 160" className="w-full max-w-[380px] h-auto">
                    <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                    {[45, 95, 145, 195, 245, 275].map((x, i) => (
                      <g key={i}><line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" /><circle cx={x} cy="120" r="2.5" fill={t.border} /></g>
                    ))}
                    <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                    <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={font.family} fontWeight={font.weight} fill="none" stroke={t.brand} strokeWidth="1.2" letterSpacing=".06em" opacity="0.85">{form.schriftzug.toUpperCase()}</text>
                    <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={font.family} fontWeight={font.weight} fill={t.brand} opacity="0.08" letterSpacing=".06em">{form.schriftzug.toUpperCase()}</text>
                    <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" /><line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" /><line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
                  </svg>
                </div>
                <div className="text-center mt-1.5 text-[11px] text-muted">Schrift: {font.label} \u00B7 Die Kontur wird aus Holz gefräst</div>
              </div>
            );
          })()}
        </div>
      )}

      {form.typ === "bergmotiv" && (
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-text">Standard-Berg</label>
          <div className="text-[11px] text-muted mb-2">{Object.values(enabledBerge).filter(Boolean).length} von {berge.length} für Kunden sichtbar</div>
          <div className="grid grid-cols-2 gap-2.5 cq-berg-3 cq-berg-4">
            {berge.map((b) => {
              const on = form.berg === b.value;
              const enabled = enabledBerge[b.value];
              const isLastEnabled = Object.values(enabledBerge).filter(Boolean).length === 1 && enabled;
              const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
              return (
                <div key={b.value} className={`relative transition-opacity duration-200 ${enabled ? '' : 'opacity-40'}`}>
                  <SelectionCard selected={on} onClick={() => set("berg", b.value)}
                    shade="light" className="flex flex-col items-center gap-1 py-3 px-2 text-center w-full">
                    <svg viewBox="0 0 100 70" className="w-full h-11" preserveAspectRatio="none">
                      <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {bergDisplay.showName && <span className={`text-xs font-bold ${on ? 'text-brand' : 'text-text'}`} style={{ fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
                    {(bergDisplay.showHeight || bergDisplay.showRegion) && <span className="text-[10px] text-muted">{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" \u00B7 ")}</span>}
                  </SelectionCard>
                  <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleBerg(b.value); }}
                    title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
                    className={`absolute top-1 right-1 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-xs p-0 font-body z-[2] ${
                      enabled ? 'border-brand bg-brand-medium' : 'border-border bg-[rgba(200,197,187,0.15)]'
                    } ${isLastEnabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    {enabled ? "\uD83D\uDC41" : "\uD83D\uDEAB"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
