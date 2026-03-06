/**
 * @typedef {Object} Constraints
 * @property {number} MIN_W       - Minimum width (cm)
 * @property {number} MAX_W       - Maximum width (cm)
 * @property {number} MIN_H       - Minimum height (cm)
 * @property {number} MAX_H       - Maximum height (cm)
 * @property {number} MIN_D       - Minimum depth (cm)
 * @property {number} MAX_D       - Maximum depth (cm)
 * @property {number} HOOK_SPACING - Centre-to-centre hook spacing (cm)
 * @property {number} EDGE_MARGIN  - Margin from board edge to first hook (cm)
 * @property {number} LETTER_W     - Width per letter for engraving (cm)
 * @property {number} LETTER_MARGIN - Margin left/right of engraved text (cm)
 */

/** @type {Constraints} */
export const DEFAULT_CONSTR = {
  MIN_W: 30, MAX_W: 100,
  MIN_H: 80, MAX_H: 250,
  MIN_D: 20, MAX_D: 60,
  HOOK_SPACING: 10, EDGE_MARGIN: 5,
  LETTER_W: 5, LETTER_MARGIN: 4,
};

/**
 * @typedef {Object} Pricing
 * @property {Record<import('./constants').HolzartValue, number>} woodCosts - CHF per m² by wood type
 * @property {number} labourRate   - CHF per hour
 * @property {number} hoursBase    - Base hours per unit
 * @property {number} hoursPerM2   - Additional hours per m²
 * @property {Record<string, number>} extrasCosts - CHF per extra option
 * @property {number} margin       - Markup multiplier (e.g. 1.8 = 80 % margin)
 */

/** @type {Pricing} */
export const DEFAULT_PRICING = {
  woodCosts: { eiche: 85, esche: 75, nussbaum: 120, ahorn: 70, arve: 95 },
  labourRate: 75,
  hoursBase: 4,
  hoursPerM2: 2,
  extrasCosts: { spiegel: 120, schuhablage: 180, schublade: 220, schluesselleiste: 45, sitzbank: 280 },
  margin: 1.8,
};

/**
 * @typedef {"text" | "combo" | "pills"} DimModeValue
 * @typedef {{ enabled: boolean, mode: DimModeValue, presets: number[] }} DimFieldConfig
 * @typedef {{ breite: DimFieldConfig, hoehe: DimFieldConfig, tiefe: DimFieldConfig }} DimConfig
 */

/**
 * Build default dimension-field config from constraints.
 * @param {Constraints} constr
 * @returns {DimConfig}
 */
export function makeDefaultDimConfig(constr) {
  return {
    breite: { enabled: true, mode: "pills", presets: [30, 40, 50, 60, 70, 80, 90, 100].filter(v => v >= constr.MIN_W && v <= constr.MAX_W) },
    hoehe: { enabled: true, mode: "pills", presets: [100, 120, 140, 160, 180, 200, 220, 250].filter(v => v >= constr.MIN_H && v <= constr.MAX_H) },
    tiefe: { enabled: true, mode: "combo", presets: [20, 25, 30, 35, 40, 50, 60].filter(v => v >= constr.MIN_D && v <= constr.MAX_D) },
  };
}

/**
 * Compute max hooks that fit in a given width. Stable reference — safe for memo deps.
 * @param {number} w - Board width in cm
 * @param {Constraints} constr
 * @returns {number}
 */
export function hooksFor(w, constr) {
  const u = w - 2 * constr.EDGE_MARGIN;
  return u < 0 ? 0 : Math.floor(u / constr.HOOK_SPACING) + 1;
}

/**
 * Minimum width required to fit n hooks. Stable reference — safe for memo deps.
 * @param {number} n - Number of hooks
 * @param {Constraints} constr
 * @returns {number}
 */
export function minWForHooks(n, constr) {
  return n <= 1 ? constr.MIN_W : (n - 1) * constr.HOOK_SPACING + 2 * constr.EDGE_MARGIN;
}

/**
 * @typedef {Object} Limits
 * @property {number}   minW         - Effective minimum width (may be raised by text length)
 * @property {number}   maxW         - Maximum width from constraints
 * @property {number}   minWText     - Minimum width needed for engraved text alone
 * @property {boolean}  textTooLong  - True if the text cannot fit within MAX_W
 * @property {number}   maxLetters   - Max letters that fit in MAX_W
 * @property {number}   letters      - Current non-whitespace letter count
 * @property {number}   maxHooks     - Max hooks at current width
 * @property {number}   maxHooksMax  - Max hooks at maximum width
 * @property {number}   maxHooksMin  - Max hooks at minimum width
 * @property {number[]} hookOptions  - Array [1..maxHooks]
 * @property {number}   clampedW     - Width clamped to [minW, maxW]
 */

/**
 * Derive dimensional limits from current form state and constraints.
 * @param {import('./constants').FormState} form
 * @param {Constraints} constr
 * @returns {Limits}
 */
export function computeLimits(form, constr) {
  const letters = form.typ === "schriftzug" ? form.schriftzug.replace(/\s/g, "").length : 0;
  const minWText = letters > 0 ? letters * constr.LETTER_W + 2 * constr.LETTER_MARGIN : 0;
  const minW = Math.max(constr.MIN_W, minWText);
  const maxW = constr.MAX_W;
  const textTooLong = minW > maxW;
  const maxLetters = Math.floor((maxW - 2 * constr.LETTER_MARGIN) / constr.LETTER_W);
  const w = Math.max(minW, Math.min(maxW, parseInt(form.breite) || minW));
  const maxHooks = hooksFor(w, constr);
  const maxHooksMax = hooksFor(maxW, constr);
  const maxHooksMin = hooksFor(minW, constr);
  const hookOptions = []; for (let i = 1; i <= maxHooks; i++) hookOptions.push(i);
  return { minW, maxW, minWText, textTooLong, maxLetters, letters, maxHooks, maxHooksMax, maxHooksMin, hookOptions, clampedW: w };
}

/**
 * @typedef {Object} PriceBreakdown
 * @property {number} surfaceM2      - Total surface area in m²
 * @property {number} materialCost   - Material cost (CHF)
 * @property {number} labourCost     - Labour cost (CHF)
 * @property {number} extrasCost     - Extras cost (CHF)
 * @property {number} estimatedHours - Estimated production hours
 * @property {number} productionCost - Total production cost before margin
 * @property {number} customerPrice  - Final customer price (CHF)
 */

/**
 * Calculate indicative price from form state and pricing config.
 * If a product with fixedPrices is provided, uses fixed pricing.
 * Falls back to formula-based pricing otherwise.
 * @param {import('./constants').FormState} form
 * @param {Pricing} pricing
 * @param {Object} [product] - Optional product with fixedPrices
 * @returns {PriceBreakdown}
 */
export function computePrice(form, pricing, product) {
  // Try fixed price first
  if (product && product.fixedPrices) {
    const key = `${form.breite}-${form.holzart}`;
    const fixed = product.fixedPrices[key];
    if (fixed != null) {
      return {
        surfaceM2: 0, materialCost: 0, labourCost: 0,
        extrasCost: 0, estimatedHours: 0, productionCost: 0,
        customerPrice: fixed,
        isFixed: true,
      };
    }
  }

  // Formula-based fallback
  const b = parseInt(form.breite) || 80;
  const h = parseInt(form.hoehe) || 180;
  const d = parseInt(form.tiefe) || 35;
  const surfaceM2 = (b * h * 2 + b * d * 2 + h * d * 2) / 10000;
  const materialCost = surfaceM2 * (pricing.woodCosts[form.holzart] || 85);
  const estimatedHours = pricing.hoursBase + surfaceM2 * pricing.hoursPerM2;
  const labourCost = estimatedHours * pricing.labourRate;
  const extrasCost = (form.extras || []).reduce((sum, ex) => sum + (pricing.extrasCosts[ex] || 0), 0);
  const productionCost = materialCost + labourCost + extrasCost;
  const customerPrice = productionCost * pricing.margin;
  return { surfaceM2, materialCost, labourCost, extrasCost, estimatedHours, productionCost, customerPrice, isFixed: false };
}
