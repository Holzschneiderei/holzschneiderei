# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Holzschneiderei** is a React-based product configurator (Garderobe/wardrobe wizard) for a Swiss woodworking business. It is **hosted on Vercel** and runs as an **iframe widget embedded in a Wix website** at [holzschneiderei.ch](https://holzschneiderei.ch). The configurator lets customers choose wood type, surface finish, dimensions, hooks, extras, mountain silhouette engravings, and fonts for personalized wardrobes.

### Deployment & URLs

- **Vercel project:** `holzschneiderei` (team: `tweakchs-projects`)
- **Vercel domain:** `holzschneiderei.vercel.app`
- **Customer page:** `https://holzschneiderei.ch/garderobe-konfigurieren`
- **Admin page:** `https://holzschneiderei.ch/konfigurator-admin`

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build (output in `dist/`)
- `npm run preview` — Preview production build locally
- `npx playwright test --project=auth-setup` — Run Wix auth setup (interactive, non-headless)
- `npx playwright test --project=editor` — Run editor tests (requires prior auth setup)

No linter or unit test framework is configured.

## Architecture

### App Structure (src/)

- **`main.jsx`** — Entry point. Renders `<GarderobeWizard />` into `#root`.
- **`Konfigurator.jsx`** — Single large component containing the entire multi-step wizard (all configuration data, steps, validation, SVG preview, and summary). This is the main file you'll work in.
- **`konfigurator.css`** — Styles for the configurator.
- **`bridge.js`** — Wix iframe communication layer. Provides `send()`, `listen()`, and `autoResize()` for postMessage-based parent/child communication on the `"holzschneiderei"` channel.

### Wix Integration

The app is embedded as an iframe in a Wix site. The bridge module handles:
- Sending configuration data and resize events to the Wix parent
- Listening for messages from Wix (e.g., theme/settings)
- Auto-resizing the iframe to fit content

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
- All configuration data (wood types, surfaces, extras, mountains) is defined inline in `Konfigurator.jsx`
- Design tokens/colors are defined as a `t` object at the top of `Konfigurator.jsx`
- The app uses transparent background to blend with the Wix site
