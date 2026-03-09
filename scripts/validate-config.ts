/**
 * Build-time validation: ensures default config produced by getConfig()
 * passes validateConfigShape(). Catches regressions where state shapes
 * evolve but the validator doesn't.
 *
 * Run: npx tsx scripts/validate-config.ts
 */
import type { OptionItem, ToggleMap } from "../src/types/config";
import { OPTIONAL_STEPS, DEFAULT_TEXTS } from "../src/data/constants";
import { DEFAULT_CONSTR, DEFAULT_PRICING, makeDefaultDimConfig } from "../src/data/pricing";
import { DEFAULT_PRODUCTS } from "../src/data/products.js";
import {
  DEFAULT_HOLZARTEN, DEFAULT_OBERFLAECHEN, DEFAULT_EXTRAS_OPTIONS,
  DEFAULT_HAKEN_MATERIALIEN, DEFAULT_BERGE, DEFAULT_SCHRIFTARTEN, DEFAULT_DARSTELLUNGEN,
} from "../src/data/optionLists";
import { DEFAULT_SHOWROOM } from "../src/data/showroom.js";
import validateConfigShape from "../src/lib/validateConfig";

function toToggleMap(items: OptionItem[]): ToggleMap {
  return items.reduce<ToggleMap>((acc, item) => ({ ...acc, [item.value]: item.enabled !== false }), {});
}

const config = {
  version: 3,
  constr: DEFAULT_CONSTR,
  dimConfig: makeDefaultDimConfig(DEFAULT_CONSTR),
  enabledHolzarten: toToggleMap(DEFAULT_HOLZARTEN),
  enabledSchriftarten: toToggleMap(DEFAULT_SCHRIFTARTEN),
  enabledBerge: toToggleMap(DEFAULT_BERGE),
  bergDisplay: { mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" },
  enabledSteps: OPTIONAL_STEPS.reduce<Record<string, boolean>>((acc, s) => ({ ...acc, [s.id]: !!s.defaultOn }), {}),
  pricing: DEFAULT_PRICING,
  stepOrder: OPTIONAL_STEPS.map((s) => s.id),
  oberflaechenItems: DEFAULT_OBERFLAECHEN,
  extrasItems: DEFAULT_EXTRAS_OPTIONS,
  hakenMatItems: DEFAULT_HAKEN_MATERIALIEN,
  darstellungItems: DEFAULT_DARSTELLUNGEN,
  products: DEFAULT_PRODUCTS,
  categoryVisibility: { holzarten: true, oberflaechen: true, extras: true, hakenMaterialien: true, darstellungen: true },
  fusionEnabled: false,
  texts: DEFAULT_TEXTS,
  showroom: DEFAULT_SHOWROOM,
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) { passed++; console.log(`  \u2713 ${msg}`); }
  else { failed++; console.error(`  \u2717 ${msg}`); }
}

console.log("\nConfig shape validation\n");

// Positive tests
const r1 = validateConfigShape(config);
assert(r1.ok, `Default config passes${r1.ok ? "" : ": " + ("reason" in r1 ? r1.reason : "")}`);

const r2 = validateConfigShape(JSON.parse(JSON.stringify(config)));
assert(r2.ok, `JSON round-trip passes${r2.ok ? "" : ": " + ("reason" in r2 ? r2.reason : "")}`);

const withTextToggles = { ...JSON.parse(JSON.stringify(config)), texts: { produktwahl: { heading: "Test", showHeading: false, showSubheading: true, showDescription: false } } };
assert(validateConfigShape(withTextToggles).ok, "Text toggles (booleans) pass");

assert(validateConfigShape({ ...JSON.parse(JSON.stringify(config)), bergDisplay: { mode: "clean", showName: false, showHeight: true, showRegion: false, labelFont: "serif" } }).ok, "bergDisplay as object passes");

// Negative tests
assert(!validateConfigShape("not an object").ok, "String input rejected");
assert(!validateConfigShape({ constr: { MIN_W: "not a number" } }).ok, "Invalid constr rejected");
assert(!validateConfigShape({ enabledSteps: { holzart: "yes" } }).ok, "Non-boolean enabledSteps rejected");
assert(!validateConfigShape({ bergDisplay: "relief" }).ok, "bergDisplay as string rejected");
assert(!validateConfigShape({ texts: { produktwahl: { heading: 42 } } }).ok, "Numeric text value rejected");
assert(!validateConfigShape({ products: "not an array" }).ok, "products as string rejected");
assert(!validateConfigShape({ fusionEnabled: "yes" }).ok, "fusionEnabled as string rejected");
assert(!validateConfigShape({ enabledHolzarten: ["eiche"] }).ok, "enabledHolzarten as array rejected");

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
