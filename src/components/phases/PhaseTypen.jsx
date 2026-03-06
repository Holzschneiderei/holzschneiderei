import { useState } from "react";
import Fade from "../ui/Fade";
import { useWizard } from "../../context/WizardContext";
import { berge, schriftarten, t } from "../../data/constants";
import SelectionCard from "../ui/SelectionCard";

export default function PhaseTypen({ activeSchriftarten, activeBerge, bergDisplay, startWizard, triggerShake, setErrors }) {
  const { form, set, errors, limits, constr, products } = useWizard();
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const [comingSoonEmail, setComingSoonEmail] = useState("");

  const enabledProducts = (products || []).filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const hasProducts = enabledProducts.length > 0;

  // Map product id to old typ value for backwards compat
  const productToTyp = { garderobe: "schriftzug", schriftzug: "schriftzug", bergmotiv: "bergmotiv" };

  const selectProduct = (product) => {
    if (product.comingSoon) return;
    set("product", product.id);
    // Set typ based on product for backwards compat
    if (product.id === "garderobe") { set("typ", "schriftzug"); set("berg", ""); }
    else if (product.id === "bergmotiv") { set("typ", "bergmotiv"); set("schriftzug", ""); }
    else if (product.id === "schriftzug") { set("typ", "schriftzug"); set("berg", ""); }
  };

  const handleWeiter = () => {
    const e = {};
    if (hasProducts && !form.product) e.typ = true;
    if (!hasProducts && !form.typ) e.typ = true;
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
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-[0.02em] uppercase m-0 leading-tight mb-2 cq-fluid-h1">Garderobe bestellen</h1>
        <h2 className="text-xl font-bold tracking-[0.02em] uppercase text-muted m-0 mb-5 leading-[1.3] cq-fluid-h2">Massanfertigung aus Schweizer Holz</h2>
        <p className="text-muted leading-relaxed max-w-[440px] mx-auto cq-fluid-sm">
          {hasProducts
            ? "W\u00E4hlen Sie Ihr Produkt \u2013 danach konfigurieren Sie Holz, Masse und Details."
            : `Welchen Garderoben-Typ m${"ö"}chten Sie? W${"ä"}hlen Sie Ihr Motiv ${"\u2013"} danach konfigurieren Sie Holz, Masse und Details.`}
        </p>
      </div>

      {/* Product / Type selection */}
      {hasProducts ? (
        <div role="radiogroup" aria-label="Produkt w\u00E4hlen" className={`grid gap-4 ${enabledProducts.length <= 3 ? `grid-cols-${Math.min(enabledProducts.length, 3)}` : 'grid-cols-2'}`} style={{ gridTemplateColumns: `repeat(${Math.min(enabledProducts.length, 3)}, 1fr)` }}>
          {enabledProducts.map((product) => {
            const selected = form.product === product.id;
            if (product.comingSoon) {
              return (
                <div key={product.id} className="relative border-[1.5px] border-border rounded-[4px] bg-field opacity-60 flex flex-col items-center gap-2.5 py-5 px-4 text-center">
                  <span className="text-[28px]">{product.icon}</span>
                  <span className="text-base font-bold tracking-[0.02em] uppercase text-muted">{product.label}</span>
                  <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-brand bg-brand-medium px-2 py-0.5 rounded-sm">Coming Soon</span>
                  <span className="text-xs text-muted leading-normal">{product.teaser || product.desc}</span>
                  <div className="mt-1 w-full">
                    <input type="email" placeholder="E-Mail f\u00FCr Benachrichtigung" value={comingSoonEmail}
                      onChange={(e) => setComingSoonEmail(e.target.value)}
                      className="w-full h-8 px-2 text-[11px] font-body text-text bg-field border border-border rounded-sm text-center" />
                  </div>
                </div>
              );
            }
            return (
              <SelectionCard key={product.id} selected={selected} onClick={() => selectProduct(product)}
                shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
                <span className="text-[28px]">{product.icon}</span>
                <span className="text-base font-bold tracking-[0.02em] uppercase text-text">{product.label}</span>
                <span className="text-sm text-muted leading-normal tracking-[0.04em]">{product.desc}</span>
              </SelectionCard>
            );
          })}
        </div>
      ) : (
        <div role="radiogroup" aria-label="Garderoben-Typ" className="grid grid-cols-2 gap-4">
          <SelectionCard selected={form.typ === "schriftzug"} onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
            shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
            <div className="w-full mb-1">
              <svg viewBox="0 0 160 80" className="w-full h-20">
                <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                {[22,36,50,64,78].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                <text x="112" y="48" textAnchor="middle" fontSize="8" fill={form.typ === "schriftzug" ? t.brand : t.muted} fontWeight="700" letterSpacing=".12em" fontFamily="system-ui">IHR TEXT</text>
                {[122,136].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
              </svg>
            </div>
            <span className="text-base font-bold tracking-[0.02em] uppercase text-text">Schriftzug</span>
            <span className="text-sm text-muted leading-normal tracking-[0.04em]">Ihr pers{"ö"}nlicher Text als Motiv {"\u2013"} z.B. Familienname oder Willkommensgruss.</span>
          </SelectionCard>
          <SelectionCard selected={form.typ === "bergmotiv"} onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
            shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
            <div className="w-full mb-1">
              <svg viewBox="0 0 160 80" className="w-full h-20">
                <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                <path d={berge[0].path} fill="none" stroke={form.typ === "bergmotiv" ? t.brand : t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(18,8) scale(1.24,0.72)" opacity="0.7" />
                {[30,50,110,130].map((x,i) => <line key={i} x1={x} y1="25" x2={x} y2="57" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
              </svg>
            </div>
            <span className="text-base font-bold tracking-[0.02em] uppercase text-text">Bergmotiv</span>
            <span className="text-sm text-muted leading-normal tracking-[0.04em]">Silhouette eines Schweizer Bergs {"\u2013"} 7 ikonische Gipfel zur Auswahl.</span>
          </SelectionCard>
        </div>
      )}

      {/* Schriftzug input */}
      {form.typ === "schriftzug" && (<Fade><div className="mt-7 p-5 bg-field border border-border rounded-[4px]">
        <label className="block text-sm font-semibold mb-2 text-text">Ihr Schriftzug <span className="text-error">*</span></label>
        <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie M\u00FCller \u2026" value={form.schriftzug} onChange={(e) => set("schriftzug", e.target.value)}
          className={`w-full h-[52px] px-4 text-base font-body text-text bg-field border rounded transition-all duration-200 text-center tracking-[0.06em] font-semibold ${limits.textTooLong ? 'border-error' : 'border-border'}`} />
        <div className={`text-[11px] mt-2 text-center ${limits.textTooLong ? 'text-error' : 'text-muted'}`}>
          {limits.textTooLong ? `Zu lang f\u00FCr ${constr.MAX_W} cm Breite \u2013 max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)` : `${limits.letters} / ${limits.maxLetters} Buchstaben \u00B7 Breite min. ${limits.minW} cm`}
        </div>
        <div className="mt-6">
          <label className="block text-sm font-semibold mb-2 text-text">Schriftart w{"ä"}hlen <span className="text-error">*</span></label>
          <div className="flex flex-col gap-2">
            {activeSchriftarten.map((f) => {
              const on = form.schriftart === f.value;
              return (
                <SelectionCard key={f.value} selected={on} onClick={() => set("schriftart", f.value)}
                  shade="light" badgeClassName="top-1/2 right-3 -translate-y-1/2"
                  className="flex items-center justify-center w-full px-4 pr-9 py-4 text-center">
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
          <div className="mt-6">
            <div className="text-xs font-bold tracking-widest uppercase text-muted text-center mb-3">Live-Vorschau</div>
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
            <div className="text-center mt-2 text-[11px] text-muted">Schrift: {fontObj.label} {"\u00B7"} Die Kontur wird aus Holz gefr{"ä"}st</div>
          </div>
        )}
        {form.schriftzug && !form.schriftart && (<div className="flex justify-center mt-5">
          <svg viewBox="0 0 280 56" className="w-full max-w-[340px] h-12">
            <rect x="2" y="2" width="276" height="52" rx="2" fill="none" stroke={t.border} strokeWidth="1" />
            {[20,48,76,204,232,260].map((x,i) => <line key={i} x1={x} y1="12" x2={x} y2="44" stroke={t.border} strokeWidth="1.5" strokeLinecap="round" />)}
            <text x="140" y="34" textAnchor="middle" fontSize="12" fill={t.brand} fontWeight="800" letterSpacing=".1em" fontFamily="system-ui">{form.schriftzug.toUpperCase()}</text>
          </svg>
        </div>)}
      </div></Fade>)}

      {/* Berg selection */}
      {form.typ === "bergmotiv" && (<Fade><div className="mt-7 p-5 bg-field border border-border rounded-[4px]">
        <label className="block text-sm font-semibold mb-2 text-text">Berg ausw{"ä"}hlen <span className="text-error">*</span></label>
        <div className="grid grid-cols-2 gap-3 mt-2.5 cq-berg-3 cq-berg-4">
          {activeBerge.map((b) => {
            const on = form.berg === b.value;
            const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
            return (
              <SelectionCard key={b.value} selected={on} onClick={() => set("berg", b.value)}
                shade="light" className="flex flex-col items-center gap-1.5 py-3.5 px-2.5 text-center">
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

      <div className="flex justify-center mt-8">
        <button onClick={handleWeiter} disabled={!form.typ}
          className={`wz-btn wz-btn-primary h-[52px] px-10 text-[14px] tracking-[0.04em] ${!form.typ ? 'opacity-35 cursor-default' : ''}`}>
          Weiter zur Konfiguration {"\u2192"}
        </button>
      </div>
      {(errors.schriftzug || errors.schriftart || errors.berg) && <p className="text-sm text-error text-center mt-3">{errors.schriftzug ? "Bitte geben Sie einen Schriftzug ein." : errors.schriftart ? "Bitte w\u00E4hlen Sie eine Schriftart." : "Bitte w\u00E4hlen Sie einen Berg."}</p>}
    </Fade>
  );
}
