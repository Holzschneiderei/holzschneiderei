# Release Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add CI safety to PRs targeting `main` — typecheck, config validation, CMS contract check, and build — plus a separate action to sync CMS schemas from the Wix API.

**Architecture:** Two GitHub Actions workflows. The CI workflow runs purely local checks against committed files. The CMS sync workflow calls the Wix Data REST API to refresh cached collection schemas in `cms/` and opens a PR if anything changed. A new `scripts/check-cms-contract.ts` script validates app field expectations against CSV headers.

**Tech Stack:** GitHub Actions, TypeScript (tsx), Wix Data REST API v2, Node.js fetch

---

### Task 1: CMS Contract Checker Script

**Files:**
- Create: `scripts/check-cms-contract.ts`

**Step 1: Write the contract checker**

This script parses `cms/*.csv` headers and validates them against a field manifest.

```ts
/**
 * CMS Contract Checker
 *
 * Validates that cached CMS collection schemas (cms/*.csv) contain
 * all fields the app expects to read/write.
 *
 * Run: npx tsx scripts/check-cms-contract.ts
 */
import * as fs from "fs";
import * as path from "path";

// ── Field manifest ──────────────────────────────────────────────────────
// Each key is the CSV filename (without path), value is the set of
// field keys the app sends to that collection.

const MANIFEST: Record<string, string[]> = {
  "Garderobe+Bestellungen.csv": [
    "title",
    "typ",
    "schriftzug",
    "schriftart",
    "berg",
    "holzart",
    "breite",
    "hoehe",
    "tiefe",
    "oberflaeche",
    "haken",
    "hakenmaterial",
    "hutablage",
    "extras",
    "bemerkungen",
    "anrede",
    "vorname",
    "nachname",
    "email",
    "telefon",
    "strasse",
    "plz",
    "ort",
    "status",
    "preis",
  ],
  "Konfigurationen.csv": [
    "sessionId",
    "typ",
    "holzart",
    "oberflaeche",
    "breite",
    "hoehe",
    "tiefe",
    "haken",
    "hakenmaterial",
    "extras",
    "berg",
    "schriftart",
    "namenszug",
    "hutablage",
    "bemerkungen",
    "preis",
    "anrede",
    "vorname",
    "nachname",
    "email",
    "telefon",
    "strasse",
    "plz",
    "ort",
    "status",
    "checkoutId",
  ],
  "ConfiguratorAdmin.csv": [
    "config",
  ],
};

// ── CSV header parser ───────────────────────────────────────────────────

function parseHeaders(csvPath: string): string[] {
  const content = fs.readFileSync(csvPath, "utf-8");
  const firstLine = content.split(/\r?\n/)[0];
  if (!firstLine) return [];
  // Parse CSV header: split on comma, strip quotes
  return firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
}

// ── Main ────────────────────────────────────────────────────────────────

const cmsDir = path.resolve(import.meta.dirname ?? ".", "..", "cms");
let passed = 0;
let failed = 0;

console.log("\nCMS contract check\n");

for (const [filename, expectedFields] of Object.entries(MANIFEST)) {
  const csvPath = path.join(cmsDir, filename);

  if (!fs.existsSync(csvPath)) {
    console.error(`  ✗ ${filename}: file not found`);
    failed++;
    continue;
  }

  const headers = parseHeaders(csvPath);
  const headerSet = new Set(headers.map((h) => h.toLowerCase()));

  console.log(`  ${filename} (${headers.length} columns)`);

  for (const field of expectedFields) {
    if (headerSet.has(field.toLowerCase())) {
      passed++;
      console.log(`    ✓ ${field}`);
    } else {
      failed++;
      console.error(`    ✗ ${field} — missing in CSV`);
    }
  }
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
```

**Step 2: Run the script to verify it fails**

Run: `npx tsx scripts/check-cms-contract.ts`

Expected: FAIL — CSV headers use display names (e.g. "Breite (cm)") instead of field keys ("breite"). This is correct and intentional.

**Step 3: Commit**

```
git add scripts/check-cms-contract.ts
git commit -m "feat: add CMS contract checker script"
```

---

### Task 2: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Write the CI workflow**

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Validate config
        run: npx tsx scripts/validate-config.ts

      - name: CMS contract check
        run: npx tsx scripts/check-cms-contract.ts

      - name: Build
        run: npx vite build
```

**Step 2: Commit**

```
git add .github/workflows/ci.yml
git commit -m "ci: add CI pipeline for PRs to main"
```

---

### Task 3: CMS Sync Workflow

**Files:**
- Create: `.github/workflows/cms-sync.yml`
- Create: `scripts/cms-sync.ts`

**Step 1: Write the sync script**

This script fetches collection schemas (and optionally data) from the Wix Data API and writes CSV files to `cms/`.

```ts
/**
 * CMS Sync — fetch Wix collection schemas and write to cms/*.csv
 *
 * Env vars: WIX_API_KEY, WIX_SITE_ID
 * Args:     --include-data   (optional) download data rows too
 *
 * Run: npx tsx scripts/cms-sync.ts [--include-data]
 */
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

if (!API_KEY || !SITE_ID) {
  console.error("Missing WIX_API_KEY or WIX_SITE_ID");
  process.exit(1);
}

const includeData = process.argv.includes("--include-data");

const headers: Record<string, string> = {
  Authorization: API_KEY,
  "wix-site-id": SITE_ID,
  "Content-Type": "application/json",
};

const cmsDir = path.resolve(import.meta.dirname ?? ".", "..", "cms");

// ── Known collections ───────────────────────────────────────────────────
// Map from Wix collection ID to local CSV filename.

const COLLECTIONS: Record<string, string> = {
  "Garderobe+Bestellungen": "Garderobe+Bestellungen.csv",
  "Konfigurationen": "Konfigurationen.csv",
  "ConfiguratorAdmin": "ConfiguratorAdmin.csv",
};

// ── API helpers ─────────────────────────────────────────────────────────

interface WixField {
  key: string;
  displayName: string;
  type: string;
}

interface WixCollection {
  id: string;
  fields: WixField[];
}

interface WixDataItem {
  data: Record<string, unknown>;
}

async function getCollection(id: string): Promise<WixCollection> {
  const res = await fetch(
    `https://www.wixapis.com/wix-data/v2/collections/${encodeURIComponent(id)}`,
    { headers },
  );
  if (!res.ok) throw new Error(`GET collection ${id}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.collection;
}

async function queryItems(collectionId: string, limit = 50): Promise<WixDataItem[]> {
  const res = await fetch("https://www.wixapis.com/wix-data/v2/items/query", {
    method: "POST",
    headers,
    body: JSON.stringify({
      dataCollectionId: collectionId,
      query: { paging: { limit, offset: 0 } },
    }),
  });
  if (!res.ok) throw new Error(`Query ${collectionId}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.dataItems ?? [];
}

// ── CSV helpers ─────────────────────────────────────────────────────────

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(fieldKeys: string[], rows: Record<string, unknown>[]): string {
  const header = fieldKeys.map(escapeCsv).join(",");
  if (rows.length === 0) return header + "\n";
  const dataLines = rows.map((row) =>
    fieldKeys.map((k) => escapeCsv(row[k])).join(","),
  );
  return [header, ...dataLines].join("\n") + "\n";
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(cmsDir, { recursive: true });

  for (const [collectionId, filename] of Object.entries(COLLECTIONS)) {
    console.log(`Fetching ${collectionId}...`);

    const collection = await getCollection(collectionId);
    const fieldKeys = collection.fields.map((f) => f.key);

    let rows: Record<string, unknown>[] = [];

    if (includeData) {
      console.log(`  Fetching data rows...`);
      const items = await queryItems(collectionId);
      rows = items.map((item) => item.data);
    }

    const csv = toCsv(fieldKeys, rows);
    const outPath = path.join(cmsDir, filename);
    fs.writeFileSync(outPath, csv, "utf-8");
    console.log(`  Wrote ${outPath} (${fieldKeys.length} fields, ${rows.length} rows)`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2: Write the GitHub Actions workflow**

```yaml
name: CMS Sync

on:
  workflow_dispatch:
    inputs:
      include_data:
        description: "Download data rows (not just headers)"
        required: false
        type: boolean
        default: false
  schedule:
    - cron: "0 6 * * 1" # Weekly on Monday at 06:00 UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Sync CMS collections
        env:
          WIX_API_KEY: ${{ secrets.WIX_API_KEY }}
          WIX_SITE_ID: ${{ secrets.WIX_SITE_ID }}
        run: |
          args=""
          if [ "${{ inputs.include_data }}" = "true" ]; then
            args="--include-data"
          fi
          npx tsx scripts/cms-sync.ts $args

      - name: Check for changes
        id: diff
        run: |
          git diff --quiet cms/ && echo "changed=false" >> "$GITHUB_OUTPUT" || echo "changed=true" >> "$GITHUB_OUTPUT"

      - name: Create PR
        if: steps.diff.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          branch="chore/cms-sync-$(date +%Y%m%d-%H%M%S)"
          git checkout -b "$branch"
          git add cms/
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git commit -m "chore: update CMS collection snapshots"
          git push -u origin "$branch"
          gh pr create \
            --title "chore: update CMS collection snapshots" \
            --body "Automated CMS sync detected schema changes. Review the diff to see what changed in the Wix collections." \
            --base main
```

**Step 3: Commit**

```
git add scripts/cms-sync.ts .github/workflows/cms-sync.yml
git commit -m "ci: add CMS sync workflow with Wix API integration"
```

---

### Task 4: Wire `check-cms` into package.json

**Files:**
- Modify: `package.json`

**Step 1: Add the script**

Add to `scripts`:
```json
"check-cms": "tsx scripts/check-cms-contract.ts",
"cms:sync": "tsx scripts/cms-sync.ts"
```

**Step 2: Commit**

```
git add package.json
git commit -m "chore: add check-cms and cms:sync npm scripts"
```

---

### Task 5: Verify and push

**Step 1: Run the full local pipeline**

Run each in order:
- `npx tsc --noEmit`
- `npx tsx scripts/validate-config.ts`
- `npx tsx scripts/check-cms-contract.ts` (expect FAIL — this is correct)
- `npx vite build`

**Step 2: Push branch and open PR**

The CI workflow will run on the PR. The CMS contract check will fail, surfacing the header mismatches that need fixing in the CSV files.
