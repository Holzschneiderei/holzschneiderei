import React from 'react';
import { useWizard } from "../../context/WizardContext";
import { schriftarten, t } from "../../data/constants";
import SelectionCard from "../ui/SelectionCard";
import Fade from "../ui/Fade";

export default function StepMotiv() {
  const { form, set, errors, limits, constr, activeSchriftarten, activeBerge, bergDisplay } = useWizard();
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);

  return (
    <>
      {/* Schriftzug input — shared between schriftzug and garderobe products */}
      {form.typ === "schriftzug" && (<Fade><div className="p-5 bg-field border border-border rounded-[4px]">
        <label htmlFor="schriftzug-input" className="block text-sm font-semibold mb-2 text-text">Dein Schriftzug <span className="text-error" aria-hidden="true">*</span><span className="sr-only"> (erforderlich)</span></label>
        <input id="schriftzug-input" type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller …" value={form.schriftzug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("schriftzug", e.target.value)}
          aria-invalid={errors.schriftzug ? true : undefined}
          aria-describedby="schriftzug-hint"
          className={`w-full h-[52px] px-4 text-base font-body text-text bg-field border rounded transition-all duration-200 text-center tracking-[0.06em] font-semibold ${limits.textTooLong ? 'border-error' : 'border-border'}`} />
        <div id="schriftzug-hint" aria-live="polite" className={`text-[11px] mt-2 text-center ${limits.textTooLong ? 'text-error' : 'text-muted'}`}>
          {limits.textTooLong ? `Zu lang f\u00FCr ${constr.MAX_W} cm Breite \u2013 max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)` : `${limits.letters} / ${limits.maxLetters} Buchstaben \u00B7 Breite min. ${limits.minW} cm`}
        </div>
        <div className="mt-6">
          <div role="radiogroup" aria-label="Schriftart wählen" aria-required="true">
            <div className="block text-sm font-semibold mb-2 text-text" aria-hidden="true">Schriftart w{"ä"}hlen <span className="text-error">*</span></div>
            <div className="flex flex-col gap-2">
              {activeSchriftarten.map((f) => {
                const on = form.schriftart === f.value;
                return (
                  <SelectionCard key={f.value} selected={on} onClick={() => set("schriftart", f.value)}
                    role="radio" aria-checked={on}
                    shade="light" badgeClassName="top-1/2 right-3 -translate-y-1/2"
                    className="flex items-center justify-center w-full px-4 pr-9 py-4 text-center">
                    <span className="text-2xl leading-[1.1] tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                      style={{ fontFamily: f.family as string, fontWeight: f.weight as number, color: on ? 'var(--color-brand)' : 'var(--color-text)' }}>
                      {form.schriftzug || "Beispiel"}
                    </span>
                  </SelectionCard>
                );
              })}
            </div>
          </div>
        </div>
        {form.schriftzug && form.schriftart && fontObj && (
          <div className="mt-6">
            <div className="text-xs font-bold tracking-widest uppercase text-muted text-center mb-3" aria-hidden="true">Live-Vorschau</div>
            <div className="flex justify-center">
              <svg aria-hidden="true" viewBox="0 0 320 160" className="w-full max-w-[380px] h-auto">
                <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                {[45,95,145,195,245,275].map((x,i) => (<g key={i}><line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" /><circle cx={x} cy="120" r="2.5" fill={t.border} /></g>))}
                <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family as string} fontWeight={fontObj.weight as number} fill="none" stroke={t.brand} strokeWidth="1.2" letterSpacing=".06em" opacity="0.85">{form.schriftzug.toUpperCase()}</text>
                <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family as string} fontWeight={fontObj.weight as number} fill={t.brand} opacity="0.08" letterSpacing=".06em">{form.schriftzug.toUpperCase()}</text>
                <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" /><line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" /><line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
              </svg>
            </div>
            <div className="text-center mt-2 text-[11px] text-muted">Schrift: {fontObj.label} {"\u00B7"} Die Kontur wird aus Holz gefr{"ä"}st</div>
          </div>
        )}
        {form.schriftzug && !form.schriftart && (<div className="flex justify-center mt-5">
          <svg aria-hidden="true" viewBox="0 0 280 56" className="w-full max-w-[340px] h-12">
            <rect x="2" y="2" width="276" height="52" rx="2" fill="none" stroke={t.border} strokeWidth="1" />
            {[20,48,76,204,232,260].map((x,i) => <line key={i} x1={x} y1="12" x2={x} y2="44" stroke={t.border} strokeWidth="1.5" strokeLinecap="round" />)}
            <text x="140" y="34" textAnchor="middle" fontSize="12" fill={t.brand} fontWeight="800" letterSpacing=".1em" fontFamily="system-ui">{form.schriftzug.toUpperCase()}</text>
          </svg>
        </div>)}
      </div></Fade>)}

      {/* Berg selection */}
      {form.typ === "bergmotiv" && (<Fade><div className="p-5 bg-field border border-border rounded-[4px]">
        <div role="radiogroup" aria-label="Berg auswählen" aria-required="true">
          <div className="block text-sm font-semibold mb-2 text-text" aria-hidden="true">Berg ausw{"ä"}hlen <span className="text-error">*</span></div>
          <div className="grid grid-cols-2 gap-3 mt-2.5 cq-berg-3 cq-berg-4">
            {activeBerge.map((b) => {
              const on = form.berg === b.value;
              const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
              return (
                <SelectionCard key={b.value} selected={on} onClick={() => set("berg", b.value)}
                  role="radio" aria-checked={on}
                  shade="light" className="flex flex-col items-center gap-1.5 py-3.5 px-2.5 text-center">
                  <svg aria-hidden="true" viewBox="0 0 100 70" className="w-full h-11" preserveAspectRatio="none">
                    <path d={b.path as string} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {bergDisplay.showName && <span className={`text-xs font-bold ${on ? 'text-brand' : 'text-text'}`} style={{ fontFamily: (lf?.family as string) || "inherit" }}>{b.label}</span>}
                  {(bergDisplay.showHeight || bergDisplay.showRegion) && <span className="text-[10px] text-muted">{[bergDisplay.showHeight && (b.hoehe as string), bergDisplay.showRegion && (b.region as string)].filter(Boolean).join(" \u00B7 ")}</span>}
                </SelectionCard>
              );
            })}
          </div>
        </div>
      </div></Fade>)}

      {(errors.schriftzug || errors.schriftart || errors.berg) && <p role="alert" className="text-sm text-error text-center mt-3">{errors.schriftzug ? "Bitte gib einen Schriftzug ein." : errors.schriftart ? "Bitte w\u00E4hle eine Schriftart." : "Bitte w\u00E4hle einen Berg."}</p>}
    </>
  );
}
