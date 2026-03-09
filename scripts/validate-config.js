#!/usr/bin/env node
/**
 * Build-time validation: ensures that the default config produced by
 * getConfig() passes validateConfigShape().
 *
 * This catches regressions where state shapes evolve but the validator
 * doesn't — which silently blocks ALL admin config from being applied.
 *
 * Run: node scripts/validate-config.js
 * Also runs as part of: npm run validate
 */
import { OPTIONAL_STEPS, DEFAULT_TEXTS } from "../src/data/constants.js";
import { DEFAULT_CONSTR, DEFAULT_PRICING, makeDefaultDimConfig } from "../src/data/pricing.js";
import { DEFAULT_PRODUCTS } from "../src/data/products.js";
import {
  DEFAULT_HOLZARTEN, DEFAULT_OBERFLAECHEN, DEFAULT_EXTRAS_OPTIONS,
  DEFAULT_HAKEN_MATERIALIEN, DEFAULT_BERGE, DEFAULT_SCHRIFTARTEN, DEFAULT_DARSTELLUNGEN,
} from "../src/data/optionLists.js";
import { DEFAULT_SHOWROOM } from "../src/data/showroom.js";
import validateConfigShape from "../src/lib/validateConfig.js";

// ── Build the same config blob that getConfig() returns at runtime ──

function toToggleMap(items) {
  return items.reduce((acc, item) => ({ ...acc, [item.value]: item.enabled !== false }), {});
}

const config = {
  version: 3,
  constr: DEFAULT_CONSTR,
  dimConfig: makeDefaultDimConfig(DEFAULT_CONSTR),
  enabledHolzarten: toToggleMap(DEFAULT_HOLZARTEN),
  enabledSchriftarten: toToggleMap(DEFAULT_SCHRIFTARTEN),
  enabledBerge: toToggleMap(DEFAULT_BERGE),
  bergDisplay: { mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" },
  enabledSteps: OPTIONAL_STEPS.reduce((acc, s) => ({ ...acc, [s.id]: !!s.defaultOn }), {}),
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

// ── Run validation ──

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("\nConfig shape validation\n");

// Test 1: Default config passes
const r1 = validateConfigShape(config);
assert(r1.ok, `Default config passes validation${r1.ok ? "" : ": " + r1.reason}`);

// Test 2: JSON round-trip (simulates CMS persistence)
const roundTripped = JSON.parse(JSON.stringify(config));
const r2 = validateConfigShape(roundTripped);
assert(r2.ok, `Config survives JSON round-trip${r2.ok ? "" : ": " + r2.reason}`);

// Test 3: Config with admin-modified texts (booleans like showHeading)
const withTextToggles = {
  ...roundTripped,
  texts: {
    produktwahl: {
      heading: "Custom Heading",
      subheading: "Custom Subheading",
      description: "Custom Description",
      showHeading: false,
      showSubheading: true,
      showDescription: false,
    },
  },
};
const r3 = validateConfigShape(withTextToggles);
assert(r3.ok, `Config with text toggles (booleans) passes${r3.ok ? "" : ": " + r3.reason}`);

// Test 4: bergDisplay as object
const withBergObj = { ...roundTripped, bergDisplay: { mode: "clean", showName: false, showHeight: true, showRegion: false, labelFont: "serif" } };
const r4 = validateConfigShape(withBergObj);
assert(r4.ok, `bergDisplay as object passes${r4.ok ? "" : ": " + r4.reason}`);

// Test 5: Invalid config should fail
const r5 = validateConfigShape("not an object");
assert(!r5.ok, "String input correctly rejected");

const r6 = validateConfigShape({ constr: { MIN_W: "not a number" } });
assert(!r6.ok, "Invalid constr value correctly rejected");

const r7 = validateConfigShape({ enabledSteps: { holzart: "yes" } });
assert(!r7.ok, "Non-boolean enabledSteps value correctly rejected");

const r8 = validateConfigShape({ bergDisplay: "relief" });
assert(!r8.ok, "bergDisplay as string correctly rejected");

const r9 = validateConfigShape({ texts: { produktwahl: { heading: 42 } } });
assert(!r9.ok, "Numeric text value correctly rejected");

// ── Summary ──
console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
