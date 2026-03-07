# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Holzschneiderei** is a React-based product configurator (Garderobe/wardrobe wizard) for a Swiss woodworking business. It is **hosted on Vercel** and runs as an **iframe widget embedded in a Wix website** at [holzschneiderei.ch](https://holzschneiderei.ch). The configurator lets customers choose wood type, surface finish, dimensions, hooks, extras, mountain silhouette engravings, and fonts for personalized wardrobes.

### Deployment & URLs

- **Vercel project:** `holzschneiderei` (team: `tweakchs-projects`)
- **Vercel domain:** `holzschneiderei.vercel.app`
- **Customer page:** `https://holzschneiderei.ch/garderobe-konfigurieren`
- **Admin page:** `https://holzschneiderei.ch/konfigurator-admin`

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build (output in `dist/`)
- `npm run preview` — Preview production build locally
- `npx playwright test --project=auth-setup` — Run Wix auth setup (interactive, non-headless)
- `npx playwright test --project=editor` — Run editor tests (requires prior auth setup)

No linter or unit test framework is configured.

## Architecture

### App Structure (src/)

- **`main.jsx`** — Entry point. Renders `<GarderobeWizard />` into `#root`.
- **`Konfigurator.jsx`** — Root component. Manages global state (phase, form, pricing, stepOrder, products) and wires everything together. Imports all phase/step/admin components.
- **`konfigurator.css`** — Styles for the configurator.
- **`bridge.js`** — Wix iframe communication layer. Provides `send()`, `listen()`, and `autoResize()` for postMessage-based parent/child communication on the `"holzschneiderei"` channel.
- **`context/WizardContext.jsx`** — React context that exposes `form`, `set`, `errors`, `limits`, `constr`, `products` to all child components.
- **`data/constants.js`** — `OPTIONAL_STEPS`, `FIXED_STEP_IDS`, `DEFAULT_FORM`, design tokens (`t`), and static option arrays.
- **`data/products.js`** — `DEFAULT_PRODUCTS` array. Each product defines its own `steps[]`, `optionLists[]`, `constraints`, and `fixedPrices` table. `getProductGroups()` builds the grouped product picker.
- **`data/pricing.js`** — Pricing and constraint logic.
- **`components/phases/`** — Top-level phases: `PhaseTypen` (product selection), `PhaseWizard` (step-by-step config), `PhaseDone`.
- **`components/steps/`** — One component per wizard step: `StepHolzart`, `StepMasse`, `StepAusfuehrung`, `StepExtras`, `StepKontakt`, `StepUebersicht`.
- **`components/admin/`** — Admin UI components (`AdminSteps`, `AdminPricing`, `AdminProducts`, `AdminOptionList`, etc.).
- **`components/ui/`** — Shared UI primitives (`Shell`, `Fade`, `SelectionCard`, `PhoneFrame`).

### Wix Integration

The app is embedded as an iframe in a Wix site. The bridge module handles:
- Sending configuration data and resize events to the Wix parent
- Listening for messages from Wix (e.g., theme/settings)
- Auto-resizing the iframe to fit content

### Fonts

Custom fonts are defined in `index.html` via `@font-face`:
- `FuturaLight.otf` (weight 100-599)
- `BebasKai.otf` (weight 600-900)
Both served from `/fonts/` directory under the family name `'Holzschneiderei'`.

### Playwright Tests (tests/)

Automated tests for interacting with the Wix editor. Two projects:
- **auth-setup** — Logs into Wix and saves session to `auth/wix-session.json`
- **editor** — Opens the Wix editor using saved session state

Tests run non-headless (headed browser) with 120s timeout.

## Key Conventions

- Language: German (UI labels, variable names like `holzarten`, `oberflaechen`, `schriftarten`)
- Configuration data lives in `src/data/` (constants, products, pricing), not inline in `Konfigurator.jsx`
- Design tokens/colors are defined as a `t` object in `src/data/constants.js`
- The app uses transparent background to blend with the Wix site

## Wizard Extension Pattern

### Neuen Wizard-Schritt hinzufügen

Wenn der PO einen neuen Schritt im Wizard-Ablauf fordert (z.B. Schriftzug-Konfiguration als eigener Schritt nach Produktwahl), **immer ins bestehende Schritt-System einhängen** — nicht PhaseTypen aufblähen oder neue Phasen erfinden.

**Checkliste:**

1. **`src/data/constants.js`** — Schritt in `OPTIONAL_STEPS` registrieren:
   ```js
   { id: "mein-schritt", label: "Mein Schritt", defaultOn: true }
   ```

2. **`src/data/products.js`** — Betroffene Produkte erhalten den Schritt in ihrem `steps[]`-Array an der richtigen Position:
   ```js
   steps: ["mein-schritt", "holzart", "masse", ...]
   ```

3. **`src/components/steps/StepMeinSchritt.jsx`** — Neue Step-Komponente erstellen. Validierung gehört in den Step selbst.

4. **`PhaseWizard`** — Step-Komponente für die neue `step.id` einbinden.

5. **Admin** — `AdminSteps`/`StepPipeline` kennt den neuen Step automatisch via `OPTIONAL_STEPS`. Nur Label/Icon manuell ergänzen falls nötig.

6. **`PhaseTypen`** — Entfernen was in den neuen Step wandert. `handleWeiter` validiert danach nur noch die Produktwahl.

7. **Doku** — `docs/ux/garderobe-konfigurator-flow.md` und `journey.md` anpassen.

**Faustregel:** Wenn ein Schritt produkt-spezifisch ist (nur für Schriftzug-Produkte relevant), gehört er in `product.steps[]`, nicht in `OPTIONAL_STEPS`. Wenn er für alle Produkte gilt, in `FIXED_STEP_IDS`.
