# Showroom Presets — Design

**Date:** 2026-03-08
**Approach:** C — Separate showroom layer, decoupled from product system

## Overview

Transform the PhaseTypen landing page into a showroom of pre-configured product presets. The admin curates preset cards (with images, pre-filled form values, and display settings), and customers browse them as ready-to-order CTAs or starting points for customization.

## Data Model

### Showroom Config (top-level, alongside products/pricing/texts)

```js
showroom: {
  layout: "grid" | "hero" | "carousel",
  columns: 2 | 3 | 4,           // grid layout only
  showPrice: true,               // global defaults
  showSpecs: true,
  presets: [Preset]
}
```

### Preset

```js
{
  id: string,                    // "preset-1", auto-generated
  title: string,                 // "Garderobe Alpstein"
  desc: string,                  // "Eiche natur, 80cm, 6 Haken"
  images: string[],              // URLs for ImageCarousel
  productId: string,             // links to product type for steps/constraints
  formSnapshot: object,          // partial or full form state
  clickBehavior: "summary" | "wizard" | "detail",
  isBlank: boolean,
  sortOrder: number,
  enabled: boolean,
  showPrice: null | boolean,     // null = use global
  showSpecs: null | boolean,
  showTitle: boolean,
  showDesc: boolean,
  ctaText: string,               // "Jetzt bestellen"
}
```

### Key Decisions

- `productId` links to existing product for steps/constraints/pricing — presets don't redefine those
- `formSnapshot` is a partial merge over `DEFAULT_FORM` — missing fields keep defaults
- `isBlank` drives blueprint styling and empty form behavior
- Visibility flags cascade: preset-level > showroom globals > sensible defaults
- Presets are independent of product types — multiple presets can share the same productId

## Customer Landing Page

### Layout Options

- **Grid** — CSS grid with configurable columns, responsive stacking on mobile
- **Hero** — First preset spans full width, rest below in smaller grid
- **Carousel** — Horizontal swiper, 1 card on mobile, 2-3 on desktop

### Preset Card Anatomy

```
┌──────────────────────────────┐
│  ImageCarousel               │  images[] or blueprint placeholder
├──────────────────────────────┤
│  Title          (if shown)   │
│  Description    (if shown)   │
│  Specs badges   (if shown)   │  "Eiche · 80cm · 6 Haken"
│  Price          (if shown)   │  computed live from formSnapshot
│                              │
│  [ ctaText button ]          │
└──────────────────────────────┘
```

- Blank presets: dashed border, blueprint-tinted images, pencil icon on CTA
- Price computed live via `computePrice()` / `computeFixedPrice()` — not stored
- Specs derived from formSnapshot fields, rendered as badges/chips

### Click Behavior

| clickBehavior | Action |
|---|---|
| `"summary"` | Hydrate form, jump to StepUebersicht |
| `"wizard"` | Hydrate form, enter wizard at step 1 |
| `"detail"` | Expand inline detail panel with "Bestellen" + "Anpassen" buttons |

### Form Hydration

1. Start with `DEFAULT_FORM`
2. Merge `formSnapshot` over it
3. Set `form.product = preset.productId`
4. Derive `activeSteps` from product.steps + enabledSteps
5. Enter wizard or jump to summary based on clickBehavior

## Admin UI

### Showroom Section

New admin section with:

**Top bar:**
- Layout picker (grid / hero / carousel)
- Grid columns slider (2-4)
- Global visibility toggles

**Preset cards** — mirror customer layout with admin controls:
- Drag handle for reordering (updates sortOrder)
- "Konfigurieren" button — opens wizard walkthrough
- "Einstellungen" expandable panel — title, desc, images, CTA, visibility, clickBehavior, productId, isBlank, enabled
- "Löschen" button

**"+ Neues Preset" button:**
1. Creates preset with defaults (empty, isBlank: true)
2. Admin picks product type
3. Opens wizard walkthrough
4. Fills in settings

### Preset Configuration Wizard

- `presetConfigMode: true` flag on wizard context
- Uses preset's productId for steps/constraints
- All steps shown (even admin-disabled ones)
- Final button: "Speichern" (saves formSnapshot to preset)
- No bridge submission

## Wizard Integration

### Customer Wizard with Pre-filled Form

- Form hydrated from formSnapshot + defaults
- Admin-disabled steps skipped (values stay from snapshot)
- User sees pre-filled values, can change them
- Validation runs normally

### Schriftzug Rule

- Products with `motif: "schriftzug"`: `schriftzug` must be non-empty in formSnapshot
- Admin validation warns on save if empty
- Blank presets exempt — user fills in wizard
- Bergmotiv products exempt — no Schriftzug

## Persistence

- Showroom config saved/loaded via existing Wix bridge config-save/config-load
- Part of the admin config blob alongside products, pricing, enabledSteps, texts
- ~500 bytes per preset, negligible size impact

### Default/Migration

```js
DEFAULT_SHOWROOM = {
  layout: "grid",
  columns: 3,
  showPrice: true,
  showSpecs: true,
  presets: []
}
```

Zero presets = fallback to current product selector behavior. No breaking change.

## What Doesn't Change

- Wizard step components, pricing logic, bridge communication
- Products, constraints, option lists
- The showroom is purely a presentation/hydration layer on top
