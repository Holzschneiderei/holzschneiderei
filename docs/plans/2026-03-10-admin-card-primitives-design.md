# Admin Card Primitives — Design

## Problem

AdminProducts and AdminShowroom suffer from vertical explosion. Each entity card
(product or preset) expands to ~1000px when all sections are visible, producing
3000-5000px of scrollable content. Root causes:

1. All card sub-sections stacked vertically with no tabbing
2. No accordion behavior at the card-list level (AdminProducts)
3. Image management UI (~100 LOC) duplicated verbatim between both pages
4. `CollapsibleSection` and `AdminOptions` primitives exist but are unused

## Solution: Two New Primitives

### 1. `PropertyTabs`

A tabbed content switcher using the existing segmented-control visual style
(bordered button group with `bg-brand text-white` active state).

**API:**

```tsx
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface PropertyTabsProps {
  tabs: Tab[];
  defaultTab?: string; // defaults to first tab
}
```

**Behavior:**
- Renders a horizontal segmented-control tab bar
- Shows only the active tab's content below
- Internal state (no controlled mode needed)
- Matches existing `flex rounded-sm border border-border overflow-hidden bg-field`
  styling used in AdminShowroom, AdminProducts, AdminCarousel

**Usage in AdminProducts** — 4 tabs per product card:
- Allgemein (icon toggles, description, coming soon, steps, constraints)
- Bilder (ImageManager)
- Gruppe (grouping editor)
- Preise (price table)

**Usage in AdminShowroom** — 3 tabs per preset card:
- Allgemein (title, desc, product type, click behavior, CTA, blanko)
- Sichtbarkeit (visibility overrides)
- Bilder (ImageManager)

**Impact:** Card height drops from ~1000px to ~300px.

### 2. `ImageManager`

Extracted from the duplicated pattern in AdminProducts (lines 124-206) and
AdminShowroom (lines 411-488).

**API:**

```tsx
interface ImageManagerProps {
  images: (string | { src: string; drift?: string })[];
  onChange: (images: (string | { src: string; drift?: string })[]) => void;
  carousel?: CarouselConfig;
  showPreview?: boolean; // show ImageCarousel above list, default true
}
```

**Renders:**
- Optional carousel preview
- Image list: thumbnail + 4 drift-direction buttons + URL text + delete button
- Add-URL input row with + button

## Refactoring Plan

### AdminProducts
- Add `expandedProduct` state (accordion: only one card open at a time)
- Cards collapse to header row when not expanded
- Expanded card uses `PropertyTabs` with 4 tabs
- Image section uses `ImageManager`

### AdminShowroom
- Already has `expandedPreset` accordion state
- Replace vertical settings stack with `PropertyTabs` (3 tabs)
- Image section uses `ImageManager`

## Files to Create
- `src/components/ui/PropertyTabs.tsx`
- `src/components/ui/ImageManager.tsx`

## Files to Modify
- `src/components/admin/AdminProducts.tsx`
- `src/components/admin/AdminShowroom.tsx`
