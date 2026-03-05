import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import TextField from '../ui/TextField';
import SelectField from '../ui/SelectField';

export default function StepKontakt() {
  const { form, set, errors } = useWizard();
  return (
    <div>
      <StepHeader title="Kontaktdaten" sub="Damit wir Ihnen die Offerte zusenden können." />
      <div className="flex flex-col gap-3.5">
        <SelectField label="Anrede" value={form.anrede} onChange={(v) => set("anrede", v)} options={[{ value: "", label: "Bitte wählen" }, { value: "herr", label: "Herr" }, { value: "frau", label: "Frau" }, { value: "divers", label: "Divers" }]} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Vorname" req placeholder="Max" value={form.vorname} onChange={(v) => set("vorname", v)} error={errors.vorname} />
          <TextField label="Nachname" req placeholder="Muster" value={form.nachname} onChange={(v) => set("nachname", v)} error={errors.nachname} />
        </div>
        <TextField label="E-Mail" req placeholder="max@beispiel.ch" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
        <TextField label="Telefon" placeholder="+41 79 000 00 00" type="tel" value={form.telefon} onChange={(v) => set("telefon", v)} />
        <TextField label="Strasse & Nr." placeholder="Musterstrasse 12" value={form.strasse} onChange={(v) => set("strasse", v)} />
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <TextField label="PLZ" req placeholder="8000" value={form.plz} onChange={(v) => set("plz", v)} error={errors.plz} />
          <TextField label="Ort" req placeholder="Zürich" value={form.ort} onChange={(v) => set("ort", v)} error={errors.ort} />
        </div>
      </div>
    </div>
  );
}
