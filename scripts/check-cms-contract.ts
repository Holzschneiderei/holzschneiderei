/**
 * CMS contract checker: validates that CSV files in cms/ contain the
 * field names the app expects when writing to Wix CMS collections.
 *
 * Run: npx tsx scripts/check-cms-contract.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const cmsDir = join(import.meta.dirname, "..", "cms");

// Field manifest — the field IDs the app sends to each Wix CMS collection.
const manifest: Record<string, string[]> = {
  "Garderobe+Bestellungen": [
    "title", "typ", "schriftzug", "schriftart", "berg", "holzart",
    "breite", "hoehe", "tiefe", "oberflaeche", "haken", "hakenmaterial",
    "hutablage", "extras", "bemerkungen", "anrede", "vorname", "nachname",
    "email", "telefon", "strasse", "plz", "ort", "status", "preis",
  ],
  "Konfigurationen": [
    "sessionId", "typ", "holzart", "oberflaeche", "breite", "hoehe",
    "tiefe", "haken", "hakenmaterial", "extras", "berg", "schriftart",
    "namenszug", "hutablage", "bemerkungen", "preis", "anrede", "vorname",
    "nachname", "email", "telefon", "strasse", "plz", "ort", "status",
    "checkoutId",
  ],
  "ConfiguratorAdmin": ["config"],
};

function parseHeaders(raw: string): string[] {
  // Strip BOM, trim, split on comma, remove surrounding quotes
  return raw
    .replace(/^\uFEFF/, "")
    .trim()
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${msg}`);
  } else {
    failed++;
    console.error(`  \u2717 ${msg}`);
  }
}

console.log("\nCMS contract check\n");

const csvFiles = readdirSync(cmsDir).filter((f) => f.endsWith(".csv"));

for (const [collection, expectedFields] of Object.entries(manifest)) {
  const fileName = `${collection}.csv`;
  const filePath = join(cmsDir, fileName);

  if (!csvFiles.includes(fileName)) {
    assert(false, `${fileName} — file not found`);
    continue;
  }

  const firstLine = readFileSync(filePath, "utf-8").split(/\r?\n/)[0] ?? "";
  const headers = parseHeaders(firstLine).map((h) => h.toLowerCase());

  console.log(`  ${fileName}`);

  for (const field of expectedFields) {
    assert(
      headers.includes(field.toLowerCase()),
      `  ${field}`,
    );
  }
}

// Warn about CSV files with no manifest entry (informational, not a failure)
for (const f of csvFiles) {
  const name = f.replace(/\.csv$/, "");
  if (!(name in manifest)) {
    console.log(`  ⚠ ${f} — no manifest entry (skipped)`);
  }
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
