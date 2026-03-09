import React from 'react';
import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import SummaryRow from '../ui/SummaryRow';
import { holzarten, oberflaechen as defaultOberflaechen, hakenMaterialien as defaultHakenMaterialien, extrasOptions as defaultExtras, berge, schriftarten } from '../../data/constants';
import { computePrice } from '../../data/pricing';
import { fmtChf } from '../../lib/format';

export default function StepUebersicht() {
  const { form, set, errors, skippedSteps, pricing, activeOberflaechen, activeHakenMat, activeExtras, activeProduct, categoryVisibility, fusionEnabled, isAdmin } = useWizard();
  const oberflaechen = activeOberflaechen || defaultOberflaechen;
  const hakenMaterialien = activeHakenMat || defaultHakenMaterialien;
  const extrasOptions = activeExtras || defaultExtras;
  const wood = holzarten.find((h) => h.value === form.holzart);
  const ofl = oberflaechen.find((o) => o.value === form.oberflaeche);
  const hm = hakenMaterialien.find((h) => h.value === form.hakenmaterial);
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typVal = form.typ === "schriftzug" ? `\u270F\uFE0F \u201E${form.schriftzug}\u201C` : `\u26F0\uFE0F ${bergObj?.label || "\u2013"}`;

  const cv = categoryVisibility || {};
  const showHolzarten = cv.holzarten !== false;
  const showOberflaechen = cv.oberflaechen !== false;
  const showExtras = cv.extras !== false;
  const showHakenMat = cv.hakenMaterialien !== false;

  return (
    <div>
      <StepHeader title="Zusammenfassung" sub="Pr\u00FCfe deine Angaben." />
      <div className="bg-field border border-border rounded-[4px] py-1.5 overflow-hidden">
        <SummaryRow label="Typ" value={typVal} />
        {form.typ === "schriftzug" && fontObj && <SummaryRow label="Schriftart" value={fontObj.label} />}
        {showHolzarten && <SummaryRow label="Holzart" value={wood ? `${wood.emoji as string} ${wood.label}` : "\u2013"} />}
        <SummaryRow label="Masse" value={`${form.breite} \u00D7 ${form.hoehe} \u00D7 ${form.tiefe} cm`} />
        {showOberflaechen && <SummaryRow label="Oberfläche" value={ofl?.label || "\u2013"} />}
        <SummaryRow label="Haken" value={`${form.haken}\u00D7${showHakenMat && hm ? ` ${hm.label}` : ""}`} />
        <SummaryRow label="Hutablage" value={form.hutablage === "ja" ? "Ja" : "Nein"} />
        {showExtras && form.extras.length > 0 && <SummaryRow label="Extras" value={form.extras.map((v) => extrasOptions.find((e) => e.value === v)?.label).join(", ")} />}
        {form.bemerkungen && <SummaryRow label="Bemerkungen" value={form.bemerkungen} />}
      </div>

      {skippedSteps.length > 0 && (
        <div className="mt-2.5 px-3.5 py-2.5 bg-[rgba(200,197,187,0.15)] rounded flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold tracking-widest uppercase text-muted">Standardwerte:</span>
          {skippedSteps.map((s) => <span key={s.id} className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-[rgba(31,59,49,0.08)] text-brand tracking-[0.02em]">{s.icon} {s.defaultLabel}</span>)}
        </div>
      )}

      <div className="bg-field border border-border rounded-[4px] py-1.5 overflow-hidden mt-4">
        <SummaryRow label="Name" value={`${form.anrede ? form.anrede.charAt(0).toUpperCase() + form.anrede.slice(1) + " " : ""}${form.vorname} ${form.nachname}`} />
        <SummaryRow label="E-Mail" value={form.email} />
        {form.telefon && <SummaryRow label="Telefon" value={form.telefon} />}
        {form.strasse ? <SummaryRow label="Adresse" value={`${form.strasse}, ${form.plz} ${form.ort}`} /> : <SummaryRow label="Ort" value={`${form.plz} ${form.ort}`} />}
      </div>

      <div className="bg-[rgba(31,59,49,0.04)] border border-border rounded-[4px] px-4 py-4 mt-4">
        <p className="text-xs text-muted leading-[1.55] m-0">Unverbindliche Offerte inkl. Visualisierung. Lieferzeit: 4–8 Wochen. Montage schweizweit.</p>
      </div>

      {pricing && (() => {
        const price = computePrice(form, pricing, activeProduct ?? undefined);
        const fmt = fmtChf;
        return (
          <div className="bg-brand-light border border-brand rounded-[4px] px-5 py-5 mt-4 text-center shadow-card">
            <div className="text-xs font-bold tracking-widest uppercase text-muted mb-1.5">Richtpreis</div>
            <div className="text-2xl font-extrabold text-brand tracking-[0.02em]">ab CHF {fmt(price.customerPrice)}.–</div>
            <div className="text-[10px] text-muted mt-1">Unverbindlich · Endpreis gemäss Offerte</div>
          </div>
        );
      })()}

      {isAdmin && !fusionEnabled && (
        <div className="mt-3 px-3.5 py-2.5 bg-[rgba(200,197,187,0.15)] rounded flex items-center gap-2">
          <span className="text-[11px] text-muted">Fusion 360 Script: deaktiviert</span>
        </div>
      )}

      <label className="flex items-center gap-2.5 mt-4 cursor-pointer min-h-11 py-1">
        <input type="checkbox" checked={form.datenschutz} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("datenschutz", e.target.checked)}
          aria-invalid={errors.datenschutz ? true : undefined}
          aria-describedby={errors.datenschutz ? "datenschutz-error" : undefined}
          className={`w-5 h-5 cursor-pointer shrink-0 ${errors.datenschutz ? 'accent-error' : 'accent-brand'}`} />
        <span className="text-[13px]">Ich akzeptiere die <a href="/datenschutz" className="text-brand underline">Datenschutzerklärung</a><span className="text-error ml-1" aria-hidden="true">*</span></span>
      </label>
      {errors.datenschutz && <p id="datenschutz-error" role="alert" className="text-sm text-error mt-2">Bitte akzeptiere die Datenschutzerkl\u00E4rung.</p>}
    </div>
  );
}
