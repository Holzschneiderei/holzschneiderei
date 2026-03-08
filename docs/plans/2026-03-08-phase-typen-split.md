# PhaseTypen Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract Schriftzug/Berg configuration from PhaseTypen into a new `StepMotiv` wizard step, so PhaseTypen only handles product selection.

**Architecture:** New `StepMotiv` component registered in `OPTIONAL_STEPS` and added as the first entry in every product's `steps[]`. PhaseTypen loses its motif configuration UI and validation. WizardContext gains three new fields (`activeSchriftarten`, `activeBerge`, `bergDisplay`) so StepMotiv can access them without prop drilling.

**Tech Stack:** React, existing wizard step system, WizardContext

---

### Task 1: Register `motiv` in OPTIONAL_STEPS

**Files:**
- Modify: `src/data/constants.js:89` (OPTIONAL_STEPS array)

**Step 1: Add motiv entry to OPTIONAL_STEPS**

In `src/data/constants.js`, add as the first entry in the `OPTIONAL_STEPS` array:

```js
{ id: "motiv", label: "Motiv", desc: "Schriftzug oder Bergmotiv konfigurieren", icon: "✏️", defaultOn: true, required: true, defaults: {}, defaultLabel: "" },
```

Insert at line 90, before the `holzart` entry. `required: true` prevents admin from disabling it.

**Step 2: Verify no conflicts**

Run: `npm run build`
Expected: Build succeeds (no component references `motiv` step yet, so it just falls through StepRenderer's default case).

**Step 3: Commit**

```
feat: register motiv in OPTIONAL_STEPS
```

---

### Task 2: Add `motiv` to product step arrays

**Files:**
- Modify: `src/data/products.js:16,48` (product steps arrays)

**Step 1: Add "motiv" as first step in each product**

In `src/data/products.js`:

Garderobe (line 16):
```js
steps: ["motiv", "holzart", "masse", "ausfuehrung", "extras", "kontakt", "uebersicht"],
```

Schriftzug (line 48):
```js
steps: ["motiv", "holzart", "masse", "darstellung", "kontakt", "uebersicht"],
```

Bergmotiv has `steps: []` because it's `comingSoon: true` — leave it empty for now.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. The wizard will now show an empty step at position 0 (StepRenderer returns null for unknown IDs), but that's temporary.

**Step 3: Commit**

```
feat: add motiv as first step in product definitions
```

---

### Task 3: Expand WizardContext with motif data

**Files:**
- Modify: `src/context/WizardContext.jsx:7-20` (JSDoc comment only — add new fields to documentation)
- Modify: `src/Konfigurator.jsx:302-312` (wizardCtx useMemo)

**Step 1: Add activeSchriftarten, activeBerge, bergDisplay to wizardCtx**

In `src/Konfigurator.jsx`, find the `wizardCtx` useMemo (line 302). Add to the object:

```js
const wizardCtx = useMemo(() => ({
    form, set, setFieldError, errors, limits, constr, dimConfig, pricing,
    toggleExtra, skippedSteps, activeHolzarten: holzToggle.active,
    activeSchriftarten: schriftToggle.active,
    activeBerge: bergToggle.active,
    bergDisplay,
    activeOberflaechen: oberflaechenList.activeItems,
    activeExtras: extrasList.activeItems,
    activeHakenMat: hakenMatList.activeItems,
    activeDarstellungen: darstellungList.activeItems,
    activeProduct, products, categoryVisibility, fusionEnabled, isAdmin, texts,
  }), [form, errors, limits, constr, dimConfig, pricing, skippedSteps, holzToggle.active,
    schriftToggle.active, bergToggle.active, bergDisplay,
    oberflaechenList.activeItems, extrasList.activeItems, hakenMatList.activeItems, darstellungList.activeItems,
    activeProduct, products, categoryVisibility, fusionEnabled, isAdmin, texts]);
```

Add `schriftToggle.active`, `bergToggle.active`, and `bergDisplay` to both the object and the dependency array.

**Step 2: Update WizardContext JSDoc**

In `src/context/WizardContext.jsx`, add to the JSDoc comment (after line 17):

```
 * - activeSchriftarten — enabled schriftarten items
 * - activeBerge      — enabled berge items
 * - bergDisplay      — berg display configuration (mode, showName, showHeight, showRegion, labelFont)
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```
feat: add schriftarten, berge, bergDisplay to WizardContext
```

---

### Task 4: Create StepMotiv component

**Files:**
- Create: `src/components/steps/StepMotiv.jsx`

**Step 1: Create StepMotiv.jsx**

Create `src/components/steps/StepMotiv.jsx`. This extracts lines 193–272 from PhaseTypen.jsx (Schriftzug input + Berg selection) into a standalone step component.

```jsx
import { useWizard } from "../../context/WizardContext";
import { schriftarten, t } from "../../data/constants";
import SelectionCard from "../ui/SelectionCard";
import Fade from "../ui/Fade";

export default function StepMotiv() {
  const { form, set, errors, limits, constr, activeSchriftarten, activeBerge, bergDisplay } = useWizard();
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);

  return (
    <div>
      {form.typ === "schriftzug" && (
        <Fade>
          <div className="p-5 bg-field border border-border rounded-[4px]">
            <label htmlFor="schriftzug-input" className="block text-sm font-semibold mb-2 text-text">
              Ihr Schriftzug <span className="text-error" aria-hidden="true">*</span>
              <span className="sr-only"> (erforderlich)</span>
            </label>
            <input
              id="schriftzug-input" type="text" maxLength={30}
              placeholder="z.B. Willkommen, Familie Müller …"
              value={form.schriftzug}
              onChange={(e) => set("schriftzug", e.target.value)}
              aria-invalid={errors.schriftzug ? true : undefined}
              aria-describedby="schriftzug-hint"
              className={`w-full h-[52px] px-4 text-base font-body text-text bg-field border rounded transition-all duration-200 text-center tracking-[0.06em] font-semibold ${limits.textTooLong ? 'border-error' : 'border-border'}`}
            />
            <div id="schriftzug-hint" aria-live="polite" className={`text-[11px] mt-2 text-center ${limits.textTooLong ? 'text-error' : 'text-muted'}`}>
              {limits.textTooLong
                ? `Zu lang für ${constr.MAX_W} cm Breite – max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)`
                : `${limits.letters} / ${limits.maxLetters} Buchstaben · Breite min. ${limits.minW} cm`}
            </div>
            <div className="mt-6">
              <div role="radiogroup" aria-label="Schriftart wählen" aria-required="true">
                <div className="block text-sm font-semibold mb-2 text-text" aria-hidden="true">
                  Schriftart wählen <span className="text-error">*</span>
                </div>
                <div className="flex flex-col gap-2">
                  {activeSchriftarten.map((f) => {
                    const on = form.schriftart === f.value;
                    return (
                      <SelectionCard key={f.value} selected={on} onClick={() => set("schriftart", f.value)}
                        role="radio" aria-checked={on}
                        shade="light" badgeClassName="top-1/2 right-3 -translate-y-1/2"
                        className="flex items-center justify-center w-full px-4 pr-9 py-4 text-center">
                        <span className="text-2xl leading-[1.1] tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                          style={{ fontFamily: f.family, fontWeight: f.weight, color: on ? 'var(--color-brand)' : 'var(--color-text)' }}>
                          {form.schriftzug || "Beispiel"}
                        </span>
                      </SelectionCard>
                    );
                  })}
                </div>
              </div>
            </div>
            {form.schriftzug && form.schriftart && fontObj && (
              <div className="mt-6">
                <div className="text-xs font-bold tracking-widest uppercase text-muted text-center mb-3" aria-hidden="true">Live-Vorschau</div>
                <div className="flex justify-center">
                  <svg aria-hidden="true" viewBox="0 0 320 160" className="w-full max-w-[380px] h-auto">
                    <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                    {[45,95,145,195,245,275].map((x,i) => (<g key={i}><line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" /><circle cx={x} cy="120" r="2.5" fill={t.border} /></g>))}
                    <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                    <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family} fontWeight={fontObj.weight} fill="none" stroke={t.brand} strokeWidth="1.2" letterSpacing=".06em" opacity="0.85">{form.schriftzug.toUpperCase()}</text>
                    <text x="160" y="52" textAnchor="middle" fontSize="32" fontFamily={fontObj.family} fontWeight={fontObj.weight} fill={t.brand} opacity="0.08" letterSpacing=".06em">{form.schriftzug.toUpperCase()}</text>
                    <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" /><line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" /><line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
                  </svg>
                </div>
                <div className="text-center mt-2 text-[11px] text-muted">Schrift: {fontObj.label} {"\u00B7"} Die Kontur wird aus Holz gefräst</div>
              </div>
            )}
            {form.schriftzug && !form.schriftart && (
              <div className="flex justify-center mt-5">
                <svg aria-hidden="true" viewBox="0 0 280 56" className="w-full max-w-[340px] h-12">
                  <rect x="2" y="2" width="276" height="52" rx="2" fill="none" stroke={t.border} strokeWidth="1" />
                  {[20,48,76,204,232,260].map((x,i) => <line key={i} x1={x} y1="12" x2={x} y2="44" stroke={t.border} strokeWidth="1.5" strokeLinecap="round" />)}
                  <text x="140" y="34" textAnchor="middle" fontSize="12" fill={t.brand} fontWeight="800" letterSpacing=".1em" fontFamily="system-ui">{form.schriftzug.toUpperCase()}</text>
                </svg>
              </div>
            )}
          </div>
        </Fade>
      )}

      {form.typ === "bergmotiv" && (
        <Fade>
          <div className="p-5 bg-field border border-border rounded-[4px]">
            <div role="radiogroup" aria-label="Berg auswählen" aria-required="true">
              <div className="block text-sm font-semibold mb-2 text-text" aria-hidden="true">
                Berg auswählen <span className="text-error">*</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2.5 cq-berg-3 cq-berg-4">
                {activeBerge.map((b) => {
                  const on = form.berg === b.value;
                  const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
                  return (
                    <SelectionCard key={b.value} selected={on} onClick={() => set("berg", b.value)}
                      role="radio" aria-checked={on}
                      shade="light" className="flex flex-col items-center gap-1.5 py-3.5 px-2.5 text-center">
                      <svg aria-hidden="true" viewBox="0 0 100 70" className="w-full h-11" preserveAspectRatio="none">
                        <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {bergDisplay.showName && <span className={`text-xs font-bold ${on ? 'text-brand' : 'text-text'}`} style={{ fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
                      {(bergDisplay.showHeight || bergDisplay.showRegion) && <span className="text-[10px] text-muted">{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" \u00B7 ")}</span>}
                    </SelectionCard>
                  );
                })}
              </div>
            </div>
          </div>
        </Fade>
      )}

      {(errors.schriftzug || errors.schriftart || errors.berg) && (
        <p role="alert" className="text-sm text-error text-center mt-3">
          {errors.schriftzug ? "Bitte geben Sie einen Schriftzug ein."
            : errors.schriftart ? "Bitte wählen Sie eine Schriftart."
            : "Bitte wählen Sie einen Berg."}
        </p>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (StepMotiv is not yet wired into StepRenderer).

**Step 3: Commit**

```
feat: create StepMotiv component
```

---

### Task 5: Wire StepMotiv into PhaseWizard

**Files:**
- Modify: `src/components/phases/PhaseWizard.jsx:1-23` (import + StepRenderer switch)

**Step 1: Add import and case**

In `src/components/phases/PhaseWizard.jsx`:

Add import after line 7:
```js
import StepMotiv from "../steps/StepMotiv";
```

Add case in `StepRenderer` switch (after line 14):
```js
case "motiv": return <StepMotiv />;
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. StepMotiv now renders when the wizard reaches the motiv step.

**Step 3: Commit**

```
feat: wire StepMotiv into PhaseWizard step renderer
```

---

### Task 6: Add motiv validation to Konfigurator.validate()

**Files:**
- Modify: `src/Konfigurator.jsx:187-210` (validate function)

**Step 1: Add motiv validation block**

In `src/Konfigurator.jsx`, find the `validate` function (line 187). Add after line 188 (`const e = {};`):

```js
    if (currentStepId === "motiv") {
      if (form.typ === "schriftzug") {
        if (!form.schriftzug.trim()) e.schriftzug = true;
        if (limits.textTooLong) e.schriftzug = true;
        if (!form.schriftart) e.schriftart = true;
      }
      if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
    }
```

This is the same validation that was in PhaseTypen's `handleWeiter`, now in the central `validate()` function.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```
feat: add motiv step validation
```

---

### Task 7: Simplify PhaseTypen

**Files:**
- Modify: `src/components/phases/PhaseTypen.jsx`

**Step 1: Remove motif configuration UI and simplify validation**

In `src/components/phases/PhaseTypen.jsx`:

1. **Remove imports** no longer needed: `berge`, `schriftarten`, `t` from constants (keep `getProductGroups`).

2. **Remove props** no longer needed: `activeSchriftarten`, `activeBerge`, `bergDisplay` from function signature.

3. **Remove from useWizard destructuring**: `limits`, `constr` (no longer used here). Keep: `form`, `set`, `errors`, `products`, `texts`.

4. **Remove state**: `const fontObj = ...` line.

5. **Simplify handleWeiter** — remove all text/font/berg validation:
```js
  const handleWeiter = () => {
    const e = {};
    if (hasProducts && !form.product) e.typ = true;
    if (!hasProducts && !form.typ) e.typ = true;
    setErrors(e);
    if (Object.keys(e).length) { triggerShake(); return; }
    startWizard();
  };
```

6. **Remove the Schriftzug input section** (lines 193–248, the `{form.typ === "schriftzug" && ...}` block).

7. **Remove the Berg selection section** (lines 251–272, the `{form.typ === "bergmotiv" && ...}` block).

8. **Remove the error display** at the bottom (lines 280, the `{(errors.schriftzug || errors.schriftart || errors.berg) && ...}` paragraph) — that now lives in StepMotiv.

The result: PhaseTypen renders header texts, product cards, variant toggle, and "Weiter" button. Nothing else.

**Step 2: Update PhaseTypen callsites in Konfigurator.jsx**

Remove the now-unused props from both places PhaseTypen is rendered. Find both occurrences (around lines 447 and 511):

Before:
```jsx
<PhaseTypen
  activeSchriftarten={schriftToggle.active} activeBerge={bergToggle.active}
  bergDisplay={bergDisplay} startWizard={startWizard} triggerShake={triggerShake} setErrors={setErrors}
/>
```

After:
```jsx
<PhaseTypen
  startWizard={startWizard} triggerShake={triggerShake} setErrors={setErrors}
/>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no warnings about unused variables.

**Step 4: Commit**

```
feat: simplify PhaseTypen to product selection only
```

---

### Task 8: Visual verification

**Step 1: Start dev server and test full flow**

Run: `npm run dev`

Test in browser at `http://localhost:5173/`:

1. **Product selection page**: Should show product cards and "Weiter" button. No text input, no font selection, no berg grid.
2. Click "Schriftzug" → click "Weiter" → should enter wizard at Step 1 "Motiv" with text input + font selection.
3. Enter text, pick font → see live preview → click "Weiter" → should advance to "Holzart" (Step 2).
4. Click "Zurück" from Holzart → should return to Motiv step.
5. Click "Zurück" from Motiv → should return to product selection (PhaseTypen).
6. Test admin mode at `http://localhost:5173/?mode=admin` — verify Wizard-Schritte shows "Motiv" step in the pipeline.

**Step 2: Commit if any fixes needed**

```
fix: address visual verification issues
```
