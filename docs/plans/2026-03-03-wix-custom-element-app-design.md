# Wix Custom Element App — GarderobeWizard

## Problem

The existing GarderobeWizard React JSX component (~1100 lines) needs to be embedded
in a Wix website. A prior Velo migration approach required manually recreating 50+
UI elements in the Wix Editor. Instead, we keep the React code and embed it as a
Wix Custom Element via the Wix CLI app framework.

## Decision

**Approach A: Wix CLI Custom Element App** — create a Wix App using the CLI that
wraps the existing React component as a web component. Admin config via the editor
settings panel, data read/write via Wix SDK and backend web methods.

## Architecture

```
spike/                              # All new files in spike directory
├── src/
│   └── site/
│       └── widgets/
│           └── garderobe-wizard/
│               ├── element.extension.ts    # Widget config
│               ├── element.tsx             # GarderobeWizard React → Web Component
│               ├── element.panel.tsx       # Admin settings panel
│               └── element.module.css      # Scoped styles
│   └── backend/
│       └── bestellung.ts                   # Server-side order submission
├── public/
│   └── thumb.png                           # Widget thumbnail
└── wix.config.ts                           # Wix CLI config
```

### Data Flow

```
[Admin] → Settings Panel → widget.setProp() → element attributes → React props
[Customer] → Wizard → submit → webMethod() → Wix Data API → GarderobeBestellungen
[Init] → Widget mounts → reads GarderobeConfig collection → populates state
```

## Data Model

### GarderobeConfig (admin config, single row)

| Field          | Type        | Purpose                                      |
|----------------|-------------|----------------------------------------------|
| enabledWoods   | Text (JSON) | Which wood types are available                |
| enabledSteps   | Text (JSON) | Step toggle states                            |
| stepOrder      | Text (JSON) | Ordered step IDs                              |
| constraints    | Text (JSON) | Min/max dimensions, hook spacing, etc.        |
| pricing        | Text (JSON) | Wood costs, labour rate, margin, extras costs |
| defaults       | Text (JSON) | Default form values                           |

### GarderobeBestellungen (orders)

| Field          | Type   | Purpose                    |
|----------------|--------|----------------------------|
| title          | Text   | Auto: "Vorname Nachname"   |
| typ            | Text   | "schriftzug" or "bergmotiv"|
| schriftzug     | Text   | Custom text                |
| schriftart     | Text   | Font choice                |
| berg           | Text   | Mountain choice            |
| holzart        | Text   | Wood type                  |
| breite         | Number | Width cm                   |
| hoehe          | Number | Height cm                  |
| tiefe          | Number | Depth cm                   |
| oberflaeche    | Text   | Surface finish             |
| haken          | Text   | Hook count                 |
| hakenmaterial  | Text   | Hook material              |
| hutablage      | Text   | "ja" / "nein"              |
| extras         | Text   | Comma-separated extras     |
| bemerkungen    | Text   | Free text remarks          |
| anrede         | Text   | Salutation                 |
| vorname        | Text   | First name                 |
| nachname       | Text   | Last name                  |
| email          | Text   | Email                      |
| telefon        | Text   | Phone                      |
| strasse        | Text   | Street                     |
| plz            | Text   | Postal code                |
| ort            | Text   | City                       |
| status         | Text   | Default: "NEU"             |

## Component Design

### element.tsx

Wraps `GarderobeWizard` with `reactToWebComponent`. Receives props:
- `config` — JSON string of admin config from GarderobeConfig
- `mode` — "workflow" (default) | "admin" | "preview"

The existing GarderobeWizard component stays intact. Changes:
- Receives config as props instead of hardcoded defaults
- Form submission calls backend web method instead of direct CMS insert
- Admin config loaded from CMS collection on mount

### element.panel.tsx

Admin settings panel in the Wix Editor sidebar:
- Wood type toggles (checkbox list)
- Step enable/disable switches
- Pricing fields (wood costs per type, labour rate, margin)
- Constraint fields (min/max dimensions)
- Save button → writes to GarderobeConfig CMS collection

### Backend (bestellung.ts)

Web method `submitOrder(formData)`:
- Validates required fields
- Inserts into GarderobeBestellungen collection
- Returns success/error

## What Stays vs. What Changes

### Stays the same
- Brand tokens, data arrays (holzarten, oberflaechen, berge, etc.)
- All step components (StepHolzart, StepMasse, StepAusfuehrung, etc.)
- Wizard navigation logic
- Form state management, validation
- CSS-in-JS styling
- Animations

### Changes
- Component receives props from web component attributes
- Form submission → backend web method
- Admin config → CMS collection
- New files: element.extension.ts, element.panel.tsx, backend/bestellung.ts

## Key Constraint

All new files go in the `spike/` directory. The original JSX files remain untouched.
