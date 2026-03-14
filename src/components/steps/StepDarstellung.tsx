import { useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import SelectionCard from '../ui/SelectionCard';
import StepHeader from '../ui/StepHeader';

export default function StepDarstellung() {
  const { form, set, errors, activeDarstellungen: darstellungen, categoryVisibility, texts } = useWizard();
  const stepTexts = (texts?.steps as Record<string, Record<string, string>> | undefined)?.darstellung;
  const hidden = categoryVisibility && !categoryVisibility.darstellungen;

  // Auto-select first when category is hidden
  useEffect(() => {
    if (hidden && darstellungen.length > 0 && !form.darstellung) {
      set("darstellung", darstellungen[0]!.value);
    }
  }, [hidden, darstellungen, form.darstellung, set]);

  if (!darstellungen || darstellungen.length === 0) return null;
  if (hidden) return null;

  return (
    <div>
      <StepHeader title={stepTexts?.title || "Darstellung"} sub={stepTexts?.subtitle || "W\u00E4hle die Pr\u00E4sentationsart."} />
      <div role="radiogroup" aria-label="Darstellung wählen" className="grid grid-cols-1 gap-3">
        {darstellungen.map((d) => {
          const on = form.darstellung === d.value;
          return (
            <SelectionCard key={d.value} selected={on} onClick={() => set("darstellung", d.value)}
              role="radio" aria-checked={on}
              error={!!errors.darstellung && !form.darstellung} badgeSize="lg" badgeClassName="top-1/2 right-3 -translate-y-1/2"
              className="flex items-center gap-3 py-4 px-5 text-left">
              <span className="text-base font-bold tracking-[0.02em] text-text">{d.label}</span>
            </SelectionCard>
          );
        })}
      </div>
      {errors.darstellung && <p role="alert" className="text-sm text-error mt-2">Bitte w&#228;hle eine Darstellung.</p>}
    </div>
  );
}
