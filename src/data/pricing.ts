import type { Constraints, Pricing, DimConfig, Limits, PriceBreakdown, FormState, Product } from "../types/config";

export const DEFAULT_CONSTR: Constraints = {
  MIN_W: 30, MAX_W: 100,
  MIN_H: 80, MAX_H: 250,
  MIN_D: 20, MAX_D: 60,
  HOOK_SPACING: 10, EDGE_MARGIN: 5,
  LETTER_W: 5, LETTER_MARGIN: 4,
};

export const DEFAULT_PRICING: Pricing = {
  woodCosts: { eiche: 85, buche: 65, esche: 75, nussbaum: 120, ahorn: 70, arve: 95 },
  labourRate: 75,
  hoursBase: 4,
  hoursPerM2: 2,
  extrasCosts: { spiegel: 120, schuhablage: 180, schublade: 220, schluesselleiste: 45, sitzbank: 280 },
  margin: 1.8,
};

export function makeDefaultDimConfig(constr: Constraints): DimConfig {
  return {
    breite: { enabled: true, mode: "pills", presets: [30, 40, 50, 60, 70, 80, 90, 100].filter(v => v >= constr.MIN_W && v <= constr.MAX_W) },
    hoehe: { enabled: true, mode: "pills", presets: [100, 120, 140, 160, 180, 200, 220, 250].filter(v => v >= constr.MIN_H && v <= constr.MAX_H) },
    tiefe: { enabled: true, mode: "combo", presets: [20, 25, 30, 35, 40, 50, 60].filter(v => v >= constr.MIN_D && v <= constr.MAX_D) },
  };
}

export function hooksFor(w: number, constr: Constraints): number {
  const u = w - 2 * constr.EDGE_MARGIN;
  return u < 0 ? 0 : Math.floor(u / constr.HOOK_SPACING) + 1;
}

export function minWForHooks(n: number, constr: Constraints): number {
  return n <= 1 ? constr.MIN_W : (n - 1) * constr.HOOK_SPACING + 2 * constr.EDGE_MARGIN;
}

export function computeLimits(form: FormState, constr: Constraints): Limits {
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
  const hookOptions: number[] = []; for (let i = 1; i <= maxHooks; i++) hookOptions.push(i);
  return { minW, maxW, minWText, textTooLong, maxLetters, letters, maxHooks, maxHooksMax, maxHooksMin, hookOptions, clampedW: w };
}

export function computePrice(form: FormState, pricing: Pricing, product?: Product): PriceBreakdown {
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
