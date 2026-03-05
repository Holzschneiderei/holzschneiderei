# Configurator Mode-Switcher Redesign

## Problem

The GarderobeWizard component (~1127 lines) mixes admin configuration concerns
(physical constraints, wood selection, dimension modes, step toggling, import/export)
with the customer-facing wizard flow. This has grown unwieldy over time. The team
wants a clear separation: admin configures the product once, customer only sees
the wizard.

## Decision

**Approach A: Mode-Switcher Refactor** — a single component with a `mode` state
(`admin | preview | workflow`) driven by URL parameter. Admin accesses via
`?mode=admin`, customer sees only the clean wizard.

## Mode System

| Mode     | Trigger           | Header                          | Renders                                 |
|----------|-------------------|---------------------------------|-----------------------------------------|
| admin    | `?mode=admin`     | Mode switcher (Admin/Preview/Workflow) | All config panels                 |
| preview  | Header toggle     | Mode switcher                   | Step pipeline + phone preview + financials |
| workflow | Default (no param)| Clean Holzschneiderei header    | Customer wizard: typen -> wizard -> done |

Entry logic:
- URL has `?mode=admin` -> start in admin mode, show header toggle
- No param -> workflow mode, no toggle visible (customer experience)

## Admin Mode

Seven collapsible sections:

1. **Product Type Defaults** — set default type (Schriftzug/Bergmotiv), default motif
2. **Physical Constraints** — min/max width/height/depth, hook spacing, edge margin,
   letter width/margin. Includes hook distribution visualization.
3. **Wood Selection** — toggle which wood types are available (checkbox list)
4. **Dimension Configuration** — per-dimension: enabled toggle, mode
   (pills/combo/freetext), presets editor
5. **Wizard Steps** — toggle optional steps on/off, pipeline preview
6. **Pricing** — wood costs per type (CHF/m^2), labour rate (CHF/hr),
   base hours + per-m^2 hours, extras costs, margin multiplier
7. **Import / Export** — export/import parameter JSON

Each section is a collapsible card showing a summary when collapsed.

## Preview Mode

Three areas stacked vertically:

### Top: Interactive Step Pipeline
- Horizontal strip of step chips
- Drag-reorderable (admin sets step order)
- Each chip has on/off toggle
- Reordering updates wizard flow in real-time

### Middle: Live Customer Wizard Preview
- Phone-frame container (375px wide) showing the full customer wizard
- Clickable — admin can step through the entire flow
- Reflects all admin changes instantly

### Bottom: Financial Summary
Real-time cost breakdown:

```
Material cost:
  surfaceArea = (breite * hoehe * 2 + breite * tiefe * 2 + hoehe * tiefe * 2) / 10000 m^2
  materialCost = surfaceArea * woodCosts[selectedWood]

Labour cost:
  estimatedHours = hoursBase + (surfaceArea * hoursPerM2)
  labourCost = estimatedHours * labourRate

Extras cost:
  extrasCost = sum of extrasCosts[extra] for each selected extra

Production cost = materialCost + labourCost + extrasCost
Customer price  = productionCost * margin
```

Shows full breakdown to admin.

## Workflow Mode (Customer-Facing)

Clean wizard experience:
- `typen` phase: pick type + motif
- `wizard` phase: step through enabled steps in configured order
- `done` phase: confirmation
- Shows indicative price ("ab CHF X") in the summary step
- Respects all admin configuration

## State Architecture

Existing state (kept as-is):
- phase, constr, dimConfig, enabledSteps, wizardIndex, form, errors
- enabledHolzarten, flow, shake, navDir, animKey

New state:
- `mode`: "admin" | "preview" | "workflow" — from URL param
- `stepOrder`: string[] — reorderable step IDs (replaces computed activeSteps)
- `adminSections`: Record<string, boolean> — collapsed/expanded per section
- `pricing`:
  - woodCosts: Record<string, number> — CHF/m^2 per wood type
  - labourRate: number — CHF/hour
  - hoursBase: number — base hours for smallest size
  - hoursPerM2: number — additional hours per m^2
  - extrasCosts: Record<string, number> — flat CHF per extra
  - margin: number — multiplier (e.g. 1.8)

Key flow changes:
- `phase` is only relevant in workflow/preview modes
- In admin mode there's no phase — all config panels visible
- `stepOrder` controls sequence, `enabledSteps` controls on/off
- Config persists via import/export JSON (extended to include pricing + stepOrder)

## Component Structure

```
GarderobeWizard (main)
+-- AdminHeader          // Mode switcher pills
+-- AdminPanel           // Collapsible config sections
|   +-- AdminTypeDefaults
|   +-- AdminConstraints
|   +-- AdminWoodSelection
|   +-- AdminDimensions
|   +-- AdminSteps
|   +-- AdminPricing     // NEW
|   +-- AdminImportExport
+-- PreviewMode          // NEW
|   +-- StepPipeline     // Drag-reorderable chips with toggles
|   +-- PhoneFrame       // Phone-like container
|   |   +-- CustomerWizard
|   +-- FinancialSummary // Real-time cost breakdown
+-- CustomerWizard       // typen -> wizard -> done flow
|   +-- StepHolzart      (existing)
|   +-- StepMasse        (existing)
|   +-- StepAusfuehrung  (existing)
|   +-- StepExtras       (existing)
|   +-- StepKontakt      (existing)
|   +-- StepUebersicht   (existing, extended with indicative price)
+-- Shared (Shell, TextField, SelectField, SummaryRow, Footer, etc.)
```

All components stay in the same file (consistent with current pattern).
Existing step components reused by both customer wizard and preview.

## What's NOT changing

- Brand tokens, data arrays (holzarten, oberflaechen, etc.)
- Step component internals (StepHolzart, StepMasse, etc.)
- Validation logic
- The wizard navigation (next/prev/submit)
- Footer, Shell, shared components
- CSS-in-JS style object pattern
