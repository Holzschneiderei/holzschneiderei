import Fade from "../ui/Fade";
import { useWizard } from "../../context/WizardContext";
import { berge, schriftarten, t } from "../../data/constants";
import SelectionCard from "../ui/SelectionCard";

export default function PhaseTypen({ activeSchriftarten, activeBerge, bergDisplay, startWizard, triggerShake, setErrors }) {
  const { form, set, errors, limits, constr } = useWizard();
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);

  const handleWeiter = () => {
    const e = {};
    if (!form.typ) e.typ = true;
    if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
    if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
    if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
    if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
    setErrors(e);
    if (Object.keys(e).length) { triggerShake(); return; }
    startWizard();
  };

  return (
    <Fade>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-normal uppercase m-0 leading-tight mb-1.5" style={{ fontSize: "clamp(28px,4.5vw,40px)" }}>Garderobe bestellen</h1>
        <h2 className="text-xl font-bold tracking-normal uppercase text-muted m-0 mb-4 leading-[1.3]" style={{ fontSize: "clamp(18px,2.5vw,22px)" }}>Massanfertigung aus Schweizer Holz</h2>
        <p className="text-[13px] text-muted leading-relaxed max-w-[420px] mx-auto">
          Welchen Garderoben-Typ m{"ö"}chten Sie? W{"ä"}hlen Sie Ihr Motiv {"\u2013"} danach konfigurieren Sie Holz, Masse und Details.
        </p>
      </div>

      {/* Type selection */}
      <div role="radiogroup" aria-label="Garderoben-Typ" className="grid grid-cols-2 gap-3">
        <SelectionCard selected={form.typ === "schriftzug"} onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
          shade="light" badgeSize="lg" className="flex flex-col items-center gap-2 py-4 px-3.5 text-center">
          <div className="w-full mb-1">
            <svg viewBox="0 0 160 80" className="w-full h-20">
              <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
              {[22,36,50,64,78].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
              <text x="112" y="48" textAnchor="middle" fontSize="8" fill={form.typ === "schriftzug" ? t.brand : t.muted} fontWeight="700" letterSpacing=".12em" fontFamily="system-ui">IHR TEXT</text>
              {[122,136].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
            </svg>
          </div>
          <span className="text-base font-bold tracking-normal uppercase text-text">Schriftzug</span>
          <span className="text-sm text-muted leading-normal tracking-[0.05em]">Ihr pers{"ö"}nlicher Text als Motiv {"\u2013"} z.B. Familienname oder Willkommensgruss.</span>
        </SelectionCard>
        <SelectionCard selected={form.typ === "bergmotiv"} onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
          shade="light" badgeSize="lg" className="flex flex-col items-center gap-2 py-4 px-3.5 text-center">
          <div className="w-full mb-1">
            <svg viewBox="0 0 160 80" className="w-full h-20">
              <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
              <path d={berge[0].path} fill="none" stroke={form.typ === "bergmotiv" ? t.brand : t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(18,8) scale(1.24,0.72)" opacity="0.7" />
              {[30,50,110,130].map((x,i) => <line key={i} x1={x} y1="25" x2={x} y2="57" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
            </svg>
          </div>
          <span className="text-base font-bold tracking-normal uppercase text-text">Bergmotiv</span>
          <span className="text-sm text-muted leading-normal tracking-[0.05em]">Silhouette eines Schweizer Bergs {"\u2013"} 7 ikonische Gipfel zur Auswahl.</span>
        </SelectionCard>
      </div>

      {/* Schriftzug input */}
      {form.typ === "schriftzug" && (<Fade><div className="mt-6 p-4 bg-field border border-border rounded">
        <label className="block text-sm font-semibold mb-1.5 text-text">Ihr Schriftzug <span className="text-error">*</span></label>
        <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller \u2026" value={form.schriftzug} onChange={(e) => set("schriftzug", e.target.value)}
          className={`w-full h-[50px] px-3.5 text-base font-body text-text bg-field border rounded-sm text-center tracking-[0.06em] font-semibold ${limits.textTooLong ? 'border-error' : 'border-border'}`} />
        <div className={`text-[11px] mt-1.5 text-center ${limits.textTooLong ? 'text-error' : 'text-muted'}`}>
          {limits.textTooLong ? `Zu lang für ${constr.MAX_W} cm Breite \u2013 max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)` : `${limits.letters} / ${limits.maxLetters} Buchstaben \u00B7 Breite min. ${limits.minW} cm`}
        </div>
        <div className="mt-5">
          <label className="block text-sm font-semibold mb-1.5 text-text">Schriftart w{"ä"}hlen <span className="text-error">*</span></label>
          <div className="flex flex-col gap-1.5">
            {activeSchriftarten.map((f) => {
              const on = form.schriftart === f.value;
              return (
                <SelectionCard key={f.value} selected={on} onClick={() => set("schriftart", f.value)}
                  shade="light" badgeClassName="top-1/2 right-3 -translate-y-1/2"
                  className="flex items-center justify-center w-full px-4 pr-9 py-3.5 text-center">
                  <span className="text-2xl leading-[1.1] tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                    style={{ fontFamily: f.family, fontWeight: f.weight, color: on ? 'var(--color-brand)' : 'var(--color-text)' }}>
                    {form.schriftzug || "Beispiel"}
                  </span>
                </SelectionCard>
              );
            })}
          </div>
        </div>
        {form.schriftzug && form.schriftart && fontObj && (
          <div className="mt-5">
            <div className="text-xs font-bold tracking-widest uppercase text-muted text-center mb-2">Live-Vorschau</div>
            <div className="flex justify-center">
              <svg viewBox="0 0 320 160" className="w-full max-w-[380px] h-auto">
                <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                {[45,95,145,195,245,275].map((x,i) => (<g key={i}><line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" /><circle cx={x} cy="120" r="2.5" fill={t.border} /></g>))}
                <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family} fontWeight={fontObj.weight} fill="none" stroke={t.brand} strokeWidth="1.2" letterSpacing=".06em" opacity="0.85">{form.schriftzug.toUpperCase()}</text>
                <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family} fontWeight={fontObj.weight} fill={t.brand} opacity="0.08" letterSpacing=".06em">{form.schriftzug.toUpperCase()}</text>
                <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" /><line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" /><line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
              </svg>
            </div>
            <div className="text-center mt-1.5 text-[11px] text-muted">Schrift: {fontObj.label} {"\u00B7"} Die Kontur wird aus Holz gefr{"ä"}st</div>
          </div>
        )}
        {form.schriftzug && !form.schriftart && (<div className="flex justify-center mt-4">
          <svg viewBox="0 0 280 56" className="w-full max-w-[340px] h-12">
            <rect x="2" y="2" width="276" height="52" rx="2" fill="none" stroke={t.border} strokeWidth="1" />
            {[20,48,76,204,232,260].map((x,i) => <line key={i} x1={x} y1="12" x2={x} y2="44" stroke={t.border} strokeWidth="1.5" strokeLinecap="round" />)}
            <text x="140" y="34" textAnchor="middle" fontSize="12" fill={t.brand} fontWeight="800" letterSpacing=".1em" fontFamily="system-ui">{form.schriftzug.toUpperCase()}</text>
          </svg>
        </div>)}
      </div></Fade>)}

      {/* Berg selection */}
      {form.typ === "bergmotiv" && (<Fade><div className="mt-6 p-4 bg-field border border-border rounded">
        <label className="block text-sm font-semibold mb-1.5 text-text">Berg ausw{"ä"}hlen <span className="text-error">*</span></label>
        <div className="grid grid-cols-2 gap-2.5 mt-2 cq-berg-3 cq-berg-4">
          {activeBerge.map((b) => {
            const on = form.berg === b.value;
            const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
            return (
              <SelectionCard key={b.value} selected={on} onClick={() => set("berg", b.value)}
                shade="light" className="flex flex-col items-center gap-1 py-3 px-2 text-center">
                <svg viewBox="0 0 100 70" className="w-full h-11" preserveAspectRatio="none">
                  <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <span className={`text-xs font-bold ${on ? 'text-brand' : 'text-text'}`} style={{ fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && <span className="text-[10px] text-muted">{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" \u00B7 ")}</span>}
              </SelectionCard>
            );
          })}
        </div>
      </div></Fade>)}

      <div className="flex justify-center mt-7">
        <button onClick={handleWeiter} disabled={!form.typ}
          className={`inline-flex items-center justify-center h-12 px-9 text-[13px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-white bg-brand border border-brand ${!form.typ ? 'opacity-35 cursor-default' : ''}`}>
          Weiter zur Konfiguration {"\u2192"}
        </button>
      </div>
      {(errors.schriftzug || errors.schriftart || errors.berg) && <p className="text-sm text-error text-center mt-2">{errors.schriftzug ? "Bitte geben Sie einen Schriftzug ein." : errors.schriftart ? "Bitte wählen Sie eine Schriftart." : "Bitte wählen Sie einen Berg."}</p>}
    </Fade>
  );
}
