# Codebase Improvements Tracker

Prioritised list of improvements identified during the March 2026 audit.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## High Impact

### 1. Add an ErrorBoundary
- [x] A crash in any step white-screens the entire embedded iframe with no recovery
- [x] Add a simple boundary with a "restart" button around the configurator
- Files: new `src/components/ui/ErrorBoundary.jsx`, `src/main.jsx`

### 2. Create a WizardContext
- [x] `GarderobeWizard` has 17+ `useState` calls and `PhaseWizard` receives 23 props
- [x] Create context providing `{ form, set, errors, limits, constr, dimConfig, pricing }`
- [x] Refactor step/phase components to consume context instead of props
- Files: new `src/context/WizardContext.jsx`, `src/Konfigurator.jsx`, all step/phase components

### 3. Accessibility gaps
- [~] Button groups acting as radio selectors lack `role="radiogroup"`, `aria-pressed`/`aria-checked`
- [~] `TextField` / `SelectField` — `<label>` not linked to inputs via `htmlFor`/`id`, no `aria-invalid`
- [~] `CollapsibleSection` — missing `aria-expanded` on toggle button
- [~] Emoji `<span>` elements need `aria-hidden="true"`
- Files: `StepHolzart`, `StepExtras`, `StepAusfuehrung`, `PhaseTypen`, `TextField`, `SelectField`, `CollapsibleSection`

---

## Medium Impact

### 4. Extract reusable SelectionCard and CheckBadge
- [x] Selected/unselected card pattern copy-pasted across 5+ files
- [x] Checkmark badge repeated in `StepHolzart`, `StepExtras`, `PhaseTypen`, `AdminTypeDefaults`
- Files: new `src/components/ui/SelectionCard.jsx`, `src/components/ui/CheckBadge.jsx`

### 5. Fix render-time side effect in StepAusfuehrung
- [x] `setTimeout(() => set("haken",...), 0)` fires during render — React anti-pattern
- [x] Move hook-clamping to a `useEffect` or derived value
- Files: `src/components/steps/StepAusfuehrung.jsx`

### 6. Extract ToggleSwitch component
- [~] Toggle switch markup duplicated in `AdminSteps` and `AdminDimensions`
- Files: new `src/components/ui/ToggleSwitch.jsx`, `AdminSteps.jsx`, `AdminDimensions.jsx`

### 7. Fix stale closure in root useEffect
- [x] `Konfigurator.jsx` lines 183–228: `[]` deps but handlers reference `form`, `pricing` via closure
- [x] Use refs or restructure to avoid stale values
- Files: `src/Konfigurator.jsx`

---

## Lower Impact (Hardening)

### 8. Move hooksFor out of computeLimits return
- [x] Function in memoized return breaks referential equality → unnecessary re-renders
- Files: `src/data/pricing.js`

### 9. Validate config import shape
- [x] `useConfigManager` silently applies any object; malformed JSON can create broken state
- [x] Add shape validation and surface errors to user
- Files: `src/hooks/useConfigManager.js`

### 10. Add min attributes to admin pricing inputs
- [~] `AdminPricing` allows negative prices
- [~] `AdminConstraints` allows MIN > MAX
- Files: `src/components/admin/AdminPricing.jsx`, `src/components/admin/AdminConstraints.jsx`

### 11. Add JSDoc @typedef blocks
- [x] `constants.js` and `pricing.js` lack type documentation
- [x] Add JSDoc for editor autocomplete without TypeScript
- Files: `src/data/constants.js`, `src/data/pricing.js`

### 12. Deduplicate preview mode logic
- [ ] `Konfigurator.jsx` lines 306–357 re-implement type selection and step rendering
- [ ] Reuse `PhaseTypen`/`PhaseWizard` instead
- Files: `src/Konfigurator.jsx`
