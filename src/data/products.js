/**
 * Product definitions for the configurator.
 * Each product defines its own steps, option subsets, constraints, and fixed pricing.
 */

export const DEFAULT_PRODUCTS = [
  {
    id: "garderobe",
    label: "Garderobe",
    desc: "Garderobe mit Haken, Hutablage und Extras. Dein pers\u00F6nlicher Schriftzug als Dekoration.",
    icon: "\u{1F6AA}",
    enabled: true,
    comingSoon: false,
    teaser: "",
    steps: ["motiv", "holzart", "masse", "ausfuehrung", "extras", "kontakt", "uebersicht"],
    optionLists: ["holzarten", "oberflaechen", "hakenMaterialien", "extrasOptions"],
    motif: "schriftzug",
    constraints: {
      MIN_W: 50, MAX_W: 80,
      MIN_H: 80, MAX_H: 250,
      MIN_D: 20, MAX_D: 60,
      HOOK_SPACING: 10, EDGE_MARGIN: 5,
      LETTER_W: 5, LETTER_MARGIN: 4,
    },
    fixedPrices: {
      "50-eiche": 389, "60-eiche": 449, "70-eiche": 509, "80-eiche": 569,
      "50-buche": 349, "60-buche": 399, "70-buche": 459, "80-buche": 519,
      "50-esche": 369, "60-esche": 429, "70-esche": 489, "80-esche": 549,
      "50-nussbaum": 429, "60-nussbaum": 499, "70-nussbaum": 569, "80-nussbaum": 639,
      "50-ahorn": 359, "60-ahorn": 409, "70-ahorn": 469, "80-ahorn": 529,
      "50-arve": 399, "60-arve": 459, "70-arve": 519, "80-arve": 579,
    },
    sortOrder: 0,
    // Grouping: garderobe is a variant of the "schriftzug" group
    group: "schriftzug",
    variantLabel: "Garderobe mit Haken",
    variantDesc: "Schriftzug + Haken, Hutablage und Extras",
    variantIcon: "\u{1F6AA}",
  },
  {
    id: "schriftzug",
    label: "Schriftzug",
    desc: "Freistehender Schriftzug aus Massivholz. Als Wandmontage oder mit St\u00E4nder.",
    icon: "\u270F\uFE0F",
    enabled: true,
    comingSoon: false,
    teaser: "",
    steps: ["motiv", "holzart", "masse", "darstellung", "kontakt", "uebersicht"],
    optionLists: ["holzarten", "oberflaechen", "darstellungen"],
    motif: null,
    constraints: {
      MIN_W: 30, MAX_W: 80,
      MIN_H: 10, MAX_H: 30,
      MIN_D: 2, MAX_D: 5,
      HOOK_SPACING: 10, EDGE_MARGIN: 5,
      LETTER_W: 5, LETTER_MARGIN: 4,
    },
    fixedPrices: {
      "30-eiche": 219, "40-eiche": 259, "50-eiche": 299, "60-eiche": 349, "70-eiche": 399, "80-eiche": 449,
      "30-buche": 189, "40-buche": 229, "50-buche": 269, "60-buche": 309, "70-buche": 359, "80-buche": 409,
      "30-esche": 209, "40-esche": 249, "50-esche": 289, "60-esche": 339, "70-esche": 389, "80-esche": 439,
      "30-nussbaum": 259, "40-nussbaum": 309, "50-nussbaum": 359, "60-nussbaum": 409, "70-nussbaum": 469, "80-nussbaum": 529,
      "30-ahorn": 199, "40-ahorn": 239, "50-ahorn": 279, "60-ahorn": 319, "70-ahorn": 369, "80-ahorn": 419,
      "30-arve": 229, "40-arve": 269, "50-arve": 309, "60-arve": 359, "70-arve": 409, "80-arve": 459,
    },
    sortOrder: 1,
    // Grouping: this is the primary product of the "schriftzug" group
    group: "schriftzug",
    groupPrimary: true,
    groupLabel: "Schriftzug",
    groupDesc: "Dein Text als Massivholz-Schriftzug \u2013 als Wanddeko oder Garderobe.",
    groupIcon: "\u270F\uFE0F",
    variantLabel: "Nur Schriftzug",
    variantDesc: "Wandmontage oder mit St\u00E4nder",
    variantIcon: "\u270F\uFE0F",
  },
  {
    id: "bergmotiv",
    label: "Bergmotiv",
    desc: "Silhouette eines Schweizer Bergs aus Massivholz.",
    icon: "\u26F0\uFE0F",
    enabled: false,
    comingSoon: true,
    teaser: "Bergmotiv-Produkte sind bald verf\u00FCgbar. Hinterlasse deine E-Mail, um benachrichtigt zu werden.",
    steps: [],
    optionLists: [],
    motif: null,
    constraints: {},
    fixedPrices: {},
    sortOrder: 2,
    group: null,
  },
];

/**
 * Get grouped products for the wizard product selection.
 * Returns an array of { primary, variants, allProducts } objects + standalone products.
 * Groups are defined by matching `group` fields. One product per group has `groupPrimary: true`.
 */
export function getProductGroups(products) {
  const enabled = products.filter((p) => p.enabled || p.comingSoon).sort((a, b) => a.sortOrder - b.sortOrder);
  const grouped = new Map();
  const standalone = [];

  for (const p of enabled) {
    if (p.group) {
      if (!grouped.has(p.group)) grouped.set(p.group, []);
      grouped.get(p.group).push(p);
    } else {
      standalone.push(p);
    }
  }

  const result = [];
  for (const [, members] of grouped) {
    const primary = members.find((m) => m.groupPrimary) || members[0];
    const variants = members.filter((m) => !m.comingSoon);
    if (variants.length > 0) {
      result.push({ type: "group", primary, variants, allProducts: members });
    }
  }
  // Sort groups by primary sortOrder
  result.sort((a, b) => a.primary.sortOrder - b.primary.sortOrder);
  // Add standalone products
  for (const p of standalone) {
    result.push({ type: "standalone", product: p });
  }
  return result;
}

/**
 * Compute fixed price for a product.
 * Returns the price from the product's fixedPrices table, or null if not found.
 */
export function computeFixedPrice(form, product) {
  if (!product || !product.fixedPrices) return null;
  const key = `${form.breite}-${form.holzart}`;
  return product.fixedPrices[key] ?? null;
}

/**
 * Get available width options from a product's fixed price table.
 */
export function getProductWidths(product) {
  if (!product || !product.fixedPrices) return [];
  const widths = new Set();
  for (const key of Object.keys(product.fixedPrices)) {
    widths.add(parseInt(key.split("-")[0]));
  }
  return [...widths].sort((a, b) => a - b);
}
