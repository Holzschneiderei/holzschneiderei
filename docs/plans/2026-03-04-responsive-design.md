# Responsive Web Application Design

## Goal

Make the garderobe wizard a fully responsive web application optimized for mobile, tablet, desktop, and large screens using CSS container queries.

## Breakpoints

- **Mobile** `<640px` — current layout baseline
- **Tablet** `640-1024px` — wider card, more grid columns
- **Desktop** `1024-1440px` — side rail nav, admin 2-col sections
- **Large** `>1440px` — maximum breathing room

## Technique

CSS container queries injected via `GlobalStyles`. Shell div becomes `container-type: inline-size`. CSS classes alongside inline styles — inline = base (mobile), `@container` = overrides.

## Wizard (Customer) Layout

| Element | Mobile | Tablet | Desktop | Large |
|---------|--------|--------|---------|-------|
| Card maxWidth | 520px | 640px | 720px | 840px |
| Berg grid | 2 cols | 3 cols | 4 cols | 4 cols |
| Wood grid | 2 cols | 3 cols | 3 cols | 4 cols |
| Extras grid | 3 cols | 3 cols | 4 cols | 4 cols |
| Bottom nav | fixed | fixed | side rail | side rail |
| Main padding | 16px | 24px | 32px | 40px |

**Side rail (desktop+):** Sticky sidebar ~200px on left with step names + active indicator. Back/next buttons at bottom of rail. Step dots become named labels.

## Admin Layout

| Element | Mobile | Tablet | Desktop | Large |
|---------|--------|--------|---------|-------|
| Admin maxWidth | 520px | 640px | 960px | 1100px |
| Sections | stacked | stacked | 2-col grid | 2-col grid |
| Constraint grid | 2 cols | 2 cols | 4 cols | 4 cols |
| Pricing grid | 2 cols | 2 cols | 3 cols | 4 cols |

## Typography Scale

- Headings: `clamp(18px, 2.5cqi, 32px)`
- Body: `clamp(13px, 1.5cqi, 16px)`
- Labels: `clamp(11px, 1.2cqi, 14px)`
- Padding: `clamp(12px, 2cqi, 40px)`

## Unchanged

- Color theme `t`, component logic, phone frame preview (375px), animations, form element heights (44px)
