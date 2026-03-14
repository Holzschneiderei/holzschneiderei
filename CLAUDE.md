# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Holzschneiderei** is a React + TypeScript product configurator (Garderobe/wardrobe wizard) for a Swiss woodworking business. It is **hosted on Vercel** and runs as an **iframe widget embedded in a Wix website** at [holzschneiderei.ch](https://holzschneiderei.ch). The configurator lets customers choose wood type, surface finish, dimensions, hooks, extras, mountain silhouette engravings, and fonts for personalized wardrobes.

### Deployment & URLs

- **Vercel project:** `holzschneiderei` (team: `tweakchs-projects`)
- **Vercel domain:** `holzschneiderei.vercel.app`
- **Customer page:** `https://holzschneiderei.ch/garderobe-konfigurieren`
- **Admin page:** `https://holzschneiderei.ch/konfigurator-admin`

## Tech Stack

- **React 18** + **TypeScript 5** (strict, `tsc --noEmit` on build)
- **Vite 6** bundler, **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Biome** linter (`npm run lint`)
- **Vitest** unit tests (`npm run test:unit`), test files in `src/data/__tests__/` and `src/lib/__tests__/`
- **Playwright** for Wix editor integration tests
- **Vercel** hosting with serverless API functions (`api/`)

## Commands

- `npm run dev` — Start Vercel dev server (includes serverless `api/` functions)
- `npm run build` — Typecheck + config validation + Vite production build (output in `dist/`)
- `npm run preview` — Preview production build locally
- `npm run typecheck` — Run `tsc --noEmit`
- `npm run validate` — Run `tsx scripts/validate-config.ts`
- `npm run lint` — Run Biome linter on `src/`
- `npm run test:unit` — Run Vitest unit tests
- `npm run test` — Open visual test harness (`harness.html`)
- `npm run check-cms` — Validate CMS contract (`scripts/check-cms-contract.ts`)
- `npm run cms:sync` — Sync CMS data (`scripts/cms-sync.ts`)
- `npx playwright test --project=auth-setup` — Run Wix auth setup (interactive, non-headless)
- `npx playwright test --project=editor` — Run editor tests (requires prior auth setup)

## Architecture

### App Structure (src/)

- **`main.tsx`** — Entry point. Wraps `<GarderobeWizard />` in `<StrictMode>` and `<ErrorBoundary>`, renders into `#root`.
- **`Konfigurator.tsx`** — Root component (`GarderobeWizard`). Reads cached CMS config from localStorage, initialises `useWizardState` and `useAdminState` hooks, then delegates to `<AdminMode>` or `<WorkflowMode>`.
- **`konfigurator.css`** — Global styles for the configurator.

#### Bridge (Wix iframe communication)

- **`bridge.ts`** — postMessage layer on the `"holzschneiderei"` channel. Exports: `send()`, `listen()`, `autoResize()`, `saveProgress()`, `loadProgress()`, `clearProgress()`, `submitConfig()`, `requestCheckout()`, `saveSettings()`. Falls back to localStorage when not running inside an iframe.

#### Context

- **`context/WizardContext.tsx`** — React context (`WizardProvider` / `useWizard()`) exposing ~30 fields: `form`, `set`, `setFieldError`, `errors`, `limits`, `constr`, `dimConfig`, `pricing`, `toggleExtra`, `skippedSteps`, `activeHolzarten`, `activeSchriftarten`, `activeBerge`, `bergDisplay`, `activeOberflaechen`, `activeExtras`, `activeHakenMat`, `activeDarstellungen`, `activeProduct`, `products`, `categoryVisibility`, `fusionEnabled`, `isAdmin`, `texts`, `showroom`, `carousel`, and more.

#### Data Layer (src/data/)

- **`constants.ts`** — `OPTIONAL_STEPS`, `FIXED_STEP_IDS`, `DEFAULT_FORM`, `DEFAULT_TEXTS`, `DEFAULT_CAROUSEL`, `FLOWS`, `DIM_FIELDS`, `DIM_MODES`, and brand tokens (`t`).
- **`optionLists.ts`** — Default option arrays (`DEFAULT_HOLZARTEN`, `DEFAULT_OBERFLAECHEN`, `DEFAULT_EXTRAS_OPTIONS`, `DEFAULT_HAKEN_MATERIALIEN`, `DEFAULT_BERGE`, `DEFAULT_SCHRIFTARTEN`, `DEFAULT_DARSTELLUNGEN`) plus helpers `toFlatItem()`, `getActiveItems()`, `getAllItems()`.
- **`products.ts`** — `DEFAULT_PRODUCTS` array. Each product defines `steps[]`, `optionLists[]`, `constraints`, and `fixedPrices`. `getProductGroups()` builds the grouped product picker.
- **`pricing.ts`** — Pricing, constraint logic, `computePrice()`, `computeLimits()`, `DEFAULT_PRICING`, `DEFAULT_CONSTR`.
- **`showroom.ts`** — Showroom data and `hydrateForm()` utility.

#### Types (src/types/)

- **`config.ts`** — All domain types: `FormState`, `Product`, `Constraints`, `Pricing`, `Limits`, `OptionalStep`, `BrandTokens`, `DimConfig`, `Texts`, `Showroom`, `CarouselConfig`, etc.
- **`bridge.ts`** — `InboundHandlers` type for bridge message handling.
- **`index.ts`** — Re-exports.

#### Custom Hooks (src/hooks/)

- **`useWizardState.ts`** — Central state hook: phase, form, pricing, products, steps, option lists, CMS config loading — returns `UseWizardStateReturn`.
- **`useAdminState.ts`** — Admin-specific state: active section, panel/step mapping — returns `UseAdminStateReturn`.
- **`useConfigManager.ts`** — Config persistence/loading logic.
- **`useOptionList.ts`** — Generic option list management (add/remove/toggle items).
- **`useToggleSet.ts`** — Set-based toggle state helper.

#### Lib / Utilities (src/lib/)

- **`format.ts`** — Formatting helpers.
- **`validateConfig.ts`** — Config validation logic.
- **`fusion-script-generator.ts`** — Generates Fusion 360 scripts from configuration.
- **`fusion-templates/`** — Fusion script templates.
- **`font-outline-extractor.ts`** — Extracts font outlines using opentype.js.
- **`svg-path-converter.ts`** — SVG path conversion utilities.
- **`carouselUtils.ts`** — Image carousel helpers.

#### Components

- **`components/WorkflowMode.tsx`** — Customer-facing mode. Wraps phases in `WizardProvider` + `Shell`.
- **`components/AdminMode.tsx`** — Admin mode. Lazy-loads 15+ admin panels via `React.lazy()`.

##### Phases (components/phases/)

- **`PhaseTypen.tsx`** — Product selection phase.
- **`PhaseWizard.tsx`** — Step-by-step configuration wizard.
- **`PhaseDone.tsx`** — Confirmation / completion phase.

##### Steps (components/steps/)

One component per wizard step:
- `StepMotiv` — Lettering / mountain motif configuration
- `StepHolzart` — Wood type selection
- `StepMasse` — Dimensions (width, height, depth)
- `StepAusfuehrung` — Surface finish, hooks, hat shelf
- `StepExtras` — Mirror, shoe rack, custom notes
- `StepDarstellung` — Presentation style (wall mount / stand)
- `StepKontakt` — Customer contact form
- `StepUebersicht` — Order summary / review

##### Admin (components/admin/)

20+ admin components including: `AdminGate`, `AdminHeader`, `AdminLayout`, `AdminWithPreview`, `AdminProducts`, `AdminProduktwahl`, `AdminSteps`, `AdminStepOptions`, `AdminTypeDefaults`, `AdminOptionList`, `AdminOptions`, `AdminPricing`, `AdminConstraints`, `AdminDimensions`, `AdminBergDisplay`, `AdminCarousel`, `AdminShowroom`, `AdminFusion`, `AdminImportExport`, `FinancialSummary`, `PresetWizard`.

##### Showroom (components/showroom/)

- `ShowroomGrid.tsx` — Showroom product gallery.

##### UI Primitives (components/ui/)

24 shared components: `Shell`, `Fade`, `SelectionCard`, `PhoneFrame`, `ErrorBoundary`, `ConfigSkeleton`, `ImageCarousel`, `ImageManager`, `FlowPicker`, `SideRail`, `StepHeader`, `SectionHeading`, `CollapsibleSection`, `PropertyTabs`, `SegmentedControl`, `ToggleRow`, `ToggleSwitch`, `VisibilityToggle`, `CheckBadge`, `AdminField`, `TextField`, `SelectField`, `RangeField`, `SummaryRow`.

### Serverless API (api/)

Vercel serverless functions:
- `auth.js` / `auth-verify.js` — Wix authentication
- `fusion-status.js` / `fusion-test.js` — Fusion 360 integration status
- `send-script.js` — Send generated Fusion scripts

### Build Scripts (scripts/)

- `validate-config.ts` — Config validation (runs during `npm run build`)
- `check-cms-contract.ts` — CMS contract checking
- `cms-sync.ts` — CMS data synchronisation

### Wix Integration

The app is embedded as an iframe in a Wix site. The bridge module handles:
- Sending configuration data and resize events to the Wix parent
- Listening for messages from Wix (e.g., theme/settings, progress restore)
- Auto-resizing the iframe to fit content
- Progress save/load for session continuity
- Config submission and checkout flow
- Local localStorage fallback when running outside the iframe

Related Wix Velo code lives in `velo-code/` and `docs/` (migration guides, backend events, page code).

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
- All source files are TypeScript (`.ts` / `.tsx`)
- Configuration data lives in `src/data/` (constants, optionLists, products, pricing, showroom)
- Domain types live in `src/types/`
- Custom hooks live in `src/hooks/`; utility functions in `src/lib/`
- Design tokens/colors are defined as a `t` object in `src/data/constants.ts`
- Admin components are lazy-loaded via `React.lazy()` in `AdminMode.tsx`
- The app uses transparent background to blend with the Wix site
- Tailwind CSS v4 for utility styling

## Wizard Extension Pattern

### Neuen Wizard-Schritt hinzufügen

Wenn der PO einen neuen Schritt im Wizard-Ablauf fordert (z.B. Schriftzug-Konfiguration als eigener Schritt nach Produktwahl), **immer ins bestehende Schritt-System einhängen** — nicht PhaseTypen aufblähen oder neue Phasen erfinden.

**Checkliste:**

1. **`src/data/constants.ts`** — Schritt in `OPTIONAL_STEPS` registrieren:
   ```ts
   { id: "mein-schritt", label: "Mein Schritt", defaultOn: true }
   ```

2. **`src/data/products.ts`** — Betroffene Produkte erhalten den Schritt in ihrem `steps[]`-Array an der richtigen Position:
   ```ts
   steps: ["mein-schritt", "holzart", "masse", ...]
   ```

3. **`src/components/steps/StepMeinSchritt.tsx`** — Neue Step-Komponente erstellen. Validierung gehört in den Step selbst.

4. **`PhaseWizard`** — Step-Komponente für die neue `step.id` einbinden.

5. **Admin** — `AdminSteps`/`StepPipeline` kennt den neuen Step automatisch via `OPTIONAL_STEPS`. Nur Label/Icon manuell ergänzen falls nötig.

6. **`PhaseTypen`** — Entfernen was in den neuen Step wandert. `handleWeiter` validiert danach nur noch die Produktwahl.

7. **Doku** — `docs/ux/garderobe-konfigurator-flow.md` und `journey.md` anpassen.

**Faustregel:** Wenn ein Schritt produkt-spezifisch ist (nur für Schriftzug-Produkte relevant), gehört er in `product.steps[]`, nicht in `OPTIONAL_STEPS`. Wenn er für alle Produkte gilt, in `FIXED_STEP_IDS`.
