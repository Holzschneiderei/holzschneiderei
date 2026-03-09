# TypeScript Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the entire holzschneiderei codebase from JavaScript/JSX to TypeScript/TSX for compile-time type safety — especially around config shapes that gate all admin settings.

**Architecture:** Incremental bottom-up migration. Start with shared type definitions, then data layer, libs, hooks, bridge, context, and finally components (leaves first, root last). Every phase must leave the build green. The existing `scripts/validate-config.js` build gate stays active throughout.

**Tech Stack:** TypeScript 5.x, Vite 6 (already supports TS natively), React 18, @types/react, @types/react-dom

**Total scope:** ~70 source files, ~6,600 LOC

---

## Phase 0: TypeScript Tooling Setup

### Task 0.1: Install TypeScript dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

Run:
```bash
npm install -D typescript @types/react @types/react-dom
```

**Step 2: Verify install**

Run: `npx tsc --version`
Expected: TypeScript 5.x output

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add typescript and react type definitions"
```

---

### Task 0.2: Create tsconfig.json

**Files:**
- Create: `tsconfig.json`

**Step 1: Create config**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "scripts"],
  "exclude": ["node_modules", "dist"]
}
```

Key decisions:
- `allowJs: true` — allows incremental migration (TS and JS coexist)
- `checkJs: false` — don't type-check unconverted JS files
- `strict: true` — full strictness from day one on new .ts files
- `noEmit: true` — Vite handles compilation, tsc is only for type checking

**Step 2: Verify tsc runs without errors on current JS**

Run: `npx tsc --noEmit`
Expected: 0 errors (allowJs + no checkJs means JS files are skipped)

**Step 3: Add typecheck script to package.json**

Add to scripts:
```json
"typecheck": "tsc --noEmit",
"build": "tsc --noEmit && node scripts/validate-config.js && vite build"
```

**Step 4: Verify build still works**

Run: `npm run build`
Expected: typecheck passes, validate passes, vite build succeeds

**Step 5: Commit**

```bash
git add tsconfig.json package.json
git commit -m "chore: add tsconfig.json with strict mode, wire typecheck into build"
```

---

### Task 0.3: Add Vite env types

**Files:**
- Create: `src/vite-env.d.ts`

**Step 1: Create env declaration**

```typescript
/// <reference types="vite/client" />
```

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: passes

**Step 3: Commit**

```bash
git add src/vite-env.d.ts
git commit -m "chore: add vite client type reference"
```

---

## Phase 1: Central Type Definitions

### Task 1.1: Create core config types

**Files:**
- Create: `src/types/config.ts`

**Step 1: Define all config-related interfaces**

```typescript
/* ── Value types (string unions) ── */

export type HolzartValue = "eiche" | "buche" | "esche" | "nussbaum" | "ahorn" | "arve";
export type SchriftartValue = "sans" | "serif" | "slab" | "condensed" | "rounded" | "script";
export type BergValue = "matterhorn" | "eiger" | "jungfrau" | "pilatus" | "saentis" | "titlis" | "rigi";
export type OberflaeceValue = "natur-geoelt" | "ungeoelt" | "weiss-geoelt" | "gewachst" | "lackiert" | "unbehandelt";
export type DarstellungValue = "wandmontage" | "staender-gekippt" | "staender-aufrecht";
export type HakenMatValue = "holz" | "edelstahl" | "messing" | "schwarz-metall";
export type DimMode = "pills" | "combo" | "text";
export type ShowroomLayout = "grid" | "hero" | "carousel";
export type ClickBehavior = "summary" | "wizard" | "detail";

/* ── Data structures ── */

export interface Constraints {
  MIN_W: number;
  MAX_W: number;
  MIN_H: number;
  MAX_H: number;
  MIN_D: number;
  MAX_D: number;
  HOOK_SPACING: number;
  EDGE_MARGIN: number;
  LETTER_W: number;
  LETTER_MARGIN: number;
}

export interface Pricing {
  woodCosts: Record<string, number>;
  labourRate: number;
  hoursBase: number;
  hoursPerM2: number;
  extrasCosts: Record<string, number>;
  margin: number;
}

export interface DimFieldConfig {
  enabled: boolean;
  mode: DimMode;
  presets: number[];
}

export type DimConfig = Record<string, DimFieldConfig>;

export interface Limits {
  minW: number;
  maxW: number;
  minWText: number;
  textTooLong: boolean;
  maxLetters: number;
  letters: number;
  maxHooks: number;
  maxHooksMax: number;
  maxHooksMin: number;
  hookOptions: number[];
  clampedW: number;
}

export interface PriceBreakdown {
  material: number;
  labour: number;
  extras: number;
  subtotal: number;
  total: number;
  fixed: boolean;
}

export interface FormState {
  typ: string;
  product: string;
  schriftzug: string;
  schriftart: string;
  berg: string;
  darstellung: string;
  holzart: string;
  breite: string;
  hoehe: string;
  tiefe: string;
  oberflaeche: string;
  haken: string;
  hakenmaterial: string;
  hutablage: string;
  extras: string[];
  bemerkungen: string;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
  datenschutz: boolean;
}

export interface OptionalStep {
  id: string;
  label: string;
  defaultOn: boolean;
}

/* ── Option list item (used by useOptionList / admin) ── */

export interface OptionItem {
  value: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
  meta: Record<string, unknown>;
}

/* ── Product ── */

export interface FixedPriceEntry {
  [width: string]: number;
}

export interface Product {
  id: string;
  label: string;
  desc: string;
  icon: string;
  enabled: boolean;
  comingSoon: boolean;
  teaser: string;
  steps: string[];
  optionLists: string[];
  motif: string;
  constraints: Partial<Constraints>;
  fixedPrices: Record<string, FixedPriceEntry>;
  previewImages: string[];
  sortOrder: number;
  group: string;
  groupPrimary: boolean;
  groupLabel: string;
  groupDesc: string;
  groupIcon: string;
  variantLabel: string;
  variantDesc: string;
  variantIcon: string;
}

/* ── Berg display ── */

export interface BergDisplay {
  mode: string;
  showName: boolean;
  showHeight: boolean;
  showRegion: boolean;
  labelFont: string;
}

/* ── Texts (per-section, values are strings or visibility booleans) ── */

export type TextSectionValues = Record<string, string | boolean>;
export type Texts = Record<string, TextSectionValues>;

/* ── Showroom ── */

export interface Preset {
  id: string;
  title: string;
  desc: string;
  images: string[];
  productId: string;
  formSnapshot: Partial<FormState>;
  clickBehavior: ClickBehavior;
  isBlank: boolean;
  sortOrder: number;
  enabled: boolean;
  showPrice: boolean | null;
  showSpecs: boolean | null;
  showTitle: boolean;
  showDesc: boolean;
  ctaText: string;
}

export interface Showroom {
  layout: ShowroomLayout;
  columns: number;
  showPrice: boolean;
  showSpecs: boolean;
  presets: Preset[];
}

/* ── Toggle set (e.g. { eiche: true, buche: false }) ── */

export type ToggleMap = Record<string, boolean>;

/* ── Category visibility ── */

export interface CategoryVisibility {
  holzarten: boolean;
  oberflaechen: boolean;
  extras: boolean;
  hakenMaterialien: boolean;
  darstellungen: boolean;
}

/* ── Full config blob (version 3) — what getConfig() returns ── */

export interface AppConfig {
  version: number;
  constr: Constraints;
  dimConfig: DimConfig;
  enabledHolzarten: ToggleMap;
  enabledSchriftarten: ToggleMap;
  enabledBerge: ToggleMap;
  bergDisplay: BergDisplay;
  enabledSteps: Record<string, boolean>;
  pricing: Pricing;
  stepOrder: string[];
  oberflaechenItems: OptionItem[];
  extrasItems: OptionItem[];
  hakenMatItems: OptionItem[];
  darstellungItems: OptionItem[];
  products: Product[];
  categoryVisibility: CategoryVisibility;
  fusionEnabled: boolean;
  texts: Texts;
  showroom: Showroom;
}

/* ── Validation result ── */

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };
```

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: passes (this is a standalone type file)

**Step 3: Commit**

```bash
git add src/types/config.ts
git commit -m "feat: add central TypeScript type definitions for config"
```

---

### Task 1.2: Create bridge message types

**Files:**
- Create: `src/types/bridge.ts`

**Step 1: Define message types**

```typescript
import type { AppConfig, Pricing, Constraints, FormState } from "./config";

/* ── Messages sent from iframe to parent ── */

export type OutboundMessage =
  | { channel: "holzschneiderei"; type: "ready" }
  | { channel: "holzschneiderei"; type: "resize"; height: number }
  | { channel: "holzschneiderei"; type: "step-change"; step: string; index: number; total: number }
  | { channel: "holzschneiderei"; type: "order-submit"; order: Record<string, unknown> }
  | { channel: "holzschneiderei"; type: "config-save"; config: AppConfig }
  | { channel: "holzschneiderei"; type: "save-progress"; state: Record<string, unknown> }
  | { channel: "holzschneiderei"; type: "load-progress" }
  | { channel: "holzschneiderei"; type: "clear-progress" }
  | { channel: "holzschneiderei"; type: "submit-config"; config: Record<string, unknown>; sessionId: string }
  | { channel: "holzschneiderei"; type: "request-checkout"; configId: string; price: number; summary: string }
  | { channel: "holzschneiderei"; type: "save-settings"; pricing: Pricing; constraints: Constraints };

/* ── Messages received from parent ── */

export interface InboundHandlers {
  "config-load"?: (msg: { config: AppConfig }) => void;
  "set-mode"?: (msg: { mode: string }) => void;
  "set-background"?: (msg: { color: string }) => void;
  "progress-loaded"?: (msg: { state: { form?: Partial<FormState>; phase?: string; wizardIndex?: number } }) => void;
  "admin-settings"?: (msg: { pricing?: Pricing; constraints?: Constraints }) => void;
  "settings-saved"?: (msg: Record<string, unknown>) => void;
  "config-saved"?: (msg: { success: boolean; configId?: string; error?: string }) => void;
  "checkout-ready"?: (msg: { checkoutUrl: string }) => void;
  "checkout-error"?: (msg: { error: string }) => void;
}
```

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: passes

**Step 3: Commit**

```bash
git add src/types/bridge.ts
git commit -m "feat: add typed bridge message definitions"
```

---

### Task 1.3: Create barrel export

**Files:**
- Create: `src/types/index.ts`

**Step 1: Create barrel**

```typescript
export type * from "./config";
export type * from "./bridge";
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "chore: add types barrel export"
```

---

## Phase 2: Data Layer Migration

Migrate leaf-level data files that have no React dependency. These define the shapes that everything else depends on.

### Task 2.1: Migrate `src/lib/validateConfig.js` → `.ts`

**Files:**
- Rename: `src/lib/validateConfig.js` → `src/lib/validateConfig.ts`

**Step 1: Rename and add types**

```bash
git mv src/lib/validateConfig.js src/lib/validateConfig.ts
```

Add import and return type:
```typescript
import type { ValidationResult } from "../types/config";

export default function validateConfigShape(data: unknown): ValidationResult {
  // ... body unchanged, but cast checks where needed
```

The function body uses runtime `typeof` checks which work fine in TS. The only change is the signature.

**Step 2: Run typecheck + build**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: both pass

**Step 3: Commit**

```bash
git add src/lib/validateConfig.ts
git commit -m "refactor: migrate validateConfig to TypeScript"
```

---

### Task 2.2: Migrate `src/data/constants.js` → `.ts`

**Files:**
- Rename: `src/data/constants.js` → `src/data/constants.ts`

**Step 1: Rename**

```bash
git mv src/data/constants.js src/data/constants.ts
```

**Step 2: Add type annotations**

- Import types from `../types/config`
- Annotate exported constants: `export const DEFAULT_FORM: FormState = { ... }`
- Annotate `OPTIONAL_STEPS: OptionalStep[]`
- Annotate `DEFAULT_TEXTS: Texts`
- Remove JSDoc `@typedef` blocks (replaced by TS interfaces)
- Static arrays (`holzarten`, `oberflaechen`, etc.) get `as const` or explicit type annotations

**Step 3: Run typecheck + build**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: both pass (Vite resolves .ts natively)

**Step 4: Commit**

```bash
git add src/data/constants.ts
git commit -m "refactor: migrate constants to TypeScript"
```

---

### Task 2.3: Migrate `src/data/optionLists.js` → `.ts`

**Files:**
- Rename: `src/data/optionLists.js` → `src/data/optionLists.ts`

**Step 1: Rename and type**

- Import `OptionItem` from types
- Type all `DEFAULT_*` arrays as `OptionItem[]`
- Type `toFlatItem`, `getActiveItems`, `getAllItems` function signatures

**Step 2: Run typecheck + build**

Expected: passes

**Step 3: Commit**

```bash
git add src/data/optionLists.ts
git commit -m "refactor: migrate optionLists to TypeScript"
```

---

### Task 2.4: Migrate `src/data/pricing.js` → `.ts`

**Files:**
- Rename: `src/data/pricing.js` → `src/data/pricing.ts`

**Step 1: Rename and type**

- Import `Constraints`, `Pricing`, `DimConfig`, `Limits`, `PriceBreakdown`, `FormState`, `Product` from types
- Annotate `DEFAULT_CONSTR: Constraints`, `DEFAULT_PRICING: Pricing`
- Type function signatures: `makeDefaultDimConfig(constr: Constraints): DimConfig`
- Type `computeLimits`, `computePrice`, `hooksFor`, `minWForHooks`

**Step 2: Run typecheck + build**

Expected: passes

**Step 3: Commit**

```bash
git add src/data/pricing.ts
git commit -m "refactor: migrate pricing to TypeScript"
```

---

### Task 2.5: Migrate `src/data/products.js` → `.ts`

**Files:**
- Rename: `src/data/products.js` → `src/data/products.ts`

**Step 1: Rename and type**

- Import `Product`, `FormState` from types
- Type `DEFAULT_PRODUCTS: Product[]`
- Type `getProductGroups`, `computeFixedPrice`, `getProductWidths`

**Step 2: Run typecheck + build**

Expected: passes

**Step 3: Commit**

```bash
git add src/data/products.ts
git commit -m "refactor: migrate products to TypeScript"
```

---

### Task 2.6: Migrate `src/data/showroom.js` → `.ts`

**Files:**
- Rename: `src/data/showroom.js` → `src/data/showroom.ts`

**Step 1: Rename and type**

- Import `Showroom`, `Preset`, `FormState`, `Product` from types
- Type `DEFAULT_SHOWROOM: Showroom`
- Type `createPreset(overrides?: Partial<Preset>): Preset`
- Type `hydrateForm`, `deriveSpecs`

**Step 2: Run typecheck + build**

Expected: passes

**Step 3: Commit**

```bash
git add src/data/showroom.ts
git commit -m "refactor: migrate showroom to TypeScript"
```

---

### Task 2.7: Update build validation script

**Files:**
- Modify: `scripts/validate-config.js`

**Step 1: Update imports**

After renaming data files to `.ts`, the import paths in `scripts/validate-config.js` may break because Node doesn't natively run `.ts`. Two options:
- Option A: Keep script as `.js`, use Vite's `--import` or `tsx` loader
- Option B: Rename to `.ts` and run via `npx tsx scripts/validate-config.ts`

**Recommended: Option B** — rename to `.ts` and run with `tsx`.

```bash
npm install -D tsx
git mv scripts/validate-config.js scripts/validate-config.ts
```

Update `package.json`:
```json
"validate": "tsx scripts/validate-config.ts",
"build": "tsc --noEmit && tsx scripts/validate-config.ts && vite build"
```

Add type imports in the script where helpful.

**Step 2: Run build**

Run: `npm run build`
Expected: full pipeline passes

**Step 3: Commit**

```bash
git add scripts/validate-config.ts package.json package-lock.json
git commit -m "chore: migrate validate script to TypeScript, add tsx runner"
```

---

## Phase 3: Lib Layer Migration

Pure functions with no React dependency. Easy wins.

### Task 3.1: Migrate fusion templates

**Files:**
- Rename: all 6 files in `src/lib/fusion-templates/*.js` → `.ts`

Each file exports a single pure function that takes a params object and returns a string. Add typed parameter interfaces.

**Step 1: Rename all 6 files**

```bash
git mv src/lib/fusion-templates/header.js src/lib/fusion-templates/header.ts
git mv src/lib/fusion-templates/board.js src/lib/fusion-templates/board.ts
git mv src/lib/fusion-templates/hooks.js src/lib/fusion-templates/hooks.ts
git mv src/lib/fusion-templates/shelf.js src/lib/fusion-templates/shelf.ts
git mv src/lib/fusion-templates/engraving.js src/lib/fusion-templates/engraving.ts
git mv src/lib/fusion-templates/assembly.js src/lib/fusion-templates/assembly.ts
```

**Step 2: Add parameter types to each**

Define inline interfaces for each function's params (they're all different). Return type is always `string`.

**Step 3: Run typecheck + build**

Expected: passes

**Step 4: Commit**

```bash
git add src/lib/fusion-templates/
git commit -m "refactor: migrate fusion templates to TypeScript"
```

---

### Task 3.2: Migrate svg-path-converter

**Files:**
- Rename: `src/lib/svg-path-converter.js` → `src/lib/svg-path-converter.ts`

Type the exported function signature:
```typescript
export function convertSvgPath(params: {
  svgPath: string;
  boardWidthCm: number;
  boardHeightCm: number;
  bergName: string;
}): { sketchCommands: string }
```

**Commit:** `refactor: migrate svg-path-converter to TypeScript`

---

### Task 3.3: Migrate font-outline-extractor

**Files:**
- Rename: `src/lib/font-outline-extractor.js` → `src/lib/font-outline-extractor.ts`

This file lazy-loads `opentype.js`. Add type for the dynamic import and function signature.

**Commit:** `refactor: migrate font-outline-extractor to TypeScript`

---

### Task 3.4: Migrate fusion-script-generator

**Files:**
- Rename: `src/lib/fusion-script-generator.js` → `src/lib/fusion-script-generator.ts`

Import `FormState`, `Product`, `Constraints`, `Pricing`, `PriceBreakdown` from types. Type the main export.

**Commit:** `refactor: migrate fusion-script-generator to TypeScript`

---

## Phase 4: Hooks Migration

### Task 4.1: Migrate `useToggleSet`

**Files:**
- Rename: `src/hooks/useToggleSet.js` → `src/hooks/useToggleSet.ts`

```typescript
import type { ToggleMap, OptionItem } from "../types/config";

interface UseToggleSetReturn {
  enabled: ToggleMap;
  setEnabled: React.Dispatch<React.SetStateAction<ToggleMap>>;
  active: OptionItem[];
  toggle: (value: string) => void;
}

export default function useToggleSet(
  items: OptionItem[],
  formValue: string,
  onFallback: (first: string) => void,
): UseToggleSetReturn
```

**Commit:** `refactor: migrate useToggleSet to TypeScript`

---

### Task 4.2: Migrate `useOptionList`

**Files:**
- Rename: `src/hooks/useOptionList.js` → `src/hooks/useOptionList.ts`

Import `OptionItem`, `ToggleMap` from types. Type all return values. This is the most complex hook — pay attention to the `addItem`, `removeItem`, `updateItem`, `reorderItems` signatures.

**Commit:** `refactor: migrate useOptionList to TypeScript`

---

### Task 4.3: Migrate `useConfigManager`

**Files:**
- Rename: `src/hooks/useConfigManager.js` → `src/hooks/useConfigManager.ts`

Import `AppConfig`, `ValidationResult` and all state types. Define a `ConfigManagerParams` interface for the massive props object. This is where the AppConfig type pays off — `getConfig()` returns `AppConfig`, `applyConfig()` accepts `Partial<AppConfig>`.

**Commit:** `refactor: migrate useConfigManager to TypeScript`

---

## Phase 5: Bridge & Context

### Task 5.1: Migrate `bridge.js` → `bridge.ts`

**Files:**
- Rename: `src/bridge.js` → `src/bridge.ts`

Import `InboundHandlers` from types. Type:
- `send(type: string, payload?: Record<string, unknown>): void`
- `listen(handlers: InboundHandlers): () => void`
- `autoResize(): () => void`
- All other exported functions

The localStorage fallback functions also get typed.

**Commit:** `refactor: migrate bridge to TypeScript`

---

### Task 5.2: Migrate `WizardContext.jsx` → `.tsx`

**Files:**
- Rename: `src/context/WizardContext.jsx` → `src/context/WizardContext.tsx`

Define `WizardContextValue` interface using imports from types. Type the context as `React.createContext<WizardContextValue | null>(null)` and the `useWizard()` hook with a null guard.

**Commit:** `refactor: migrate WizardContext to TypeScript`

---

## Phase 6: UI Components (leaves)

These are small, stateless components. Migrate all 18 in a batch.

### Task 6.1: Migrate simple UI components (batch)

**Files:**
- Rename all `src/components/ui/*.jsx` → `*.tsx`

For each component, define a `Props` interface and add it to the function signature. Most are trivial (3-60 lines).

Batch order (by dependency — no inter-component deps):
1. `Shell.tsx` — 7 lines
2. `Fade.tsx` — 3 lines
3. `PhoneFrame.tsx` — 12 lines
4. `StepHeader.tsx` — 8 lines
5. `SummaryRow.tsx` — 8 lines
6. `CheckBadge.tsx` — 19 lines
7. `TextField.tsx` — 26 lines
8. `SelectField.tsx` — 18 lines
9. `ToggleSwitch.tsx` — 55 lines
10. `VisibilityToggle.tsx` — 27 lines
11. `FlowPicker.tsx` — 24 lines
12. `CollapsibleSection.tsx` — 23 lines
13. `SelectionCard.tsx` — 41 lines
14. `ImageCarousel.tsx` — 58 lines
15. `SideRail.tsx` — 56 lines
16. `ErrorBoundary.tsx` — 58 lines (class component, needs special handling)

**Strategy:** Do 4-5 at a time, typecheck, commit. Don't do all 16 in one go.

**Commit pattern:** `refactor: migrate ui components (batch N) to TypeScript`

---

## Phase 7: Step Components

### Task 7.1: Migrate step components (batch)

**Files:**
- Rename all `src/components/steps/*.jsx` → `*.tsx`

All step components use `useWizard()` context and take no props. Migration is mostly mechanical: rename, fix any implicit `any` from context destructuring.

Order:
1. `StepHolzart.tsx` — 46 lines
2. `StepDarstellung.tsx` — 39 lines
3. `StepExtras.tsx` — 43 lines
4. `StepKontakt.tsx` — 39 lines
5. `StepMotiv.tsx` — 97 lines
6. `StepAusfuehrung.tsx` — 71 lines
7. `StepMasse.tsx` — 131 lines
8. `StepUebersicht.tsx` — 86 lines

**Commit pattern:** `refactor: migrate step components to TypeScript`

---

## Phase 8: Phase Components

### Task 8.1: Migrate phase components

**Files:**
- Rename: `src/components/phases/PhaseDone.jsx` → `.tsx`
- Rename: `src/components/phases/PhaseTypen.jsx` → `.tsx`
- Rename: `src/components/phases/PhaseWizard.jsx` → `.tsx`

These have explicit props. Define `Props` interfaces. `PhaseTypen` (228 lines) is the largest and imports ShowroomGrid — migrate PhaseDone first, then PhaseWizard, then PhaseTypen.

**Commit pattern:** `refactor: migrate phase components to TypeScript`

---

## Phase 9: Admin Components

The largest batch (21 files, ~2,700 lines). Migrate in dependency order.

### Task 9.1: Migrate standalone admin components

**Files (no inter-admin deps):**
- `AdminHeader.tsx` — 55 lines
- `AdminImportExport.tsx` — 32 lines
- `AdminPricing.tsx` — 66 lines
- `AdminConstraints.tsx` — 121 lines
- `AdminDimensions.tsx` — 61 lines
- `AdminWoodSelection.tsx` — 29 lines
- `AdminBergDisplay.tsx`
- `AdminProduktwahl.tsx` — 89 lines
- `AdminFusion.tsx` — 142 lines
- `FinancialSummary.tsx` — 71 lines
- `StepPipeline.tsx` — 104 lines

**Commit:** `refactor: migrate standalone admin components to TypeScript`

---

### Task 9.2: Migrate admin components with dependencies

**Files (depend on other admin components):**
- `AdminOptionList.tsx` — 133 lines
- `AdminSteps.tsx` — 88 lines (uses StepPipeline)
- `AdminOptions.tsx` — 144 lines (uses AdminOptionList, AdminWoodSelection)
- `AdminProducts.tsx` — 346 lines
- `PresetWizard.tsx` — 228 lines
- `AdminShowroom.tsx` — 478 lines (uses PresetWizard)
- `ShowroomGrid.tsx` — 233 lines

**Commit:** `refactor: migrate complex admin components to TypeScript`

---

### Task 9.3: Migrate admin layout components

**Files:**
- `AdminLayout.tsx` — 211 lines
- `AdminWithPreview.tsx` — 215 lines (uses AdminLayout + all admin panels)
- `AdminTypeDefaults.tsx` — 129 lines

**Commit:** `refactor: migrate admin layout components to TypeScript`

---

## Phase 10: Root Components

### Task 10.1: Migrate Konfigurator.jsx → .tsx

**Files:**
- Rename: `src/Konfigurator.jsx` → `src/Konfigurator.tsx`

This is the 601-line root component with all state. This is the hardest file. All state variables should now match the types defined in Phase 1. The `listen()` handler map gets typed via `InboundHandlers`.

**Step 1: Rename**

```bash
git mv src/Konfigurator.jsx src/Konfigurator.tsx
```

**Step 2: Add types**

- All `useState` calls get explicit generics: `useState<FormState>(DEFAULT_FORM)`
- `useRef` calls get types: `useRef<{ getConfig: () => AppConfig; applyConfig: (d: unknown) => ValidationResult } | null>(null)`
- The big `listen()` handler object gets checked against `InboundHandlers`

**Step 3: Iterate on type errors**

This file will likely produce the most type errors. Fix them one by one. Every error here is a potential runtime bug caught.

**Step 4: Run typecheck + build**

Expected: passes

**Step 5: Commit**

```bash
git add src/Konfigurator.tsx
git commit -m "refactor: migrate Konfigurator root component to TypeScript"
```

---

### Task 10.2: Migrate main.jsx → .tsx

**Files:**
- Rename: `src/main.jsx` → `src/main.tsx`
- Modify: `index.html` — update script src from `main.jsx` to `main.tsx`

This is 13 lines. Trivial.

**Commit:** `refactor: migrate main entry point to TypeScript`

---

## Phase 11: Cleanup & Hardening

### Task 11.1: Remove allowJs, enable strict checks

**Files:**
- Modify: `tsconfig.json`

**Step 1: Remove allowJs**

```json
"allowJs": false
```

Run: `npx tsc --noEmit`

If any `.js` files remain in `src/`, this will surface them. Fix or convert.

**Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: disable allowJs — full TypeScript migration complete"
```

---

### Task 11.2: Remove stale JSDoc type annotations

**Files:**
- Modify: All migrated files that still have `@typedef`, `@param`, `@returns` JSDoc

Search and remove — the TS types replace them.

**Commit:** `chore: remove stale JSDoc type annotations`

---

### Task 11.3: Migrate vite.config.js → .ts (optional)

**Files:**
- Rename: `vite.config.js` → `vite.config.ts`

Vite supports this natively. Trivial change.

**Commit:** `chore: migrate vite config to TypeScript`

---

### Task 11.4: Final verification

**Step 1:** Run full pipeline

```bash
npx tsc --noEmit
npm run validate
npm run build
```

**Step 2:** Verify no `.js`/`.jsx` files remain in `src/`

```bash
find src/ -name "*.js" -o -name "*.jsx"
```

Expected: empty (only `.ts` and `.tsx`)

**Step 3:** Run dev server and manually test admin + workflow mode

**Step 4:** Final commit

```bash
git commit -m "chore: typescript migration complete"
```

---

## Migration Summary

| Phase | Files | Estimated Steps | Risk |
|-------|-------|----------------|------|
| 0. Setup | 3 | 8 | Low |
| 1. Types | 3 | 6 | Low |
| 2. Data | 7 | 14 | Low |
| 3. Libs | 10 | 12 | Low |
| 4. Hooks | 3 | 6 | Medium |
| 5. Bridge/Context | 2 | 4 | Medium |
| 6. UI Components | 16 | 8 | Low |
| 7. Steps | 8 | 4 | Low |
| 8. Phases | 3 | 4 | Medium |
| 9. Admin | 21 | 12 | Medium |
| 10. Root | 2 | 6 | High |
| 11. Cleanup | 4 | 6 | Low |
| **Total** | **~70** | **~90** | |

**Critical path:** Phase 1 (types) → Phase 2 (data) → Phase 4 (hooks) → Phase 10 (Konfigurator.tsx)

**Highest risk:** Task 10.1 (Konfigurator.tsx) — 601 lines, all state, all wiring. Do this carefully.

**Key invariant:** `npm run build` must pass after every commit. The build pipeline runs: `tsc --noEmit` → `validate-config` → `vite build`.

---

## Appendix: Items Surfaced During Code Smell Fixes (2026-03-09)

These items were identified during the `fix/code-smells` branch work and would benefit from TS migration:

- **CS-08**: `PresetWizard` uses static `holzarten`, `oberflaechen`, etc. from constants instead of admin-configured lists. With TS, the `WizardContext` type would enforce that active option lists are always provided, making it obvious when PresetWizard receives stale data.
- **CS-11**: Validation logic for all wizard steps lives in `Konfigurator.jsx:validate()` instead of per-step. A `StepValidator<T>` type could enforce that each step component exports its own validation function.
- **CS-12**: Half-finished migration from `useToggleSet` to `useOptionList`. TS interfaces for both hooks would make the incompatible APIs obvious and guide unification.
- **CS-14**: `useConfigManager` accepts 28 individual props. A `ConfigState` type would let it accept a single typed object instead.
- **CS-17**: `DEFAULT_CONSTR` values don't match any real product constraints. A `Constraints` type shared between pricing.ts and products.ts would surface this.
- **CS-37**: `DimModeValue` typedef declared independently in both `constants.js` and `pricing.js`. TS migration naturally solves this with a single shared type.
- **CS-28**: `SideRail` imports `computePrice` (business logic in UI primitive). With TS, the component's props type would make it clear that price should be passed pre-computed.
- **CS-13**: Product type inference (`getTypForProduct`) — a `ProductMotif` discriminated union would replace the fragile `motif === "schriftzug" || id === "schriftzug"` pattern.
