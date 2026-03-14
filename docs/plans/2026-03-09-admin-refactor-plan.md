# Admin Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract shared UI primitives, make AdminOptionList composable, migrate holzarten/schriftarten/berge to full CRUD, close admin coverage gaps.

**Architecture:** Composition-based approach. 6 new UI primitives replace repeated inline patterns. AdminOptionList gains a `renderItem` slot for custom item rendering. Holzarten/schriftarten/berge migrate from `useToggleSet` (toggle-only) to `useOptionList` (full CRUD). Config type extended for hutablage, step titles, skip defaults, legal text.

**Tech Stack:** React 18, TypeScript, Tailwind CSS classes (inline), Vite, Vitest (for pure function tests only — no component test infrastructure exists).

**Testing note:** Only `src/data/__tests__/` and `src/lib/__tests__/` have tests (pure functions). No component testing setup. UI changes verified visually via `npm run dev`.

---

## Task 1: SegmentedControl primitive

**Files:**
- Create: `src/components/ui/SegmentedControl.tsx`

**Step 1: Create the component**

```tsx
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export default function SegmentedControl<T extends string>({
  options, value, onChange, size = 'md',
}: SegmentedControlProps<T>) {
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  return (
    <div className="flex rounded-sm border border-border overflow-hidden bg-field">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-center py-1.5 ${textSize} font-bold font-body border-none cursor-pointer transition-colors ${
            value === opt.value
              ? 'bg-brand text-white'
              : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

Extract the type so it can be imported: `export type { SegmentedControlProps }`.

**Step 2: Verify visually**

Run: `npm run dev` — no visual change yet, just confirm no build errors.

**Step 3: Commit**

```
feat(ui): add SegmentedControl primitive
```

---

## Task 2: ToggleRow primitive

**Files:**
- Create: `src/components/ui/ToggleRow.tsx`

**Step 1: Create the component**

```tsx
import ToggleSwitch from './ToggleSwitch';

interface ToggleRowProps {
  label: string;
  on: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
  hint?: string;
}

export default function ToggleRow({ label, on, onChange, size = 'sm', hint }: ToggleRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-text">{label}</span>
        <ToggleSwitch on={on} onChange={onChange} size={size} />
      </div>
      {hint && <div className="text-[10px] text-muted mt-0.5">{hint}</div>}
    </div>
  );
}
```

**Step 2: Commit**

```
feat(ui): add ToggleRow primitive
```

---

## Task 3: RangeField, AdminField, SectionHeading primitives

**Files:**
- Create: `src/components/ui/RangeField.tsx`
- Create: `src/components/ui/AdminField.tsx`
- Create: `src/components/ui/SectionHeading.tsx`

**Step 1: Create RangeField**

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

export default function RangeField({ label, value, onChange, min, max, step, format, minLabel, maxLabel }: RangeFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-semibold text-text">{label}</label>
        <span className="text-[11px] text-muted">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-brand cursor-pointer"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create AdminField**

```tsx
interface AdminFieldProps {
  label: string;
  children: React.ReactNode;
}

export default function AdminField({ label, children }: AdminFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
```

**Step 3: Create SectionHeading**

```tsx
interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionHeading({ children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`text-[10px] font-bold text-muted tracking-widest uppercase ${className}`}>
      {children}
    </div>
  );
}
```

**Step 4: Commit**

```
feat(ui): add RangeField, AdminField, SectionHeading primitives
```

---

## Task 4: ImageManager primitive

**Files:**
- Create: `src/components/ui/ImageManager.tsx`
- Reference: `src/components/admin/AdminProducts.tsx:124-205` (source pattern)
- Reference: `src/components/admin/AdminShowroom.tsx:411-487` (duplicate pattern)

**Step 1: Create the component**

Extract the shared image list + drift direction + add-via-URL pattern from AdminProducts and AdminShowroom. The component needs:

- `images` prop: `(string | CarouselImage)[]`
- `onChange` callback: receives updated images array
- `carousel` prop (optional): for live preview via `ImageCarousel`
- Internal state: `newUrl` for the URL input

Use `normalizeImage` from `src/lib/carouselUtils.ts` for parsing.

The drift direction buttons: left/right/up/down arrows (`←→↑↓`), each 5x5px, active = `bg-brand text-white border-brand`.

The add row: URL input + "+" button, same pattern as current code.

Include the `ImageCarousel` preview above the list when images exist.

**Step 2: Commit**

```
feat(ui): add ImageManager primitive
```

---

## Task 5: Refactor AdminCarousel to use primitives

**Files:**
- Modify: `src/components/admin/AdminCarousel.tsx`

**Step 1: Replace all 4 range sliders with RangeField**

Current lines 24-105 become 4 `RangeField` instances:

```tsx
<RangeField label="Slide-Dauer" value={carousel.interval} onChange={(v) => update("interval", v)}
  min={3000} max={20000} step={1000} format={(v) => `${(v/1000).toFixed(0)}s`}
  minLabel="3s" maxLabel="20s" />
```

Same pattern for driftDuration, fadeDuration, zoom.

**Step 2: Replace aspect ratio picker with SegmentedControl**

Current lines 108-125 become:

```tsx
<AdminField label="Seitenverhältnis">
  <SegmentedControl options={aspectOptions} value={carousel.aspectRatio} onChange={(v) => update("aspectRatio", v)} />
</AdminField>
```

**Step 3: Verify visually** — admin carousel section should look identical.

**Step 4: Commit**

```
refactor(admin): use RangeField + SegmentedControl in AdminCarousel
```

---

## Task 6: Refactor AdminBergDisplay to use primitives

**Files:**
- Modify: `src/components/admin/AdminBergDisplay.tsx`

**Step 1: Replace mode picker (lines 16-24) with SegmentedControl**

**Step 2: Replace label toggles (lines 54-70) — keep as-is**

These are checkbox-style cards, not ToggleRows. The visual pattern is different enough to keep inline for now.

**Step 3: Replace font picker label (line 75) with AdminField**

**Step 4: Verify visually, commit**

```
refactor(admin): use SegmentedControl + AdminField in AdminBergDisplay
```

---

## Task 7: Refactor AdminProducts to use primitives

**Files:**
- Modify: `src/components/admin/AdminProducts.tsx`

**Step 1: Replace image management block (lines 124-205) with ImageManager**

```tsx
<ImageManager
  images={product.previewImages || []}
  onChange={(images) => updateProduct(product.id, { previewImages: images })}
  carousel={carousel}
/>
```

**Step 2: Replace toggle rows (showIcon, showDesc, comingSoon, groupPrimary) with ToggleRow**

Lines 79-109 — each `flex items-center justify-between` + `ToggleSwitch` block becomes a `ToggleRow`.

**Step 3: Replace labeled inputs (teaser, group fields, variant labels) with AdminField**

Lines 114-120, 226-277 — wrap each `label` + `input` in `AdminField`.

**Step 4: Verify visually, commit**

```
refactor(admin): use ImageManager, ToggleRow, AdminField in AdminProducts
```

---

## Task 8: Refactor AdminShowroom to use primitives

**Files:**
- Modify: `src/components/admin/AdminShowroom.tsx`

**Step 1: Replace layout picker (lines 87-102) with SegmentedControl**

**Step 2: Replace global toggles (lines 127-134) with ToggleRow**

**Step 3: Replace click behavior picker (lines 292-309) with SegmentedControl**

**Step 4: Replace tri-state pickers (lines 362-407) with SegmentedControl**

These use `null | true | false` — SegmentedControl needs to support `string` values. Convert: `{ value: "auto", label: "Auto" }, { value: "on", label: "An" }, { value: "off", label: "Aus" }` and map back.

**Step 5: Replace image management (lines 411-487) with ImageManager**

**Step 6: Replace preset field inputs with AdminField**

**Step 7: Replace preset toggle rows with ToggleRow**

**Step 8: Verify visually, commit**

```
refactor(admin): use primitives in AdminShowroom
```

---

## Task 9: Refactor AdminProduktwahl and AdminDimensions to use primitives

**Files:**
- Modify: `src/components/admin/AdminProduktwahl.tsx`
- Modify: `src/components/admin/AdminDimensions.tsx`

**Step 1: AdminProduktwahl** — the toggle switches (lines 53-64) are custom inline switches, not `ToggleSwitch`. These have a specific look with the label integrated. Keep the existing pattern but use `AdminField`-style labels where applicable.

**Step 2: AdminDimensions** — replace the mode picker (lines 32-39) with `SegmentedControl`, use `ToggleRow` for the enabled toggle (lines 26-29).

**Step 3: Verify visually, commit**

```
refactor(admin): use primitives in AdminProduktwahl + AdminDimensions
```

---

## Task 10: Enhance AdminOptionList with renderItem slot

**Files:**
- Modify: `src/components/admin/AdminOptionList.tsx`

**Step 1: Make CRUD callbacks optional**

Change props interface:

```tsx
interface AdminOptionListProps<T extends OptionItem = OptionItem> {
  items: T[];
  onToggle: (value: string) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onAdd?: (item: { label: string; meta: Record<string, unknown> }) => void;
  onRemove?: (value: string) => void;
  onUpdate?: (value: string, changes: Partial<T>) => void;
  renderItem?: (item: T, isActive: boolean) => React.ReactNode;
  renderMeta?: (item: OptionItem) => React.ReactNode;
  addPlaceholder?: string;
}
```

**Step 2: Conditionally render add row and delete button**

- Add row: only render when `onAdd` is provided
- Delete button: only render when `onRemove` is provided
- Inline edit: only works when `onUpdate` is provided; otherwise label is plain text

**Step 3: Add renderItem support**

In the item row, replace the default label rendering with:

```tsx
{renderItem ? (
  <div className="flex-1 min-w-0 flex items-center gap-2">
    {renderItem(item as T, item.enabled)}
  </div>
) : (
  /* existing label + inline edit code */
)}
```

When `renderItem` is provided, skip the inline edit behavior (the custom renderer handles its own display).

**Step 4: Verify existing usages still work** — oberflaechen, extras, hakenMat, darstellungen panels in admin should look identical.

**Step 5: Commit**

```
feat(admin): make AdminOptionList composable with renderItem slot
```

---

## Task 11: Migrate holzarten from useToggleSet to useOptionList

**Files:**
- Modify: `src/types/config.ts` — add `holzartenItems` to `AppConfig`
- Modify: `src/hooks/useWizardState.ts` — replace `useToggleSet` with `useOptionList` for holzarten
- Modify: `src/hooks/useConfigManager.ts` — add `holzartenItems` to config getConfig/loadConfig
- Modify: `src/lib/validateConfig.ts` — handle migration from `enabledHolzarten` ToggleMap to `holzartenItems` OptionItem[]
- Modify: `src/data/constants.ts` — the `holzarten` array (FlatItem[]) stays as a convenience for wizard display, derived from the option list

**Step 1: Add `holzartenItems` to AppConfig type**

```tsx
// In types/config.ts, add to AppConfig:
holzartenItems?: OptionItem[];  // optional for backwards compat
```

**Step 2: In useWizardState, replace holzToggle with holzList**

Change:
```tsx
const holzToggle = useToggleSet(holzarten, form.holzart, ..., cachedConfig?.enabledHolzarten);
```
To:
```tsx
const holzList = useOptionList(DEFAULT_HOLZARTEN, form.holzart, ..., cachedConfig?.holzartenItems);
```

The `useOptionList` return has `.enabled`, `.active`, `.toggle` (same interface as useToggleSet) plus `.items`, `.toggleItem`, `.addItem`, etc.

**Step 3: Update useConfigManager to include holzartenItems**

In `getConfig()`, replace `enabledHolzarten` with `holzartenItems: holzList.items`.
In `loadConfig()`, handle both old format (`enabledHolzarten` ToggleMap) and new format (`holzartenItems` OptionItem[]).

Migration logic: if config has `enabledHolzarten` but no `holzartenItems`, convert by merging the toggle map onto DEFAULT_HOLZARTEN:
```tsx
const holzartenItems = DEFAULT_HOLZARTEN.map(item => ({
  ...item,
  enabled: d.enabledHolzarten?.[item.value] ?? item.enabled,
}));
```

**Step 4: Update all references from `holzToggle` to `holzList`**

Grep for `holzToggle` in: `useWizardState.ts`, `useAdminState.ts`, `AdminMode.tsx`. Replace `.active` with `.activeItems` (or keep `.active` alias — useOptionList already provides both).

**Step 5: Write migration test**

In `src/lib/__tests__/validateConfig.test.ts`, add a test that an old config with `enabledHolzarten: { eiche: true, buche: false }` migrates correctly to `holzartenItems`.

**Step 6: Run tests**

Run: `npx vitest run`
Expected: all tests pass including new migration test.

**Step 7: Commit**

```
feat(config): migrate holzarten from ToggleMap to OptionItem[]
```

---

## Task 12: Delete AdminWoodSelection, replace with AdminOptionList

**Files:**
- Delete: `src/components/admin/AdminWoodSelection.tsx`
- Modify: `src/components/AdminMode.tsx` — update holzarten panel to use AdminOptionList with renderItem

**Step 1: Update AdminMode holzarten panel**

Replace:
```tsx
content: <AdminWoodSelection enabledHolzarten={ws.holzToggle.enabled} toggleHolz={ws.holzToggle.toggle} activeCount={ws.holzToggle.active.length} />
```

With:
```tsx
content: <AdminOptionList
  items={ws.holzList.items}
  onToggle={ws.holzList.toggleItem}
  onReorder={ws.holzList.reorderItems}
  onAdd={ws.holzList.addItem}
  onRemove={ws.holzList.removeItem}
  onUpdate={ws.holzList.updateItem}
  addPlaceholder="Neue Holzart..."
  renderItem={(item) => (
    <>
      <span className="text-lg leading-none">{item.meta.emoji as string}</span>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-bold text-text">{item.label}</span>
        <span className="text-[11px] text-muted ml-1.5">{item.meta.desc as string}</span>
      </div>
    </>
  )}
/>
```

**Step 2: Remove AdminWoodSelection lazy import from AdminMode**

**Step 3: Delete `src/components/admin/AdminWoodSelection.tsx`**

**Step 4: Update summary** — change `ws.holzToggle.active.length` to `ws.holzList.activeItems.length` in AdminMode and useAdminState.

**Step 5: Verify visually** — holzarten panel should now show reorder arrows, add row, delete buttons in addition to the existing toggle.

**Step 6: Commit**

```
refactor(admin): replace AdminWoodSelection with composable AdminOptionList
```

---

## Task 13: Migrate schriftarten + berge to useOptionList

**Files:**
- Modify: `src/types/config.ts` — add `schriftartenItems`, `bergeItems` to AppConfig
- Modify: `src/hooks/useWizardState.ts` — replace schriftToggle/bergToggle with useOptionList
- Modify: `src/hooks/useConfigManager.ts` — add to getConfig/loadConfig with migration
- Modify: `src/components/AdminMode.tsx` — update references
- Modify: `src/components/admin/AdminTypeDefaults.tsx` — use AdminOptionList for font and berg lists

**Step 1: Add types and hook changes**

Same pattern as Task 11 for holzarten. Add `schriftartenItems?: OptionItem[]` and `bergeItems?: OptionItem[]` to AppConfig. Replace `useToggleSet` calls with `useOptionList` calls.

**Step 2: Update AdminTypeDefaults**

The schriftarten list (currently lines 61-83 with SelectionCard + VisibilityToggle) becomes an `AdminOptionList` with a `renderItem` that renders the font preview card.

The berge grid (currently lines 115-137 with SelectionCard + VisibilityToggle) becomes an `AdminOptionList` with a `renderItem` that renders the SVG silhouette card.

Note: these lists currently show as grid/card layouts, not as the vertical list that AdminOptionList renders. Two options:
- **A)** Add a `layout` prop to AdminOptionList (`'list' | 'grid'`) — increases complexity
- **B)** Keep AdminTypeDefaults managing its own grid layout but use the data from `useOptionList` — simpler

**Recommend B:** AdminTypeDefaults keeps its grid rendering for the font/berg selection (this is the "pick default" UI), but uses `useOptionList` data. The visibility toggles and CRUD are handled by the AdminOptionList instance in the *step panel* (holzart step → berge sub-panel or a new schriftarten sub-panel).

This means schriftarten and berge get their own panels in AdminStepOptions under the "motiv" step, alongside the existing bergDisplay panel.

**Step 3: Add schriftarten/berge panels to STEP_PANELS in AdminStepOptions**

```tsx
const STEP_PANELS: Record<string, string[]> = {
  motiv: ['schriftarten', 'berge', 'bergDisplay'],
  // ... existing
};
```

**Step 4: Add panel definitions in AdminMode optionPanels array**

```tsx
{ id: 'schriftarten', icon: 'S', label: 'Schriftarten',
  summary: `${ws.schriftList.activeItems.length} von ${ws.schriftList.items.length} aktiv`,
  content: <AdminOptionList items={ws.schriftList.items} onToggle={ws.schriftList.toggleItem}
    onReorder={ws.schriftList.reorderItems} onAdd={ws.schriftList.addItem}
    onRemove={ws.schriftList.removeItem} onUpdate={ws.schriftList.updateItem}
    addPlaceholder="Neue Schriftart..."
    renderItem={(item) => (
      <span className="text-lg" style={{ fontFamily: item.meta.family as string, fontWeight: item.meta.weight as number }}>
        {item.label}
      </span>
    )} /> },
{ id: 'berge', icon: 'B', label: 'Berge',
  summary: `${ws.bergList.activeItems.length} von ${ws.bergList.items.length} aktiv`,
  content: <AdminOptionList items={ws.bergList.items} onToggle={ws.bergList.toggleItem}
    onReorder={ws.bergList.reorderItems} onAdd={ws.bergList.addItem}
    onRemove={ws.bergList.removeItem} onUpdate={ws.bergList.updateItem}
    addPlaceholder="Neuer Berg..."
    renderItem={(item) => (
      <>
        <svg viewBox="0 0 100 70" className="w-10 h-6 shrink-0" preserveAspectRatio="none">
          <path d={item.meta.path as string} fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[13px] font-bold text-text">{item.label}</span>
        <span className="text-[11px] text-muted">{item.meta.hoehe as string}</span>
      </>
    )} /> },
```

**Step 5: Simplify AdminTypeDefaults** — it now receives `useOptionList` data and just renders the "pick default" selection grid. No more visibility toggles here (moved to step panels). Keep the live preview SVG for schriftzug and the berg selection grid.

**Step 6: Write migration tests, run tests, verify visually**

**Step 7: Commit**

```
feat(config): migrate schriftarten + berge to OptionItem[], add step panels
```

---

## Task 14: Add hutablage to CategoryVisibility

**Files:**
- Modify: `src/types/config.ts` — add `hutablage?: boolean` to CategoryVisibility
- Modify: `src/components/steps/StepAusfuehrung.tsx` — respect `categoryVisibility.hutablage`
- Modify: `src/components/admin/AdminStepOptions.tsx` — add to STEP_PANELS for ausfuehrung
- Modify: `src/components/AdminMode.tsx` — add hutablage panel definition

**Step 1: Add to type**

```tsx
interface CategoryVisibility {
  // existing...
  hutablage?: boolean;  // optional, defaults to true
}
```

**Step 2: Update StepAusfuehrung**

Wrap the hutablage section in a conditional:
```tsx
{categoryVisibility.hutablage !== false && (
  /* existing hutablage Ja/Nein buttons */
)}
```

When hidden, set `hutablage` to the default value from config (or "ja" as fallback).

**Step 3: Add panel in AdminMode**

Simple toggle panel — just a ToggleRow or SectionHeading + explanation.

**Step 4: Verify visually, commit**

```
feat(admin): add hutablage visibility toggle
```

---

## Task 15: Add step title/subtitle overrides

**Files:**
- Modify: `src/types/config.ts` — extend Texts type
- Modify: `src/components/admin/AdminStepOptions.tsx` — add title/subtitle fields in expanded panels
- Modify: `src/components/steps/StepHolzart.tsx`, `StepMasse.tsx`, `StepAusfuehrung.tsx`, `StepExtras.tsx`, `StepDarstellung.tsx`, `StepMotiv.tsx` — read title/subtitle from context texts

**Step 1: Extend Texts type**

The Texts type is currently `Record<string, TextSectionValues>`. Add a `steps` key convention:
```tsx
// texts.steps = { holzart: { title: "...", subtitle: "..." }, ... }
```

No type change needed — the existing `Record<string, TextSectionValues>` already supports this shape.

**Step 2: Add override fields in AdminStepOptions**

In the expanded panel area for each step, add two small inputs (title and subtitle) above the option panels. Only show when step is expanded. Use `AdminField` primitive.

Read from `ws.texts.steps?.[stepId]?.title` etc.
Write via `ws.setTexts(prev => ({ ...prev, steps: { ...prev.steps, [stepId]: { ...prev.steps?.[stepId], title: value } } }))`.

**Step 3: Use overrides in step components**

Each step currently renders `<StepHeader title="..." sub="..." />`. Change to:
```tsx
const { texts } = useWizardContext();
const stepTexts = texts?.steps?.[STEP_ID] as Record<string, string> | undefined;
<StepHeader title={stepTexts?.title || "Default Title"} sub={stepTexts?.subtitle || "Default subtitle"} />
```

**Step 4: Verify visually, commit**

```
feat(admin): configurable step titles and subtitles
```

---

## Task 16: Add default values when step is skipped

**Files:**
- Modify: `src/types/config.ts` — add `stepDefaults` to AppConfig
- Modify: `src/hooks/useWizardState.ts` — use stepDefaults when building skipped step defaults
- Modify: `src/components/admin/AdminStepOptions.tsx` — add default selectors when step is disabled

**Step 1: Add StepDefaults to AppConfig**

```tsx
interface AppConfig {
  // existing...
  stepDefaults?: Record<string, Partial<FormState>>;
}
```

**Step 2: In useWizardState, merge stepDefaults**

Where skipped steps apply defaults (currently uses `OPTIONAL_STEPS[].defaults`), merge with `config.stepDefaults?.[stepId]`:

```tsx
const defaults = { ...optionalStep.defaults, ...config?.stepDefaults?.[stepId] };
```

**Step 3: Admin UI**

In AdminStepOptions, when a step is disabled, show a dropdown below the step row:
- Holzart step: "Standard-Holzart: [dropdown of enabled holzarten]"
- Ausfuehrung step: "Standard-Oberfläche: [dropdown]", "Standard-Hakenmaterial: [dropdown]"
- Extras step: no default needed (extras default to empty)

Use `AdminField` + `<select>` with the enabled items from the relevant option list.

**Step 4: Verify visually, commit**

```
feat(admin): configurable default values for skipped steps
```

---

## Task 17: Add summary/legal text config

**Files:**
- Modify: `src/components/steps/StepUebersicht.tsx` — read from texts config
- Modify: `src/components/AdminMode.tsx` — extend produktwahl section or add new section
- Modify: `src/components/admin/AdminProduktwahl.tsx` — add summary text fields (or create new component)

**Step 1: Add fields to Texts**

Convention: `texts.summary = { disclaimer, priceLabel, priceHint, privacyUrl, privacyLabel }`.

**Step 2: Update StepUebersicht to use overrides**

Replace hardcoded strings:
```tsx
const summaryTexts = texts?.summary as Record<string, string> | undefined;
const disclaimer = summaryTexts?.disclaimer || "Unverbindliche Offerte inkl. Visualisierung. Lieferzeit: 4–8 Wochen. Montage schweizweit.";
const privacyUrl = summaryTexts?.privacyUrl || "/datenschutz";
// etc.
```

**Step 3: Admin UI**

Add a "Rechtliches" subsection in the admin. Could be a new admin section or appended to the Produktwahl section. Use `AdminField` for each text input.

Fields:
- Disclaimer text (textarea)
- Preis-Label ("Richtpreis")
- Preis-Hinweis ("Unverbindlich · Endpreis gemäss Offerte")
- Datenschutz-URL ("/datenschutz")
- Datenschutz-Label ("Ich akzeptiere die Datenschutzerklärung")

**Step 4: Verify visually, commit**

```
feat(admin): configurable summary and legal text
```

---

## Task 18: Delete StepPipeline + cleanup

**Files:**
- Delete: `src/components/admin/StepPipeline.tsx`
- Modify: any file that imports it (check with grep first — may already be unused)

**Step 1: Grep for StepPipeline usage**

Run: `grep -r "StepPipeline" src/`

If no imports found, delete the file. If imported somewhere, remove the import and usage.

**Step 2: Run `npm run build` to verify no broken imports**

**Step 3: Commit**

```
chore: delete unused StepPipeline component
```

---

## Task 19: Final verification + typecheck

**Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 2: Run tests**

Run: `npx vitest run`
Expected: all tests pass.

**Step 3: Run build**

Run: `npm run build`
Expected: clean build.

**Step 4: Visual smoke test**

Run: `npm run dev`
Walk through all admin sections. Verify:
- [ ] Holzarten panel shows CRUD controls + emoji/desc rendering
- [ ] Schriftarten panel shows font preview rendering in step panel
- [ ] Berge panel shows SVG rendering in step panel
- [ ] AdminCarousel looks identical but uses primitives
- [ ] AdminBergDisplay looks identical but uses primitives
- [ ] AdminProducts image section uses ImageManager
- [ ] AdminShowroom image section uses ImageManager
- [ ] Hutablage can be toggled in ausfuehrung panel
- [ ] Step titles can be overridden
- [ ] Disabled steps show default value selectors
- [ ] Summary text is editable

**Step 5: Commit**

```
chore: final cleanup after admin refactor
```
