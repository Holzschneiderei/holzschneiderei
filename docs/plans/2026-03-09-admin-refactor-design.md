# Admin Refactor: Shared Primitives + Coverage Gaps

## Goal

Reduce duplicated UI patterns across admin components by extracting shared primitives, make AdminOptionList composable to unify all option list management, and close coverage gaps where the wizard has behavior the admin can't control.

## Approach: Composable List + Primitives

Split into two tracks:
1. Extract 6 shared UI primitives from repeated inline patterns
2. Make AdminOptionList composable via render slots, replacing bespoke components

## Shared UI Primitives

New files in `src/components/ui/`:

### SegmentedControl

Pill-button group for choosing between options. Replaces 7+ inline implementations across AdminCarousel, AdminBergDisplay, AdminShowroom, AdminDimensions, AdminTypeDefaults.

```tsx
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}
```

### ToggleRow

Label on the left, ToggleSwitch on the right. Replaces 10+ inline rows across AdminShowroom, AdminProducts, AdminDimensions.

```tsx
interface ToggleRowProps {
  label: string;
  on: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
  hint?: string;
}
```

### RangeField

Range slider with label, formatted value display, and min/max labels. Replaces 5 instances in AdminCarousel and AdminProducts.

```tsx
interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
}
```

### AdminField

Consistent label wrapper for form fields. Label above, children below. Replaces 15+ inline label+input blocks.

```tsx
interface AdminFieldProps {
  label: string;
  children: React.ReactNode;
}
```

### ImageManager

Image list with Ken Burns drift-direction buttons, delete, URL input + add, carousel preview. Replaces ~70 lines of identical code duplicated between AdminProducts and AdminShowroom.

```tsx
interface ImageManagerProps {
  images: (string | { src: string; drift: string })[];
  onChange: (images: (string | { src: string; drift: string })[]) => void;
  carousel?: CarouselConfig;
}
```

### SectionHeading

The `text-[10px] font-bold text-muted tracking-widest uppercase` label. Eliminates repeated class strings.

```tsx
interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}
```

## Composable AdminOptionList

Make AdminOptionList the universal list component for all option types.

### Interface changes

```tsx
interface AdminOptionListProps<T extends OptionItem> {
  items: T[];
  onToggle: (value: string) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;

  // Optional CRUD — features don't render when callbacks omitted
  onAdd?: (item: { label: string; meta: Record<string, unknown> }) => void;
  onRemove?: (value: string) => void;
  onUpdate?: (value: string, changes: Partial<T>) => void;

  // Render slots — composition over configuration
  renderItem?: (item: T, isActive: boolean) => React.ReactNode;
  renderMeta?: (item: T) => React.ReactNode;  // backwards compat

  addPlaceholder?: string;
  readOnly?: boolean;
}
```

Key changes:
- `onAdd`, `onRemove`, `onUpdate` become optional; UI adapts when omitted
- `renderItem` slot replaces default label rendering; list handles container (border, padding, reorder arrows, visibility toggle, delete button), caller provides inner content
- `readOnly` convenience prop equivalent to omitting all CRUD callbacks

### Replaces

- **AdminWoodSelection** (deleted): becomes `AdminOptionList` with `renderItem` showing emoji + label + description
- **Schriftarten list** in AdminTypeDefaults: becomes `AdminOptionList` with `renderItem` showing font preview cards
- **Berge list** in AdminTypeDefaults: becomes `AdminOptionList` with `renderItem` showing SVG silhouettes

### Data migration

Holzarten, schriftarten, and berge are already defined as defaults in `src/data/optionLists.ts` (`DEFAULT_HOLZARTEN`, `DEFAULT_SCHRIFTARTEN`, `DEFAULT_BERGE`). Runtime lists come from config with these as fallbacks, matching the existing pattern for oberflaechen/extras.

## Coverage Gaps to Close

### 1. Hutablage visibility toggle + default

Add `hutablage` to `CategoryVisibility`. When hidden, wizard skips the Hutablage section and uses a configurable default (Ja/Nein). Admin UI: a `ToggleRow` in the Ausfuehrung step panel within AdminStepOptions.

### 2. Step title/subtitle overrides

Extend `Texts` type:

```ts
interface Texts {
  produktwahl?: { /* existing */ };
  steps?: Record<string, { title?: string; subtitle?: string }>;
}
```

Admin UI: title/subtitle fields in each step's expanded area within AdminStepOptions. Steps use these overrides when present, falling back to hardcoded defaults.

### 3. Default values when step is skipped

New config type:

```ts
interface StepDefaults {
  [stepId: string]: Partial<FormState>;
}
```

Added to `AppConfig`. Admin UI: a "Standard-Wert" selector per optional step in AdminStepOptions, only visible when the step is disabled. E.g., Holzart step disabled shows "Standard-Holzart: [Eiche]" dropdown.

### 4. Disclaimer / legal text

Extend `Texts` type:

```ts
interface Texts {
  // ... existing
  summary?: {
    disclaimer?: string;
    priceLabel?: string;
    priceHint?: string;
    privacyUrl?: string;
    privacyLabel?: string;
  };
}
```

Admin UI: text fields in an expanded "Texte & Rechtliches" section or under the existing Produktwahl text editor.

### 5. Contact form — out of scope

Building a field schema editor is a large undertaking for minimal business value. Left for a separate project if needed.

## Component Consolidation

### Deleted

- `AdminWoodSelection` — replaced by AdminOptionList with renderItem
- `StepPipeline` — redundant with AdminStepOptions

### Significantly shrunk

| Component | Before | After | How |
|---|---|---|---|
| AdminCarousel | 128 lines | ~30 | 4x RangeField + 1x SegmentedControl |
| AdminBergDisplay | 89 lines | ~40 | SegmentedControl + AdminField |
| AdminProducts | 380 lines | ~220 | ImageManager, ToggleRow (6x), AdminField (5x) |
| AdminShowroom | 516 lines | ~300 | ImageManager, SegmentedControl (3x), ToggleRow (4x), AdminField (4x) |
| AdminProduktwahl | 105 lines | ~60 | AdminField + ToggleRow |
| AdminDimensions | 73 lines | ~50 | ToggleRow, SegmentedControl |
| AdminTypeDefaults | 142 lines | ~90 | Font/berg lists become AdminOptionList instances |

### Modified (new features)

- **AdminStepOptions** — step title/subtitle fields, "Standard-Wert" selector, hutablage category visibility
- **AdminOptionList** — renderItem slot, optional CRUD callbacks

### Unchanged

AdminGate, AdminHeader, AdminLayout, AdminWithPreview, AdminConstraints, AdminPricing, FinancialSummary, PresetWizard, AdminImportExport, AdminFusion.

### New files

6 primitives in `src/components/ui/`: SegmentedControl, ToggleRow, RangeField, AdminField, ImageManager, SectionHeading.

## Config Type Changes

Additions to `types/config.ts`:

```ts
interface Texts {
  produktwahl?: { /* existing */ };
  steps?: Record<string, { title?: string; subtitle?: string }>;
  summary?: {
    disclaimer?: string;
    priceLabel?: string;
    priceHint?: string;
    privacyUrl?: string;
    privacyLabel?: string;
  };
}

interface CategoryVisibility {
  // existing keys...
  hutablage?: boolean;
}

interface StepDefaults {
  [stepId: string]: Partial<FormState>;
}

interface AppConfig {
  // existing...
  stepDefaults?: StepDefaults;
}
```

## Net Impact

- -2 component files
- +6 primitive files
- ~375 fewer lines of duplicated code
- 4 new admin capabilities (hutablage toggle, step titles, skip defaults, legal text)
