import { useCallback } from 'react';
import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import TextField from '../ui/TextField';
import SelectField from '../ui/SelectField';

export default function StepKontakt() {
  const { form, set, errors, setFieldError } = useWizard();

  const blurRequired = useCallback((key, message) => () => {
    if (!form[key].trim()) setFieldError(key, message);
  }, [form, setFieldError]);

  const blurEmail = useCallback(() => {
    const v = form.email.trim();
    if (!v) setFieldError("email", "Bitte gib deine E-Mail ein.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setFieldError("email", "Bitte gib eine g\u00FCltige E-Mail ein.");
  }, [form.email, setFieldError]);

  return (
    <div>
      <StepHeader title="Kontaktdaten" sub="Damit wir dir die Offerte zusenden k\u00F6nnen." />
      <div className="flex flex-col gap-3.5">
        <SelectField label="Anrede" value={form.anrede} onChange={(v) => set("anrede", v)} options={[{ value: "", label: "Bitte w\u00E4hlen" }, { value: "herr", label: "Herr" }, { value: "frau", label: "Frau" }, { value: "divers", label: "Divers" }]} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Vorname" req placeholder="Max" value={form.vorname} onChange={(v) => set("vorname", v)} error={errors.vorname} onBlur={blurRequired("vorname", "Bitte Vorname eingeben.")} autoComplete="given-name" />
          <TextField label="Nachname" req placeholder="Muster" value={form.nachname} onChange={(v) => set("nachname", v)} error={errors.nachname} onBlur={blurRequired("nachname", "Bitte Nachname eingeben.")} autoComplete="family-name" />
        </div>
        <TextField label="E-Mail" req placeholder="max@beispiel.ch" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} onBlur={blurEmail} autoComplete="email" />
        <TextField label="Telefon" placeholder="+41 79 000 00 00" type="tel" value={form.telefon} onChange={(v) => set("telefon", v)} autoComplete="tel" />
        <TextField label="Strasse & Nr." placeholder="Musterstrasse 12" value={form.strasse} onChange={(v) => set("strasse", v)} autoComplete="street-address" />
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <TextField label="PLZ" req placeholder="8000" value={form.plz} onChange={(v) => set("plz", v)} error={errors.plz} onBlur={blurRequired("plz", "Bitte PLZ eingeben.")} autoComplete="postal-code" />
          <TextField label="Ort" req placeholder="Zürich" value={form.ort} onChange={(v) => set("ort", v)} error={errors.ort} onBlur={blurRequired("ort", "Bitte Ort eingeben.")} autoComplete="address-level2" />
        </div>
      </div>
    </div>
  );
}
