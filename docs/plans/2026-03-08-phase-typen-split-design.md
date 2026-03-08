# PhaseTypen Split Design

**Date:** 2026-03-08
**Status:** Approved

## Problem

PhaseTypen handles two distinct mental tasks in one step: product selection and motif configuration (text/font or berg). This creates cognitive overload, unpredictable page growth, and mixed validation concerns.

## Decision

Split into PhaseTypen (product selection only) + StepMotiv (new wizard step for motif configuration).

## Design

### StepMotiv (`src/components/steps/StepMotiv.jsx`)

- New wizard step, first in every product's `steps[]` array
- Reads `form`, `set`, `errors`, `limits`, `constr`, `activeSchriftarten`, `activeBerge`, `bergDisplay` from WizardContext
- Schriftzug path: text input + font radio cards + live SVG preview
- Bergmotiv path: berg selection grid
- Validates its own fields on "Weiter" (text/font for Schriftzug, berg for Bergmotiv)

### PhaseTypen changes

- Keeps: header texts, product card grid, variant toggle, "Weiter" button
- Removes: Schriftzug input, Berg selection, text/font/berg validation
- `handleWeiter` only validates product selection, then calls `startWizard()`

### Step registration

- `OPTIONAL_STEPS` in constants.js: `{ id: "motiv", label: "Motiv", required: true, ... }`
- Products add `"motiv"` as first entry in their `steps[]` arrays
- `StepRenderer` in PhaseWizard.jsx adds `case "motiv"`

### Data flow

- `activeSchriftarten`, `activeBerge`, `bergDisplay` added to WizardContext
- StepMotiv accesses them via `useWizard()` — no prop drilling
- "Zurück" from step 0 already returns to PhaseTypen (existing behavior)

## Approach chosen

Approach 1: New wizard step in `product.steps[]`. Follows existing architecture. Rejected alternatives: separate phase (fights architecture), sub-views within PhaseTypen (reinvents wizard).
