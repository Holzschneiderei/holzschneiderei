---
name: web-design-guidelines
description: Review UI code for Holzschneiderei design system compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or when writing new UI components.
argument-hint: <file-or-pattern>
---

# Holzschneiderei Design Guidelines

Review files for compliance with the project's design system. These guidelines serve both as agent review rules and as human-readable documentation.

## How It Works

1. Read the specified files (or prompt user for files/pattern)
2. Check against all rules in the sections below
3. Output findings in terse `file:line — rule violated — suggestion` format
4. Group findings by section, most critical first

If no files specified, ask the user which files to review.

---

## 1. Color & Tokens

### Rules

1. **Always use CSS custom properties** (`var(--color-brand)`, `var(--color-text)`) or their Tailwind equivalents (`text-brand`, `bg-field`, `border-border`). Never use raw hex/rgba values in components.
2. **The `t` object** (`src/data/constants.ts`) exists solely for **SVG fill/stroke interpolation** where CSS vars don't work. It must mirror the CSS tokens exactly — never introduce a color in `t` that isn't also a CSS var.
3. **Opacity variants** use Tailwind's `/` syntax (e.g., `bg-brand/10`) or the pre-defined tokens `brand-light` (6%) and `brand-medium` (10%). Don't hardcode `rgba(31,59,49,...)`.

### Palette

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `brand` | `#1f3b31` | `text-brand`, `bg-brand`, `border-brand` | Primary actions, active states, focus rings |
| `brand-hover` | `#2a4f42` | `hover:bg-brand-hover` | Hover state for primary buttons |
| `brand-light` | `rgba(brand, 0.06)` | `bg-brand-light` | Selected card backgrounds (light shade) |
| `brand-medium` | `rgba(brand, 0.10)` | `bg-brand-medium` | Selected card backgrounds (medium shade) |
| `text` | `#1f2a23` | `text-text` | Body text, headings |
| `muted` | `#5b615b` | `text-muted` | Secondary text, descriptions |
| `border` | `#c8c5bb` | `border-border`, `bg-border` | Borders, dividers, off-state toggles |
| `brand-subtle` | `rgba(brand, 0.03)` | `bg-brand-subtle` | Collapsible section backgrounds, spinner backdrops |
| `field` | `#faf9f6` | `bg-field` | Input backgrounds |
| `border-light` | `rgba(border, 0.15)` | `bg-border-light` | Off-state toggle backgrounds |
| `bg` | `#f3f1ea` | `bg-bg` | Page background (admin) |
| `error` | `#a03030` | `text-error`, `border-error` | Validation errors |

### Anti-patterns

- `rgba(31,59,49,0.06)` in JSX — use `bg-brand-light`
- `style={{ color: '#1f3b31' }}` — use `text-brand` class
- New hex value without a corresponding CSS `@theme` token

---

## 2. Typography

### Rules

1. **Font family** — always `font-body` (resolves to `'Holzschneiderei'` stack). Never set `fontFamily` inline except for font preview purposes (e.g., showing Schriftarten samples).
2. **Weight threshold** — `100–499` loads **Futura Light**, `500–900` loads **BebasKai**. These are visually very different faces. Common weights:
   - `font-medium` (500) — use sparingly, this crosses into BebasKai
   - `font-semibold` (600) — form labels
   - `font-bold` (700) — headings, buttons, card titles
   - `font-extrabold` (800) — admin section titles, prices
3. **Headings are always uppercase** with tight tracking: `uppercase tracking-[0.02em] leading-tight`.
4. **Use fluid typography classes** for customer-facing text that must scale with the container:
   - `cq-fluid-h1` — hero headings (clamp 28–44px)
   - `cq-fluid-h2` — section headings (clamp 17–24px)
   - `cq-fluid-body` — body text (clamp 14–17px)
   - `cq-fluid-sm` — captions, descriptions (clamp 12–15px)
5. **Letter-spacing conventions:**
   - `0.02em` — headings, card titles
   - `0.04em` — buttons, body text, descriptions
   - `0.06em` — Shell base (set on root)
   - `0.12em`+ — tiny uppercase labels (admin meta text, "COMING SOON")
6. Fixed sizes (`text-xl`, `text-2xl`) without a `cq-fluid-*` companion are fine in admin UI where the container is predictable. For customer-facing wizard text, always pair with the fluid class.

### Anti-patterns

- `style={{ fontFamily: '...' }}` except for font previews
- Customer-facing heading without a `cq-fluid-*` class
- Lowercase heading text in the wizard flow

---

## 3. Spacing & Layout

### Rules

1. **Container queries, never media queries.** The app runs in an iframe — viewport width is meaningless. All responsive behavior uses `@container shell` queries via `cq-*` utility classes.
2. **The `Shell` component** (`wz-shell`) is the container query root. Every responsive class depends on it being an ancestor.
3. **Breakpoint tiers:**

   | Container width | Prefix convention | Typical layout |
   |---|---|---|
   | < 640px | (base) | Single column, compact padding |
   | 640px+ | `cq-*-md` | 2–3 column grids, wider cards |
   | 780px+ | (continuation) | 4-column grids |
   | 1024px+ | `cq-*-lg` | Side rail visible, wider content |
   | 1440px+ | `cq-*-xl` | Max content widths, generous padding |

4. **Card max-widths** use `clamp()` with `cqi` units — e.g., `clamp(500px, 88cqi, 660px)`. Never hardcode a single `max-width` for responsive cards.
5. **Standard spacing values:**
   - Form field height: `h-[48px]` (customer), `h-11` (admin/compact)
   - Primary button height: `h-[52px]` (hero CTA), `h-11` (navigation/secondary)
   - Section margin-bottom: `mb-7` (step headers), `mb-10` (phase headers)
   - Grid gaps: `gap-4` (product/card grids), `gap-2.5` (compact grids, collapsibles)
   - Card padding: `py-5 px-4` (selection cards), `p-4` (collapsible sections), `24–32px` (admin cards, responsive)

### Anti-patterns

- `@media (min-width: ...)` or Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- `max-width: 600px` without `clamp()` and `cqi` for responsive cards
- Adding a responsive class that doesn't have a corresponding `@container shell` rule in `konfigurator.css`

---

## 4. Components

### Rules

1. **Button hierarchy** — two tiers, always use the utility classes:
   - `wz-btn wz-btn-primary` — primary actions ("Weiter", "Bestellen"). One per visible screen.
   - `wz-btn wz-btn-ghost` — secondary actions ("Zurueck", "Typ aendern").
   - Never style buttons with raw Tailwind border/bg combos. Extend the `@utility` definitions in `konfigurator.css` if a new variant is needed.

2. **SelectionCard** — for any single/multi-select choice (products, wood types, mountains, fonts):
   - `shade="light"` for product-level cards, `shade="medium"` for option-level cards
   - `badgeSize="lg"` for top-level choices, `"md"` for step-level options
   - Always pass `role="radio"` + `aria-checked` for single-select, wrapped in `role="radiogroup"`

3. **Form fields** — use `TextField` and `SelectField` from `components/ui/`. They handle `id`, `label`, `aria-invalid`, and `aria-describedby`. Never build an input/label pair manually.

4. **StepHeader** — use for heading + description at the top of each wizard step. Don't create ad-hoc heading layouts.

5. **CollapsibleSection** — for progressive disclosure within steps. Handles `aria-expanded`, `aria-controls`, and keyboard interaction.

6. **ToggleSwitch** — for boolean admin settings. Provides `role="switch"`, keyboard handling, and locked state.

7. **Fade** — wrap phase/step content for entry animation. Don't apply `animate-fade-up` directly.

8. **Check `src/components/ui/` before creating new primitives.** Existing components:
   `Shell`, `Fade`, `PhoneFrame`, `StepHeader`, `SummaryRow`, `CheckBadge`, `TextField`, `SelectField`, `ToggleSwitch`, `VisibilityToggle`, `FlowPicker`, `CollapsibleSection`, `SelectionCard`, `ImageCarousel`, `ErrorBoundary`, `SideRail`

### Anti-patterns

- One-off button styled with `bg-brand text-white border-none rounded ...` instead of `wz-btn wz-btn-primary`
- Manual `<label><input>` pair instead of `TextField`/`SelectField`
- Duplicating `CheckBadge` logic inline
- Adding `animate-fade-up` directly instead of wrapping in `<Fade>`

---

## 5. Animations & Transitions

### Rules

1. **Primary easing** — `cubic-bezier(0.22, 1, 0.36, 1)` for keyframe animations. For simple property transitions (color, border, opacity), Tailwind `ease-out` with `duration-200` is acceptable.
2. **Entry animations** — use the predefined keyframes:
   - `animate-fade-up` — default entry for phases/steps (via `Fade`)
   - `animate-slide-right` / `animate-slide-left` — wizard step transitions (forward/back)
   - `animate-slide-bottom` / `animate-slide-top` — vertical entries
   - `adminFadeIn` — admin section transitions (subtler 8px travel vs 40px)
3. **Interactive feedback:**
   - Buttons: `translateY(-1px)` on hover, `translateY(0)` on active
   - Cards: `hover:-translate-y-[1px]` + shadow elevation change (`shadow-card` to `shadow-card-hover`)
   - Toggles: `transition-colors duration-[250ms]` for track, `transition-transform duration-200` for thumb
4. **Validation shake** — `animate-shake` (horizontal 6px oscillation, 0.4s). Triggered programmatically, not on mount.
5. **Reduced motion** — handled globally via `@media (prefers-reduced-motion: reduce)` in `konfigurator.css`. No per-component work needed. Never add `!important` animation durations that would override this.

### Anti-patterns

- New `@keyframes` when an existing one fits — check `konfigurator.css` first
- Inline Tailwind `animate-[...]` arbitrary values for animations that should be shared
- Animation that changes document height rapidly (causes iframe resize thrashing)

---

## 6. Accessibility

### Rules

1. **Focus indicators** — `focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2`. Never suppress focus styles. Use `focus-visible` (not `focus`) so mouse users aren't distracted.
2. **ARIA patterns:**
   - Single-select groups: `role="radiogroup"` container + `role="radio"` + `aria-checked` on each card
   - Toggles: `role="switch"` + `aria-checked` + keyboard `Space`/`Enter` handling
   - Collapsibles: `aria-expanded` + `aria-controls` pointing to content `id`
   - Step navigation: `aria-current="step"` on active step in SideRail
   - Form errors: `aria-invalid` + `aria-describedby` linking to error `<p role="alert">`
3. **Required fields** — visual `*` gets `aria-hidden="true"`, paired with `<span className="sr-only"> (erforderlich)</span>`.
4. **Decorative elements** — all icons, SVG illustrations, and emoji get `aria-hidden="true"`. Only add `aria-label` if the element is the sole source of meaning.
5. **IDs** — use React's `useId()` for `htmlFor`/`id` and `aria-describedby`. Never hardcode IDs.
6. **Language** — the app is `lang="de"`. All labels, errors, and screen reader text must be German.
7. **Clickable elements** — if it's clickable, use `<button>`. If a non-button element must be interactive, add `role`, `tabIndex={0}`, and `onKeyDown` for `Space`/`Enter`.

### Anti-patterns

- `onClick` on a `<div>` without `role`, `tabIndex`, and keyboard handling
- Hardcoded `id="my-input"` instead of `useId()`
- Missing `aria-hidden="true"` on decorative emoji/icons
- Error message without `role="alert"` or missing `aria-describedby` link

---

## 7. Iframe Constraints

### Rules

1. **Transparent background** — the app blends with the Wix host page. `Shell` sets `bg-[var(--wz-bg,transparent)]`. Never set an opaque background on `html`, `body`, or the root container.
2. **No viewport-relative units for layout** — `100vw`/`100vh` refer to the iframe viewport, not the user's screen. Use sparingly, only where you truly mean "fill the iframe" (e.g., admin full-height layout). For customer-facing wizard content, use `%`, `cqi`, or intrinsic sizing.
3. **Container queries are the only responsive mechanism.** No `@media` width queries, no Tailwind `sm:`/`md:`/`lg:` prefixes. The iframe width varies independently of the browser viewport.
4. **Auto-resize awareness** — the bridge (`src/bridge.ts`) sends height updates to the parent. Avoid layout causing rapid height oscillations (toggling visibility every frame, animations that change document height repeatedly).
5. **Cross-origin restrictions** — never access `window.parent` directly. Use `bridge.send()` and `bridge.listen()` for all parent communication.
6. **Fonts are self-hosted** from `/fonts/`. No external font CDNs — cross-origin font loading can be blocked in iframe contexts.
7. **`position: fixed`** — never use for customer-facing UI. Fixed positioning in an iframe is relative to the iframe viewport, not the user's visible area. Use `sticky` instead. Exception: admin overlay/FAB where the iframe *is* the full page.

### Anti-patterns

- `@media (min-width: ...)` anywhere in the codebase
- `position: fixed` in customer-facing wizard UI
- `window.parent.postMessage(...)` instead of `bridge.send()`
- Google Fonts `<link>` or `@import`
- Opaque `background-color` on `body` or `#root`
