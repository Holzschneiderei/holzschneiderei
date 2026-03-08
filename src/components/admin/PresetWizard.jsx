import { useState, useMemo, useCallback } from 'react';
import { WizardProvider } from '../../context/WizardContext';
import {
  holzarten, oberflaechen, berge, schriftarten, hakenMaterialien, extrasOptions,
  OPTIONAL_STEPS, FIXED_STEP_IDS, DEFAULT_FORM, DEFAULT_TEXTS,
} from '../../data/constants';
import { DEFAULT_CONSTR, DEFAULT_PRICING, makeDefaultDimConfig, computeLimits } from '../../data/pricing';

import StepMotiv from '../steps/StepMotiv';
import StepHolzart from '../steps/StepHolzart';
import StepMasse from '../steps/StepMasse';
import StepAusfuehrung from '../steps/StepAusfuehrung';
import StepExtras from '../steps/StepExtras';
import StepDarstellung from '../steps/StepDarstellung';

const STEP_COMPONENTS = {
  motiv: StepMotiv,
  holzart: StepHolzart,
  masse: StepMasse,
  ausfuehrung: StepAusfuehrung,
  extras: StepExtras,
  darstellung: StepDarstellung,
};

export default function PresetWizard({ preset, products, onSave, onCancel }) {
  // Find the product for this preset
  const product = products.find((p) => p.id === preset.productId);

  // Get configurable steps (exclude fixed steps like kontakt, uebersicht)
  const steps = useMemo(() => {
    if (!product || !product.steps) return [];
    return product.steps.filter((s) => !FIXED_STEP_IDS.includes(s) && STEP_COMPONENTS[s]);
  }, [product]);

  // Determine typ from product
  const initialTyp = useMemo(() => {
    if (!product) return '';
    if (product.motif === 'schriftzug' || product.id === 'schriftzug') return 'schriftzug';
    if (product.id === 'bergmotiv') return 'bergmotiv';
    return '';
  }, [product]);

  // Local form state
  const [form, setFormRaw] = useState(() => ({
    ...DEFAULT_FORM,
    ...preset.formSnapshot,
    product: preset.productId,
    typ: initialTyp,
  }));
  const [errors, setErrors] = useState({});
  const [stepIdx, setStepIdx] = useState(0);

  // set function matching the wizard interface: set(key, val) clears errors
  const set = useCallback((key, val) => {
    setFormRaw((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setFieldError = useCallback((key, msg) => {
    setErrors((prev) =>
      msg
        ? { ...prev, [key]: msg }
        : (() => { const n = { ...prev }; delete n[key]; return n; })()
    );
  }, []);

  // Toggle extras handler
  const toggleExtra = useCallback((val) => {
    setFormRaw((prev) => {
      const list = prev.extras || [];
      return {
        ...prev,
        extras: list.includes(val) ? list.filter((e) => e !== val) : [...list, val],
      };
    });
  }, []);

  // Constraints and limits
  const constr = product?.constraints && Object.keys(product.constraints).length > 0
    ? product.constraints
    : DEFAULT_CONSTR;
  const dimConfig = useMemo(() => makeDefaultDimConfig(constr), [constr]);
  const limits = useMemo(() => computeLimits(form, constr), [form, constr]);

  // Default berg display config
  const bergDisplay = useMemo(() => ({
    mode: 'relief', showName: true, showHeight: true, showRegion: true, labelFont: '',
  }), []);

  // Active option lists — all enabled for admin preset wizard
  const activeDarstellungen = useMemo(() => [
    { value: 'wandmontage', label: 'Wandmontage' },
    { value: 'staender', label: 'St\u00E4nder' },
  ], []);

  // Build wizard context value
  const ctxValue = useMemo(() => ({
    form,
    set,
    setFieldError,
    errors,
    limits,
    constr,
    dimConfig,
    pricing: DEFAULT_PRICING,
    toggleExtra,
    skippedSteps: [],
    activeHolzarten: holzarten,
    activeSchriftarten: schriftarten,
    activeBerge: berge,
    bergDisplay,
    activeOberflaechen: oberflaechen,
    activeExtras: extrasOptions,
    activeHakenMat: hakenMaterialien,
    activeDarstellungen,
    activeProduct: product,
    products,
    categoryVisibility: {
      holzarten: true,
      oberflaechen: true,
      extras: true,
      hakenMaterialien: true,
      darstellungen: true,
    },
    fusionEnabled: false,
    isAdmin: true,
    texts: DEFAULT_TEXTS,
  }), [form, set, setFieldError, errors, limits, constr, dimConfig, toggleExtra,
    bergDisplay, activeDarstellungen, product, products]);

  // Edge case: no product or no configurable steps
  if (!product || steps.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
        <div className="bg-white rounded-lg shadow-xl max-w-[520px] w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
          <div className="text-center py-8">
            <div className="text-[13px] text-muted mb-4">Bitte zuerst ein Produkt w{"\u00E4"}hlen.</div>
            <button
              onClick={onCancel}
              className="h-8 px-5 text-[12px] font-bold font-body rounded-sm border border-border bg-field text-text cursor-pointer hover:bg-[rgba(31,59,49,0.06)] transition-colors"
            >
              Schliessen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[stepIdx];
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepMeta = OPTIONAL_STEPS.find((s) => s.id === currentStep);
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-[520px] w-full mx-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <div className="text-[13px] font-bold text-text">Preset konfigurieren</div>
            <div className="text-[11px] text-muted">
              Schritt {stepIdx + 1} von {steps.length}: {stepMeta?.label || currentStep}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center text-muted hover:text-text bg-transparent border-none cursor-pointer text-base"
            aria-label="Schliessen"
          >
            {"\u2715"}
          </button>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <WizardProvider value={ctxValue}>
            {StepComponent && <StepComponent />}
          </WizardProvider>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
          <button
            onClick={isFirst ? onCancel : () => setStepIdx((i) => i - 1)}
            className="h-8 px-4 text-[12px] font-bold font-body rounded-sm border border-border bg-field text-text cursor-pointer hover:bg-[rgba(31,59,49,0.06)] transition-colors"
          >
            {isFirst ? 'Abbrechen' : 'Zur\u00FCck'}
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === stepIdx ? 'bg-brand' : i < stepIdx ? 'bg-brand/40' : 'bg-border'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (isLast) {
                onSave(form);
              } else {
                setStepIdx((i) => i + 1);
              }
            }}
            className="h-8 px-4 text-[12px] font-bold font-body rounded-sm border-none cursor-pointer bg-brand text-white hover:opacity-90 transition-colors"
          >
            {isLast ? 'Speichern' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
}
