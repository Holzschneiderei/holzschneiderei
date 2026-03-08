/**
 * Showroom preset definitions for the configurator.
 * Presets represent pre-configured product snapshots displayed in a showroom gallery.
 */

let _counter = 0;

/**
 * @typedef {"grid" | "hero" | "carousel"} ShowroomLayout
 * @typedef {"summary" | "wizard" | "detail"} ClickBehavior
 */

/**
 * @typedef {Object} Preset
 * @property {string}       id             - Unique identifier
 * @property {string}       title          - Display title
 * @property {string}       desc           - Description text
 * @property {string[]}     images         - Image URLs
 * @property {string}       productId      - Links to product type
 * @property {Partial<import('./constants.js').FormState>} formSnapshot - Partial form state
 * @property {ClickBehavior} clickBehavior - What happens on click
 * @property {boolean}      isBlank        - Whether this is a blank preset
 * @property {number}       sortOrder      - Display order
 * @property {boolean}      enabled        - Whether the preset is active
 * @property {boolean|null} showPrice      - null = use global, true/false = override
 * @property {boolean|null} showSpecs      - null = use global, true/false = override
 * @property {boolean}      showTitle      - Show title in card
 * @property {boolean}      showDesc       - Show description in card
 * @property {string}       ctaText        - Call-to-action button text
 */

/**
 * @typedef {Object} Showroom
 * @property {ShowroomLayout} layout    - Gallery layout mode
 * @property {number}         columns   - Number of columns for grid layout
 * @property {boolean}        showPrice - Global default for price visibility
 * @property {boolean}        showSpecs - Global default for specs visibility
 * @property {Preset[]}       presets   - Array of showroom presets
 */

/** @type {Showroom} */
export const DEFAULT_SHOWROOM = {
  layout: "grid",
  columns: 3,
  showPrice: true,
  showSpecs: true,
  presets: [],
};

/**
 * Create a new preset with a unique ID.
 * @param {Partial<Preset>} [overrides={}]
 * @returns {Preset}
 */
export function createPreset(overrides = {}) {
  return {
    id: `preset-${Date.now()}-${_counter++}`,
    title: "",
    desc: "",
    images: [],
    productId: "",
    formSnapshot: {},
    clickBehavior: "wizard",
    isBlank: true,
    sortOrder: 0,
    enabled: true,
    showPrice: null,
    showSpecs: null,
    showTitle: true,
    showDesc: true,
    ctaText: "Jetzt gestalten",
    ...overrides,
  };
}

/**
 * Merge a preset's formSnapshot over the default form, setting the product from the preset.
 * @param {import('./constants.js').FormState} defaultForm
 * @param {Preset} preset
 * @returns {import('./constants.js').FormState}
 */
export function hydrateForm(defaultForm, preset) {
  return {
    ...defaultForm,
    ...preset.formSnapshot,
    product: preset.productId,
  };
}

/**
 * Derive display specs from a form snapshot.
 * Returns human-readable strings like ["Eiche", "80 cm", "6 Haken", "Alpstein"].
 * @param {Partial<import('./constants.js').FormState>} formSnapshot
 * @param {import('./products.js').DEFAULT_PRODUCTS} products
 * @returns {string[]}
 */
export function deriveSpecs(formSnapshot, products) {
  const specs = [];

  if (formSnapshot.holzart) {
    specs.push(formSnapshot.holzart.charAt(0).toUpperCase() + formSnapshot.holzart.slice(1));
  }

  if (formSnapshot.breite) {
    specs.push(`${formSnapshot.breite} cm`);
  }

  if (formSnapshot.haken) {
    const product = products.find((p) => p.id === formSnapshot.product);
    if (product && product.steps && product.steps.includes("ausfuehrung")) {
      specs.push(`${formSnapshot.haken} Haken`);
    }
  }

  if (formSnapshot.schriftzug) {
    specs.push(`\u201E${formSnapshot.schriftzug}\u201C`);
  }

  return specs;
}
