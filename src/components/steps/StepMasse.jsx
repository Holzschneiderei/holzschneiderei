import { useWizard } from '../../context/WizardContext';
import StepHeader from '../ui/StepHeader';
import { DIM_FIELDS } from '../../data/constants';

export default function StepMasse() {
  const { form, set, setFieldError, errors, limits, constr, dimConfig } = useWizard();
  const w = parseInt(form.breite) || 0;
  const wValid = w >= limits.minW && w <= limits.maxW;
  const wWarn = w > 0 && !wValid;

  const blurDim = (key, min, max) => () => {
    const v = parseInt(form[key]);
    if (!form[key]) setFieldError(key, `Bitte ${DIM_FIELDS.find(d => d.key === key)?.label || key} eingeben.`);
    else if (isNaN(v) || v < min || v > max) setFieldError(key, `Wert muss zwischen ${min} und ${max} liegen.`);
  };

  const renderDimInput = (dim) => {
    const cfg = dimConfig[dim.key];
    if (!cfg.enabled) return null;
    const min = dim.key === "breite" ? limits.minW : constr[dim.constrMin];
    const max = dim.key === "breite" ? limits.maxW : constr[dim.constrMax];
    const val = form[dim.key];
    const err = errors[dim.key];
    const filtered = cfg.presets.filter((v) => v >= min && v <= max);

    if (cfg.mode === "pills") {
      return (
        <div>
          <div className="flex justify-between items-baseline">
            <label className="block text-sm font-semibold mb-1.5 text-text">{dim.label} <span className="text-error">*</span></label>
            <span className="text-[11px] text-muted">{min}\u2013{max} {dim.unit}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {filtered.map((p) => {
              const on = String(p) === String(val);
              return (
                <button key={p} onClick={() => set(dim.key, String(p))}
                  className={`h-11 min-w-[48px] px-3.5 text-[15px] border-[1.5px] rounded cursor-pointer font-body transition-all duration-200 ${
                    on ? 'border-brand bg-brand text-white font-bold' : 'border-border bg-field text-text font-normal'
                  }`}>
                  {p}
                </button>
              );
            })}
          </div>
          <input type="number" inputMode="numeric" min={min} max={max} placeholder={`oder Wunschmass (${dim.unit})`}
            value={filtered.some((p) => String(p) === String(val)) ? "" : val}
            onChange={(e) => set(dim.key, e.target.value)}
            onBlur={blurDim(dim.key, min, max)}
            className={`w-full h-9 px-3.5 text-[13px] font-body text-text bg-field border rounded-sm ${err ? 'border-error' : 'border-border'}`} />
          {err && typeof err === "string" && <p className="text-xs text-error mt-1">{err}</p>}
        </div>
      );
    }

    if (cfg.mode === "combo") {
      return (
        <div>
          <div className="flex justify-between items-baseline">
            <label className="block text-sm font-semibold mb-1.5 text-text">{dim.label} <span className="text-error">*</span></label>
            <span className="text-[11px] text-muted">{min}\u2013{max} {dim.unit}</span>
          </div>
          <select value={filtered.includes(parseInt(val)) ? val : "__custom"}
            onChange={(e) => { if (e.target.value !== "__custom") set(dim.key, e.target.value); }}
            className={`w-full h-[46px] px-3.5 pr-9 text-base font-body text-text bg-field border rounded-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%277%27%3E%3Cpath%20d=%27M1%201l5%205%205-5%27%20fill=%27none%27%20stroke=%27%235b615b%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] ${err ? 'border-error' : 'border-border'}`}>
            {filtered.map((p) => <option key={p} value={String(p)}>{p} {dim.unit}</option>)}
            <option value="__custom">Anderes Mass\u2026</option>
          </select>
          {(!filtered.includes(parseInt(val))) && (
            <input type="number" inputMode="numeric" min={min} max={max} placeholder={`Wunschmass (${dim.unit})`} value={val}
              onChange={(e) => set(dim.key, e.target.value)}
              onBlur={blurDim(dim.key, min, max)}
              className={`w-full h-9 px-3.5 text-[13px] font-body text-text bg-field border rounded-sm mt-1.5 ${err ? 'border-error' : 'border-border'}`} />
          )}
          {err && typeof err === "string" && <p className="text-xs text-error mt-1">{err}</p>}
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-baseline">
          <label className="block text-sm font-semibold mb-1.5 text-text">{dim.label} <span className="text-error">*</span></label>
          <span className="text-[11px] text-muted">{min}\u2013{max} {dim.unit}</span>
        </div>
        <input type="number" inputMode="numeric" min={min} max={max} placeholder={dim.unit} value={val}
          onChange={(e) => set(dim.key, e.target.value)}
          onBlur={blurDim(dim.key, min, max)}
          className={`w-full h-12 px-3.5 text-lg font-body text-text bg-field border rounded-sm text-center tracking-[0.04em] ${err ? 'border-error' : 'border-border'}`} />
        {err && typeof err === "string" && <p className="text-xs text-error mt-1">{err}</p>}
      </div>
    );
  };

  const enabledDims = DIM_FIELDS.filter((d) => dimConfig[d.key].enabled);
  return (
    <div>
      <StepHeader title="Abmessungen" sub="Breite, Höhe und Tiefe in cm." />
      <div className="flex justify-center mb-5">
        <div className="w-[120px] h-20 border-[1.5px] border-border rounded-sm flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(200,197,187,0.12)_6px,rgba(200,197,187,0.12)_7px)]">
          <span className="text-[11px] text-muted tracking-[0.06em]">{enabledDims.map((d) => form[d.key] || d.label[0]).join(" \u00D7 ")} cm</span>
        </div>
      </div>
      {form.typ === "schriftzug" && limits.minWText > constr.MIN_W && (
        <div className="text-[13px] text-muted italic leading-[1.4] mt-1.5 mb-3">
          Min. {limits.minWText} cm Breite wegen {limits.letters} Buchstaben \u00B7 Max. {limits.maxHooks} Haken bei {limits.clampedW} cm
        </div>
      )}
      <div className="flex flex-col gap-4">
        {enabledDims.map((dim) => <div key={dim.key}>{renderDimInput(dim)}</div>)}
      </div>
      {wWarn && <p className="text-sm text-error mt-2">{w < limits.minW ? `Mindestbreite ${limits.minW} cm` + (limits.minWText > constr.MIN_W ? ` (${limits.letters} Buchstaben \u00D7 ${constr.LETTER_W} cm)` : "") : `Maximalbreite ${limits.maxW} cm`}</p>}
    </div>
  );
}
