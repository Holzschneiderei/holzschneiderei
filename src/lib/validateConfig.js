/**
 * Validate the shape of a config object.
 * Returns { ok: true } or { ok: false, reason: string }.
 *
 * Extracted from useConfigManager so it can also be tested
 * at build time without a React runtime.
 */
export default function validateConfigShape(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, reason: "Ungültige Datei — kein JSON-Objekt." };
  }

  // constr: must be an object with numeric keys
  const CONSTR_KEYS = ["MIN_W", "MAX_W", "MIN_H", "MAX_H", "MIN_D", "MAX_D", "HOOK_SPACING", "EDGE_MARGIN", "LETTER_W", "LETTER_MARGIN"];
  if (data.constr) {
    if (typeof data.constr !== "object") return { ok: false, reason: "constr muss ein Objekt sein." };
    for (const k of CONSTR_KEYS) {
      if (k in data.constr && (typeof data.constr[k] !== "number" || isNaN(data.constr[k]))) {
        return { ok: false, reason: `constr.${k} muss eine Zahl sein.` };
      }
    }
  }

  // pricing: object with numeric top-level values and nested objects
  if (data.pricing) {
    if (typeof data.pricing !== "object") return { ok: false, reason: "pricing muss ein Objekt sein." };
    for (const k of ["labourRate", "hoursBase", "hoursPerM2", "margin"]) {
      if (k in data.pricing && (typeof data.pricing[k] !== "number" || isNaN(data.pricing[k]))) {
        return { ok: false, reason: `pricing.${k} muss eine Zahl sein.` };
      }
    }
    for (const sub of ["woodCosts", "extrasCosts"]) {
      if (data.pricing[sub]) {
        if (typeof data.pricing[sub] !== "object") return { ok: false, reason: `pricing.${sub} muss ein Objekt sein.` };
        for (const [k, v] of Object.entries(data.pricing[sub])) {
          if (typeof v !== "number" || isNaN(v)) return { ok: false, reason: `pricing.${sub}.${k} muss eine Zahl sein.` };
        }
      }
    }
  }

  // dimConfig: keys must have { enabled: bool, mode: string, presets: number[] }
  if (data.dimConfig) {
    if (typeof data.dimConfig !== "object") return { ok: false, reason: "dimConfig muss ein Objekt sein." };
    for (const [dim, cfg] of Object.entries(data.dimConfig)) {
      if (typeof cfg !== "object") return { ok: false, reason: `dimConfig.${dim} muss ein Objekt sein.` };
      if ("enabled" in cfg && typeof cfg.enabled !== "boolean") return { ok: false, reason: `dimConfig.${dim}.enabled muss boolean sein.` };
      if ("mode" in cfg && typeof cfg.mode !== "string") return { ok: false, reason: `dimConfig.${dim}.mode muss ein String sein.` };
      if ("presets" in cfg && !Array.isArray(cfg.presets)) return { ok: false, reason: `dimConfig.${dim}.presets muss ein Array sein.` };
    }
  }

  // stepOrder: must be an array
  if ("stepOrder" in data && !Array.isArray(data.stepOrder)) return { ok: false, reason: "stepOrder muss ein Array sein." };

  // toggle-set maps: must be objects (e.g. { eiche: true, buche: false })
  for (const k of ["enabledHolzarten", "enabledSchriftarten", "enabledBerge"]) {
    if (k in data) {
      if (typeof data[k] !== "object" || data[k] === null || Array.isArray(data[k])) return { ok: false, reason: `${k} muss ein Objekt sein.` };
    }
  }

  // enabledSteps: must be an object with boolean values
  if (data.enabledSteps) {
    if (typeof data.enabledSteps !== "object" || Array.isArray(data.enabledSteps)) return { ok: false, reason: "enabledSteps muss ein Objekt sein." };
    for (const [k, v] of Object.entries(data.enabledSteps)) {
      if (typeof v !== "boolean") return { ok: false, reason: `enabledSteps.${k} muss boolean sein.` };
    }
  }

  // bergDisplay: optional object { mode, showName, showHeight, showRegion, labelFont }
  if ("bergDisplay" in data && (typeof data.bergDisplay !== "object" || data.bergDisplay === null || Array.isArray(data.bergDisplay))) {
    return { ok: false, reason: "bergDisplay muss ein Objekt sein." };
  }

  // texts: object with per-step objects (values can be strings or booleans)
  if (data.texts) {
    if (typeof data.texts !== "object" || Array.isArray(data.texts)) return { ok: false, reason: "texts muss ein Objekt sein." };
    for (const [step, vals] of Object.entries(data.texts)) {
      if (typeof vals !== "object" || Array.isArray(vals)) return { ok: false, reason: `texts.${step} muss ein Objekt sein.` };
      for (const [k, v] of Object.entries(vals)) {
        if (typeof v !== "string" && typeof v !== "boolean") return { ok: false, reason: `texts.${step}.${k} muss ein String oder Boolean sein.` };
      }
    }
  }

  // v3 array fields: must be arrays if present (CS-15)
  for (const k of ["oberflaechenItems", "extrasItems", "hakenMatItems", "darstellungItems", "products"]) {
    if (k in data && !Array.isArray(data[k])) return { ok: false, reason: `${k} muss ein Array sein.` };
  }

  // fusionEnabled: must be boolean if present
  if ("fusionEnabled" in data && typeof data.fusionEnabled !== "boolean") {
    return { ok: false, reason: "fusionEnabled muss ein Boolean sein." };
  }

  // categoryVisibility: must be an object if present
  if (data.categoryVisibility) {
    if (typeof data.categoryVisibility !== "object" || Array.isArray(data.categoryVisibility)) {
      return { ok: false, reason: "categoryVisibility muss ein Objekt sein." };
    }
  }

  // showroom: must be an object if present
  if (data.showroom) {
    if (typeof data.showroom !== "object" || Array.isArray(data.showroom)) {
      return { ok: false, reason: "showroom muss ein Objekt sein." };
    }
  }

  return { ok: true };
}
