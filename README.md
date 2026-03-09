# Holzschneiderei Konfigurator

Product configurator for [Holzschneiderei](https://holzschneiderei.ch) — a Swiss woodworking business. Customers configure personalized wardrobes (Garderoben) by choosing wood type, dimensions, surface finish, hooks, mountain engravings, and more.

The app runs on **Vercel** and is embedded as an **iframe** inside the Wix website.

| Environment   | URL                                          |
| ------------- | -------------------------------------------- |
| Vercel        | `holzschneiderei.vercel.app`                 |
| Customer page | `holzschneiderei.ch/garderobe-konfigurieren` |
| Admin page    | `holzschneiderei.ch/konfigurator-admin`      |

## Quick Start

```bash
npm ci
npm run dev       # Vite dev server at localhost:5173
```

Open the dev server directly — the bridge module has a **local fallback** that uses `localStorage` instead of Wix postMessage, so the configurator works standalone without the Wix iframe.

## Scripts

| Command              | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start Vite dev server                                |
| `npm run build`      | Type-check → validate config → Vite build (`dist/`)  |
| `npm run preview`    | Preview production build                             |
| `npm run typecheck`  | Run `tsc --noEmit`                                   |
| `npm run validate`   | Validate admin config schema                         |
| `npm run test`       | Open visual test harness in browser                  |
| `npm run test:unit`  | Run Vitest unit tests                                |
| `npm run check-cms`  | Check CMS contract consistency                       |
| `npm run cms:sync`   | Sync CMS data                                        |

### Build Pipeline

```
tsc --noEmit → validate-config → vite build
```

Config validation (`src/lib/validateConfig.ts`) gates ALL admin settings. If it rejects a config, the build fails.

## Tech Stack

- **React 18** with TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Vite** for dev/build
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Vitest** for unit tests
- **Playwright** for Wix editor E2E tests
- **opentype.js** for font outline extraction (engraving previews)

## Project Structure

```
src/
├── main.tsx                    # Entry point → renders <GarderobeWizard />
├── Konfigurator.tsx            # Root component, manages global state
├── bridge.ts                   # Wix iframe ↔ app communication (postMessage)
├── context/WizardContext.tsx   # React context (form, errors, limits, products)
├── data/
│   ├── constants.ts            # Steps, default form, design tokens, option arrays
│   ├── products.ts             # Product definitions (steps, constraints, pricing)
│   ├── pricing.ts              # Price calculation and constraint logic
│   ├── optionLists.ts          # Wood types, surfaces, mountains, fonts
│   └── showroom.ts             # Showroom preset configurations
├── types/
│   ├── index.ts                # Shared type definitions
│   ├── config.ts               # Config/form/pricing types
│   └── bridge.ts               # Bridge message types
├── lib/
│   ├── validateConfig.ts       # Config validation (used at build time + runtime)
│   ├── format.ts               # Formatting utilities
│   ├── fusion-script-generator.ts  # Fusion 360 script generation
│   └── fusion-templates/       # CAD template modules
├── hooks/                      # Custom React hooks
├── components/
│   ├── phases/                 # PhaseTypen → PhaseWizard → PhaseDone
│   ├── steps/                  # One component per wizard step
│   ├── admin/                  # Admin UI (pricing, products, options, etc.)
│   ├── ui/                     # Shared primitives (Shell, Fade, SelectionCard…)
│   └── showroom/               # Showroom display components
scripts/
├── validate-config.ts          # Build-time config validation
├── cms-sync.ts                 # CMS synchronization
└── check-cms-contract.ts       # CMS contract checks
tests/                          # Playwright E2E tests (Wix editor)
docs/
├── ux/                         # UX flows, journey maps, JTBD
├── plans/                      # Design docs and implementation plans
└── architecture/               # C4 diagrams, glossary
```

## Architecture

### Wizard Flow

The configurator has three **phases**:

1. **PhaseTypen** — Product selection (grouped product picker)
2. **PhaseWizard** — Step-by-step configuration (dynamic steps per product)
3. **PhaseDone** — Confirmation / submission

Each product defines its own `steps[]` array in `src/data/products.ts`, so different products can have different wizard flows.

### Wix Bridge

`src/bridge.ts` handles all communication between the iframe and the Wix parent page:

- **Outbound:** `send(type, payload)` posts messages to the parent
- **Inbound:** `listen(handlers)` subscribes to parent messages
- **Resize:** `autoResize()` keeps the iframe height in sync via `ResizeObserver`
- **Standalone mode:** When not in an iframe, all operations fall back to `localStorage`

The Wix side uses Velo page code — see `docs/wix-velo-page-code.js` and `docs/wix-velo-admin-page-code.js`.

### Data Shape Gotchas

These are easy to get wrong:

- **`bergDisplay`** is an object `{ mode, showName, showHeight, showRegion, labelFont }`, not a string
- **`texts`** values can be strings or booleans (e.g. `showHeading: false`)
- **Toggle sets** (`enabledHolzarten`, etc.) are objects `{ key: boolean }`, not arrays

## Adding a Wizard Step

1. Register in `OPTIONAL_STEPS` (`src/data/constants.ts`)
2. Add to the product's `steps[]` array (`src/data/products.ts`)
3. Create `src/components/steps/StepYourStep.tsx` with its own validation
4. Wire it in `PhaseWizard`
5. Admin picks it up automatically via `OPTIONAL_STEPS`

Product-specific steps go in `product.steps[]`. Universal steps go in `FIXED_STEP_IDS`.

## Playwright Tests

Tests interact with the **Wix editor** (not the configurator directly):

```bash
# First: authenticate with Wix (opens a browser)
npx playwright test --project=auth-setup

# Then: run editor tests (uses saved session)
npx playwright test --project=editor
```

Session is saved to `auth/wix-session.json`. Tests run headed with 120s timeout.

## Conventions

- **Language:** UI labels and many variable names are in German (`holzarten`, `oberflaechen`, `schriftarten`)
- **Config data** lives in `src/data/`, not inline in components
- **Design tokens** are the `t` object in `src/data/constants.ts`
- **Transparent background** — the app blends with the Wix site, no visible container
- **Fonts:** `FuturaLight` (100-599) and `BebasKai` (600-900) under the `'Holzschneiderei'` family, defined in `index.html`
