import { useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import Fade from '../ui/Fade';
import SelectionCard from '../ui/SelectionCard';
import StepHeader from '../ui/StepHeader';

export default function StepHolzart() {
  const { form, set, errors, activeHolzarten: woods, categoryVisibility } = useWizard();
  const hidden = categoryVisibility && !categoryVisibility.holzarten;

  // Auto-select first wood when category is hidden
  useEffect(() => {
    if (hidden && woods.length > 0 && !form.holzart) {
      set("holzart", woods[0]!.value);
    }
  }, [hidden, woods, form.holzart, set]);

  if (hidden) {
    return (
      <Fade>
        <StepHeader title="Holzart" sub={`${woods.find(w => w.value === form.holzart)?.label ?? woods[0]?.label ?? "Standard"} vorausgewählt.`} />
      </Fade>
    );
  }

  return (
    <Fade>
      <StepHeader title="Welches Holz?" sub="W&#228;hle die Holzart f&#252;r dein Produkt." />
      <div role="radiogroup" aria-label="Holzart wählen" aria-invalid={!!errors.holzart && !form.holzart || undefined} className="grid grid-cols-2 gap-3 cq-wood-3 cq-wood-4">
        {woods.map((h) => {
          const on = form.holzart === h.value;
          return (
            <SelectionCard key={h.value} selected={on} onClick={() => set("holzart", h.value)}
              role="radio" aria-checked={on}
              error={!!errors.holzart && !form.holzart} badgeSize="lg" badgeClassName="top-2.5 right-3"
              className="flex flex-col items-center gap-2 py-6 px-3 text-center">
              <span className="text-[30px]" aria-hidden="true">{h.emoji as string}</span>
              <span className="text-base font-bold uppercase tracking-[0.02em] text-text">{h.label}</span>
              <span className="text-sm text-muted leading-normal">{h.desc as string}</span>
            </SelectionCard>
          );
        })}
      </div>
      {errors.holzart && <p role="alert" className="text-sm text-error mt-2">Bitte w&#228;hle eine Holzart.</p>}
    </Fade>
  );
}
