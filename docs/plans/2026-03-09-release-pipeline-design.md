# Release Pipeline Design

**Date:** 2026-03-09
**Branch:** feat/release-pipeline

## Goal

Add production safety to merges into `main`. Vercel already deploys previews per branch — this pipeline ensures correctness before code reaches production.

## Components

### 1. CI Pipeline — `.github/workflows/ci.yml`

**Trigger:** `pull_request` targeting `main`

**Steps (sequential):**

1. `npm ci` — install dependencies
2. `tsc --noEmit` — typecheck
3. `tsx scripts/validate-config.ts` — config shape validation
4. `tsx scripts/check-cms-contract.ts` — CMS schema contract check (no API calls)
5. `vite build` — production bundle compiles

### 2. CMS Contract Checker — `scripts/check-cms-contract.ts`

Validates that the Wix CMS collections (cached in `cms/*.csv`) contain all fields the app expects to read/write.

**How it works:**

- Parses CSV header row from each file in `cms/`
- Compares headers against a field manifest — a TS declaration of which fields each collection must have
- **Missing in CSV but in manifest → FAIL** (app would write to a non-existent field)
- **In CSV but not in manifest → OK** (extra columns are harmless)
- Field matching: exact string match (CSV headers must use Wix field keys, not display names)

**Field manifest** lives in the script itself, derived from what the app sends via bridge (`GarderobeBestellungen` fields, `ConfiguratorAdmin` fields, `Konfigurationen` fields).

### 3. CMS Sync Action — `.github/workflows/cms-sync.yml`

**Trigger:** `workflow_dispatch` with inputs:

| Input | Type | Default | Description |
|---|---|---|---|
| `include_data` | boolean | `false` | If true, download data rows. If false, headers only. |

**Steps:**

1. Fetch collection list/schemas from Wix Data API (`WIX_API_KEY`, `WIX_SITE_ID` secrets)
2. For each collection, query Wix and write CSV to `cms/`
3. If files unchanged → exit cleanly
4. If files changed → create PR titled `chore: update CMS collection snapshots`
5. The PR triggers CI, which runs the contract check — schema drift surfaces as a CI failure

### 4. Branch Protection (manual setup)

Configure on GitHub: require CI workflow status check to pass before merging to `main`.

## File Map

| File | New/Modified | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | New | CI pipeline |
| `.github/workflows/cms-sync.yml` | New | CMS sync + PR creation |
| `scripts/check-cms-contract.ts` | New | Contract checker |
| `cms/*.csv` | Existing | Cached CMS collection snapshots |

## Secrets Required

| Secret | Used by |
|---|---|
| `WIX_API_KEY` | cms-sync.yml |
| `WIX_SITE_ID` | cms-sync.yml |

## Expected Initial Behavior

The contract checker will **fail** on the first run because the CSV headers currently use display names (e.g. "Breite (cm)") instead of field keys (e.g. "breite"). This is intentional — the validation surfaces the mismatch so the CSVs can be corrected.
