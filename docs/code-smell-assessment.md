# Code Smell Assessment — Holzschneiderei Konfigurator

**Date:** 2026-03-08
**Scope:** Full `src/` codebase (~70 files, ~6,600 LOC)
**Method:** Systematic review of data layer, hooks/bridge, components, admin layer, and UI primitives.

---

## Critical — Real bugs or data corruption risks

### CS-01: Two parallel option list systems with diverged content

**Files:** `src/data/constants.js` (lines 7-82), `src/data/optionLists.js` (lines 6-62)

Both files define the same domain concepts (wood types, surfaces, extras, etc.) in different shapes. The data has already drifted:
- `constants.js:holzarten` has 5 entries (no `buche`)
- `optionLists.js:DEFAULT_HOLZARTEN` has 6 entries (includes `buche`)
- `constants.js:oberflaechen` includes `weiss-geoelt`, omits `ungeoelt`
- `optionLists.js:DEFAULT_OBERFLAECHEN` includes `ungeoelt`, omits `weiss-geoelt`

`optionLists.js:66` calls the constants format "legacy flat format" — the migration was started but never finished. Both systems are actively consumed in production by different components. Whichever UI reads from `constants.js` shows different options than one reading from `optionLists.js`.

**Impact:** Customer sees different options depending on which code path renders. Admin can configure items that don't exist on the customer side and vice versa.

---

### CS-02: `buche` exists in fixedPrices and optionLists but not in customer-facing holzarten or woodCosts

**Files:** `src/data/products.js` (lines 27, 65), `src/data/pricing.js` (DEFAULT_PRICING.woodCosts)

Both products have `fixedPrices` entries for `buche` (e.g. `"50-buche": 349`), and `DEFAULT_HOLZARTEN` has `buche: enabled`. But `constants.js:holzarten` doesn't include it, and `DEFAULT_PRICING.woodCosts` has no `buche` entry. If the admin migration completes and `buche` becomes selectable, `computePrice` falls back to hardcoded `|| 85` — wrong price for a wood type.

**Impact:** Latent pricing bug. Dead price table rows today; wrong price computation when migration completes.

---

### CS-03: Side effects inside React `setState` updater functions

**Files:** `src/hooks/useToggleSet.js` (lines 24-33), `src/hooks/useOptionList.js` (lines 21-35, 47-58)

```js
setEnabled((prev) => {
  const next = { ...prev, [val]: !prev[val] };
  if (!next[formValue]) {
    const first = items.find((item) => next[item.value]);
    if (first) onFallback(first.value);  // <-- side effect in updater
  }
  return next;
});
```

`onFallback` (which calls `setForm`) fires inside a state updater. React may call updaters multiple times in StrictMode. This produces duplicate `setForm` calls in development and undefined behavior during concurrent transitions.

**Impact:** Double state updates in dev mode; potential future breakage with React concurrent features.

---

### CS-04: `getAllItems` in optionLists mutates its input array via in-place `.sort()`

**File:** `src/data/optionLists.js` (lines 85-89)

```js
export function getAllItems(list) {
  return list.sort((a, b) => a.sortOrder - b.sortOrder).map(toFlatItem);
}
```

`Array.prototype.sort` mutates in place. Called from `useMemo` in `useOptionList`, this silently reorders the `items` state array every render — violating React's immutability contract. `getActiveItems` correctly creates a new array via `.filter()` first, but `getAllItems` does not.

**Impact:** Silent state mutation. Can cause missed re-renders and make `reorderItems` unreliable.

---

### CS-05: `AdminProducts` mutates `products` prop via in-place `.sort()` during render

**File:** `src/components/admin/AdminProducts.jsx` (line 44)

```jsx
{products.sort((a, b) => a.sortOrder - b.sortOrder).map((product) => {
```

Same issue as CS-04 but in a component. The `products` prop is a reference to parent state. Sorting it during render mutates the parent's state array without going through `setProducts`. Note: `AdminShowroom.jsx` correctly uses `[...showroom.presets].sort(...)`.

**Impact:** Silent state mutation bypassing React's reactivity. Subtle display bugs after reorder operations.

---

### CS-06: NaN dimension value passes root-level `validate()` — actual validation gap

**Files:** `src/Konfigurator.jsx` (lines 237-244)

```js
const v = parseInt(form[d.key]);
const min = d.key === "breite" ? limits.minW : constr[d.constrMin];
if (v < min || v > max) e[d.key] = "Wert muss zwischen...";
```

`parseInt("abc")` returns `NaN`. `NaN < max` is `false`, `NaN > min` is `false` — so the validation passes. A user who types letters into a dimension field can submit the form. The step-level `blurDim` in `StepMasse.jsx` does check `isNaN(v)`, but the submit-time validator in the root does not.

**Impact:** Non-numeric dimension values pass form submission.

---

### CS-07: Admin preview "Neu starten" button does incomplete state reset

**File:** `src/Konfigurator.jsx` (line 521)

```jsx
onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }}
```

This only resets `phase` and `form`. The real `PhaseDone.restart()` also resets `configId`, `checkoutError`, `submitting`, and calls `clearProgress()`. The admin preview's restart leaves the app in a potentially broken state.

**Impact:** Admin preview gets stuck after a test order flow. `submitting` stays true, `configId` remains set.

---

### CS-08: `PresetWizard` uses static constant arrays instead of live admin-configured lists

**File:** `src/components/admin/PresetWizard.jsx` (lines 113-130)

The wizard context constructed for preset editing uses the raw `holzarten`, `schriftarten`, `berge` arrays from `constants.js` rather than the admin-configured enabled subsets. An admin can disable a Holzart, but `PresetWizard` still shows it as selectable. Saved presets can contain values hidden from actual customers.

**Impact:** Presets can reference disabled options that customers can't select.

---

### CS-09: Array index used as React `key` on deletable image lists

**Files:** `src/components/admin/AdminProducts.jsx` (line 124), `src/components/admin/AdminShowroom.jsx` (line 405)

```jsx
{(product.previewImages || []).map((url, i) => (
  <div key={i} ...>
```

After deleting image 0, the image at index 1 gets key `0` — React reuses the wrong DOM node. The URL itself is a stable unique key.

**Impact:** Incorrect UI state when images are deleted out of order.

---

### CS-10: DOM manipulation via `document.getElementById` inside React component

**File:** `src/components/admin/AdminDimensions.jsx` (lines 48-49)

```jsx
onClick={() => {
  const el = document.getElementById(`add-${dim.key}`);
  addPreset(dim.key, el.value);
  el.value = "";  // <-- direct DOM mutation
}}
```

Uses `document.getElementById` to read and clear an uncontrolled input, bypassing React. If the component re-renders between keystroke and click, the element reference could be stale.

**Impact:** Subtle state/render bugs. Contradicts how every other input in the admin layer is handled.

---

## Important — Consistency issues and architectural smells

### CS-11: Validation logic for all steps lives in root component, violating own CLAUDE.md rule

**File:** `src/Konfigurator.jsx` (lines 225-256)

CLAUDE.md says: "Validierung gehört in den Step selbst." But `validate()` in Konfigurator.jsx owns validation for every step. `StepKontakt` also does inline blur validation with different error messages — the submit-path says "Bitte gültige E-Mail eingeben" while the blur-path says "Bitte gib deine E-Mail ein." Three different error strings for the same field.

**Impact:** Adding/modifying steps requires editing the root. Error messages have already drifted.

---

### CS-12: Half-finished migration from `useToggleSet` to `useOptionList`

**Files:** `src/hooks/useToggleSet.js`, `src/hooks/useOptionList.js`

`useOptionList` was built to replace `useToggleSet` and ships legacy aliases (`active`, `toggle`). But `useToggleSet` is still actively used for holzarten, schriftarten, and berge. The two hooks expose incompatible APIs (different method names, different return shapes). `useConfigManager` has to accept both shapes, doubling its parameter surface to 28 named params.

**Impact:** Growing maintenance burden. Every consumer must know which hook variant it's dealing with.

---

### CS-13: Duplicated product-type inference logic in two places

**Files:** `src/Konfigurator.jsx` (lines 189-221), `src/components/phases/PhaseTypen.jsx` (lines 23-35)

Both have the identical compound check:
```js
if (prod.motif === "schriftzug" || prod.id === "schriftzug") {
```
`startPreset` in Konfigurator also does a redundant second product lookup (`prod2` on line 213 when `prod` already has the same value).

**Impact:** Logic drift risk. The `motif` field was designed as the discriminator but is unreliable (`schriftzug` product has `motif: null`), so every reader adds `|| prod.id` fallbacks.

---

### CS-14: `useConfigManager` accepts 28 individual props

**File:** `src/hooks/useConfigManager.js` (lines 8-22)

Every admin-configurable field requires touching the hook signature, the call site, `getConfig()`, `applyConfig()`, and the validator. This is a serialization adapter for the entire app state disguised as a hook.

**Impact:** High coupling surface. Every new field touches 5 files.

---

### CS-15: `validateConfigShape` does not validate v3 array fields

**File:** `src/lib/validateConfig.js`

Validates `constr`, `pricing`, `dimConfig`, `enabledSteps`, `bergDisplay`, `texts` — but not `oberflaechenItems`, `extrasItems`, `hakenMatItems`, `darstellungItems`, `products`, `categoryVisibility`, `fusionEnabled`, or `showroom`. A corrupted import can inject arbitrary data into product definitions.

**Impact:** Partial validation gives false confidence. Build pipeline test only covers validated fields.

---

### CS-16: `set`, `setFieldError`, `toggleExtra` are unstable function references

**File:** `src/Konfigurator.jsx` (lines 173-175)

These are inline arrow functions with no `useCallback` wrapping. They get new identities every render. Every `useEffect` in step components that includes `set` in its dependency array (e.g., `StepAusfuehrung.jsx:30-35`) fires on every parent re-render, not just when its actual dependencies change.

**Impact:** Unnecessary effect evaluations across all step components. Could cause infinite loops if added to context `useMemo` deps.

---

### CS-17: `DEFAULT_CONSTR` values don't match any real product

**Files:** `src/data/pricing.js` (lines 16-22), `src/data/products.js` (per-product constraints)

`DEFAULT_CONSTR` has `MIN_W: 30, MAX_W: 100`. Neither product uses these bounds (garderobe: 50-80, schriftzug: 30-80). Any code path that briefly runs with `DEFAULT_CONSTR` before a product is selected computes wrong hook counts.

**Impact:** Brief flash of incorrect limits on initial load before product selection overrides them.

---

### CS-18: Auto-select `useEffect` pattern copied verbatim in 3 step components

**Files:** `StepHolzart.jsx` (11-15), `StepAusfuehrung.jsx` (17-27), `StepDarstellung.jsx` (11-15)

Identical structure. Should be a `useAutoSelect(hidden, options, currentValue, formKey, set)` hook.

**Impact:** Maintainability. All three also have the unstable `set` reference problem from CS-16.

---

### CS-19: Three different toggle switch implementations

**Files:** `src/components/ui/ToggleSwitch.jsx`, `src/components/admin/AdminProduktwahl.jsx` (lines 37-48), `src/components/admin/AdminFusion.jsx` (lines 123-133)

The project has `ToggleSwitch` as a UI primitive, but `AdminProduktwahl` implements its own inline toggle, and `AdminFusion` uses a third approach (hidden checkbox + peer Tailwind). `AdminFusion`'s version lacks `role="switch"` and `aria-checked`.

**Impact:** Accessibility inconsistency. Style drift between three independent implementations.

---

### CS-20: `postMessage` uses wildcard origin `"*"` with personal data

**File:** `src/bridge.js` (line 62)

```js
window.parent.postMessage(msg, "*");
```

`submit-config` payloads contain name, email, address. Any parent frame receives all messages. The Wix parent's origin is known and should be used as `targetOrigin`.

**Impact:** Information disclosure risk per OWASP guidelines.

---

### CS-21: `sanitize()` returns the original unsanitizable object on failure

**File:** `src/bridge.js` (lines 12-14)

```js
function sanitize(obj) {
  try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
}
```

If `JSON.stringify` throws, the raw non-serializable object is returned and then passed to `postMessage`, which will throw its own error — silently dropped. Should return `{}` or `null` instead.

**Impact:** Silent message loss with no caller notification.

---

### CS-22: `Shell.jsx` uses non-standard `r` prop instead of `forwardRef`

**File:** `src/components/ui/Shell.jsx` (line 1)

```jsx
export default function Shell({ r, children }) {
```

The ref is passed as `r` rather than using `React.forwardRef`. Callers passing standard `ref=` will have it silently ignored.

**Impact:** Silent ref loss for any caller using the standard React ref pattern.

---

### CS-23: `CollapsibleSection` — `aria-controls` points to unmounted element when collapsed

**File:** `src/components/ui/CollapsibleSection.jsx` (line 20)

```jsx
{open && <div id={contentId}>...</div>}
```

The button declares `aria-controls={contentId}`, but the target element doesn't exist in the DOM when collapsed. Should use `hidden` attribute instead of conditional rendering.

**Impact:** ARIA violation on every collapsed section.

---

### CS-24: `ImageCarousel` auto-plays with no pause mechanism

**File:** `src/components/ui/ImageCarousel.jsx` (lines 12-16)

No pause-on-hover, pause-on-focus, or pause button. WCAG 2.2.2 requires auto-moving content to be pausable.

**Impact:** Active accessibility violation on customer-facing pages.

---

## Low — Style and naming issues

### CS-25: `fieldCls` / `inputCls` style constants duplicated across 3+ admin files

`AdminProducts.jsx:40`, `AdminShowroom.jsx:12`, `AdminPricing.jsx:9` — identical or near-identical Tailwind strings for the same field styling.

### CS-26: `fmt` price formatter duplicated in `PhaseWizard.jsx:39` and `StepUebersicht.jsx:60`

Same regex, same Swiss-franc formatting. Should be a shared utility.

### CS-27: `SideRail.jsx` imports `OPTIONAL_STEPS` and `FIXED_STEP_IDS` but never uses them

Dead imports coupling a UI primitive to the data layer.

### CS-28: `SideRail.jsx` embeds `computePrice` business logic

A UI primitive imports pricing computation. Price should be passed as a pre-formatted prop.

### CS-29: `PANEL_STEP_MAP` uses `useMemo([])` for what should be a module-level constant

**File:** `src/Konfigurator.jsx` (lines 369-376) — empty dependency array `useMemo` is a static object in disguise.

### CS-30: Hardcoded `"5 Holzarten"` in PhaseTypen.jsx:137

Dynamic `{schriftarten.length}` right next to hardcoded `5`. Should use `activeHolzarten.length`.

### CS-31: `pulse-subtle` keyframe defined but never used

**File:** `src/konfigurator.css` (lines 166-169) — dead CSS.

### CS-32: Hardcoded `#2a4f42` hover color outside the design token system

**File:** `src/konfigurator.css` (line 111) — should be a `--color-brand-hover` token.

### CS-33: `AdminHeader` accepts `mode` and `onModeChange` props it never uses

Dead interface surface suggesting abandoned feature.

### CS-34: `localFallback` writes `config-save` to localStorage with no corresponding read path

**File:** `src/bridge.js` (lines 49-51) — admin config is written to `hz:config-save` in dev mode but never loaded back on reload.

### CS-35: `isFixed` always returned from `computePrice` but missing from the JSDoc typedef

**File:** `src/data/pricing.js` (lines 121-129) — callers like `FinancialSummary` branch on `price.isFixed` which isn't documented.

### CS-36: Step label resolution duplicated between `AdminSteps.jsx:52` and `StepPipeline.jsx:46`

Identical ternary expressions for fixed step labels.

### CS-37: `DimModeValue` typedef declared independently in both `constants.js:169` and `pricing.js:43`

Same type, two sources of truth.

---

## Priority Matrix

| Priority | Count | Fix Effort | Items |
|----------|-------|------------|-------|
| **Fix now** (real bugs) | 7 | Small-Medium | CS-04, CS-05, CS-06, CS-07, CS-09, CS-10, CS-03 |
| **Fix soon** (data integrity) | 3 | Medium | CS-01, CS-02, CS-08 |
| **Fix in TS migration** (structural) | 8 | Absorbed into TS work | CS-11, CS-12, CS-14, CS-15, CS-16, CS-17, CS-35, CS-37 |
| **Fix opportunistically** (consistency) | 10 | Small each | CS-13, CS-18, CS-19, CS-20, CS-21, CS-22, CS-23, CS-24, CS-25-34 |

The top 3 by blast radius: **CS-01** (diverged option lists affect every customer interaction), **CS-06** (NaN passes validation), **CS-03** (side effects in setState updaters fire twice in dev).
