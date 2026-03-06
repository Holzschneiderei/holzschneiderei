import { useId } from 'react';
import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import SelectionCard from '../ui/SelectionCard';
import { extrasOptions as defaultExtras } from '../../data/constants';

export default function StepExtras() {
  const bemerkId = useId();
  const { form, toggleExtra, set, activeExtras, categoryVisibility } = useWizard();
  const extrasOptions = activeExtras || defaultExtras;
  const hideExtras = categoryVisibility && !categoryVisibility.extras;

  return (
    <div>
      <StepHeader title={hideExtras ? "Bemerkungen" : "Extras & Wünsche"} sub={hideExtras ? "Haben Sie besondere Wünsche?" : "Zusätzliche Ausstattung und Bemerkungen."} />
      {!hideExtras && (
        <div role="group" aria-label="Extras auswählen" className="grid grid-cols-3 gap-3 cq-extras-4">
          {extrasOptions.map((ex) => {
            const on = form.extras.includes(ex.value);
            return (
              <SelectionCard key={ex.value} selected={on} onClick={() => toggleExtra(ex.value)}
                aria-pressed={on}
                badgeSize="sm" className="flex flex-col items-center gap-2 py-5 px-2">
                <span className="text-[24px]" aria-hidden="true">{ex.icon}</span>
                <span className={`text-xs font-semibold ${on ? 'text-brand' : 'text-text'}`}>{ex.label}</span>
              </SelectionCard>
            );
          })}
        </div>
      )}
      <div className={hideExtras ? "" : "mt-5"}>
        <label htmlFor={bemerkId} className="block text-sm font-semibold mb-1.5 text-text">Bemerkungen (optional)</label>
        <textarea
          id={bemerkId}
          placeholder="Z.B. spezielle Farbe, Gravur \u2026"
          value={form.bemerkungen}
          onChange={(e) => set("bemerkungen", e.target.value)}
          className="w-full h-[90px] px-3.5 py-3 text-base font-body text-text bg-field border border-border rounded-sm resize-y leading-normal"
        />
      </div>
    </div>
  );
}
