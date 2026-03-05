import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import SelectionCard from '../ui/SelectionCard';

export default function StepHolzart() {
  const { form, set, errors, activeHolzarten: woods } = useWizard();
  return (
    <div>
      <StepHeader title="Welches Holz?" sub="Wählen Sie die Holzart für Ihre Garderobe." />
      <div role="radiogroup" aria-label="Holzart wählen" className="grid grid-cols-2 gap-2.5 cq-wood-3 cq-wood-4">
        {woods.map((h) => {
          const on = form.holzart === h.value;
          return (
            <SelectionCard key={h.value} selected={on} onClick={() => set("holzart", h.value)}
              role="radio" aria-checked={on}
              error={errors.holzart && !form.holzart} badgeSize="lg" badgeClassName="top-2 right-2.5"
              className="flex flex-col items-center gap-1.5 py-5 px-2.5 text-center">
              <span className="text-[28px]" aria-hidden="true">{h.emoji}</span>
              <span className="text-base font-bold tracking-normal text-text">{h.label}</span>
              <span className="text-sm text-muted leading-normal">{h.desc}</span>
            </SelectionCard>
          );
        })}
      </div>
      {errors.holzart && <p className="text-sm text-error mt-2">Bitte wählen Sie eine Holzart.</p>}
    </div>
  );
}
