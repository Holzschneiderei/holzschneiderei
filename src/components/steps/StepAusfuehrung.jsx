import { useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import SelectField from '../ui/SelectField';
import { oberflaechen as defaultOberflaechen, hakenMaterialien as defaultHakenMaterialien } from '../../data/constants';

export default function StepAusfuehrung() {
  const { form, set, limits, constr, activeOberflaechen, activeHakenMat } = useWizard();
  const oberflaechen = activeOberflaechen || defaultOberflaechen;
  const hakenMaterialien = activeHakenMat || defaultHakenMaterialien;
  const hookOpts = limits.hookOptions.map((n) => ({ value: String(n), label: String(n) }));

  /* Clamp haken to maxHooks when limits change (e.g. after width adjustment) */
  useEffect(() => {
    const currentHaken = parseInt(form.haken) || 0;
    if (currentHaken > limits.maxHooks && limits.maxHooks > 0) {
      set("haken", String(limits.maxHooks));
    }
  }, [form.haken, limits.maxHooks, set]);
  return (
    <div>
      <StepHeader title="Ausführung" sub="Oberfläche, Haken & Hutablage." />
      <div className="flex flex-col gap-4">
        <SelectField label="Oberfläche" value={form.oberflaeche} onChange={(v) => set("oberflaeche", v)} options={oberflaechen} />
        <div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label={`Haken (max. ${limits.maxHooks})`} value={form.haken} onChange={(v) => set("haken", v)} options={hookOpts} />
            <SelectField label="Material" value={form.hakenmaterial} onChange={(v) => set("hakenmaterial", v)} options={hakenMaterialien} />
          </div>
          <div className="text-[13px] text-muted italic leading-[1.4] mt-1.5">
            Mindestabstand {constr.HOOK_SPACING} cm \u00B7 {limits.clampedW} cm Breite \u2192 max. {limits.maxHooks} Haken
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-text">Hutablage</label>
          <div role="radiogroup" aria-label="Hutablage" className="flex gap-2.5">
            {[{ v: "ja", l: "Ja" }, { v: "nein", l: "Nein" }].map((o) => (
              <button key={o.v} onClick={() => set("hutablage", o.v)}
                role="radio" aria-checked={form.hutablage === o.v}
                className={`flex-1 h-12 border-[1.5px] rounded text-[15px] font-body cursor-pointer transition-all duration-200 ${
                  form.hutablage === o.v
                    ? 'border-brand bg-brand-medium text-brand font-bold shadow-card-active'
                    : 'border-border bg-field text-muted font-normal hover:border-brand/40'
                }`}>{o.l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
