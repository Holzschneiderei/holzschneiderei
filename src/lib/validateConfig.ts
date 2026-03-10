import type { ValidationResult } from "../types/config";

export default function validateConfigShape(data: unknown): ValidationResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, reason: "Ungültige Datei — kein JSON-Objekt." };
  }

  const d = data as Record<string, unknown>;

  // constr: must be an object with numeric keys
  const CONSTR_KEYS = ["MIN_W", "MAX_W", "MIN_H", "MAX_H", "MIN_D", "MAX_D", "HOOK_SPACING", "EDGE_MARGIN", "LETTER_W", "LETTER_MARGIN"];
  if (d.constr) {
    if (typeof d.constr !== "object") return { ok: false, reason: "constr muss ein Objekt sein." };
    const constr = d.constr as Record<string, unknown>;
    for (const k of CONSTR_KEYS) {
      if (k in constr && (typeof constr[k] !== "number" || Number.isNaN(constr[k] as number))) {
        return { ok: false, reason: `constr.${k} muss eine Zahl sein.` };
      }
    }
  }

  // pricing: object with numeric top-level values and nested objects
  if (d.pricing) {
    if (typeof d.pricing !== "object") return { ok: false, reason: "pricing muss ein Objekt sein." };
    const pricing = d.pricing as Record<string, unknown>;
    for (const k of ["labourRate", "hoursBase", "hoursPerM2", "margin"]) {
      if (k in pricing && (typeof pricing[k] !== "number" || Number.isNaN(pricing[k] as number))) {
        return { ok: false, reason: `pricing.${k} muss eine Zahl sein.` };
      }
    }
    for (const sub of ["woodCosts", "extrasCosts"]) {
      if (pricing[sub]) {
        if (typeof pricing[sub] !== "object") return { ok: false, reason: `pricing.${sub} muss ein Objekt sein.` };
        for (const [k, v] of Object.entries(pricing[sub] as Record<string, unknown>)) {
          if (typeof v !== "number" || Number.isNaN(v)) return { ok: false, reason: `pricing.${sub}.${k} muss eine Zahl sein.` };
        }
      }
    }
  }

  // dimConfig: keys must have { enabled: bool, mode: string, presets: number[] }
  if (d.dimConfig) {
    if (typeof d.dimConfig !== "object") return { ok: false, reason: "dimConfig muss ein Objekt sein." };
    for (const [dim, cfg] of Object.entries(d.dimConfig as Record<string, unknown>)) {
      if (typeof cfg !== "object" || cfg === null) return { ok: false, reason: `dimConfig.${dim} muss ein Objekt sein.` };
      const fc = cfg as Record<string, unknown>;
      if ("enabled" in fc && typeof fc.enabled !== "boolean") return { ok: false, reason: `dimConfig.${dim}.enabled muss boolean sein.` };
      if ("mode" in fc && typeof fc.mode !== "string") return { ok: false, reason: `dimConfig.${dim}.mode muss ein String sein.` };
      if ("presets" in fc && !Array.isArray(fc.presets)) return { ok: false, reason: `dimConfig.${dim}.presets muss ein Array sein.` };
    }
  }

  // stepOrder: must be an array
  if ("stepOrder" in d && !Array.isArray(d.stepOrder)) return { ok: false, reason: "stepOrder muss ein Array sein." };

  // toggle-set maps: must be objects (e.g. { eiche: true, buche: false })
  for (const k of ["enabledHolzarten", "enabledSchriftarten", "enabledBerge"]) {
    if (k in d) {
      if (typeof d[k] !== "object" || d[k] === null || Array.isArray(d[k])) return { ok: false, reason: `${k} muss ein Objekt sein.` };
    }
  }

  // enabledSteps: must be an object with boolean values
  if (d.enabledSteps) {
    if (typeof d.enabledSteps !== "object" || Array.isArray(d.enabledSteps)) return { ok: false, reason: "enabledSteps muss ein Objekt sein." };
    for (const [k, v] of Object.entries(d.enabledSteps as Record<string, unknown>)) {
      if (typeof v !== "boolean") return { ok: false, reason: `enabledSteps.${k} muss boolean sein.` };
    }
  }

  // bergDisplay: optional object { mode, showName, showHeight, showRegion, labelFont }
  if ("bergDisplay" in d && (typeof d.bergDisplay !== "object" || d.bergDisplay === null || Array.isArray(d.bergDisplay))) {
    return { ok: false, reason: "bergDisplay muss ein Objekt sein." };
  }

  // texts: object with per-section objects (values can be strings, booleans, or nested objects for step overrides)
  if (d.texts) {
    if (typeof d.texts !== "object" || Array.isArray(d.texts)) return { ok: false, reason: "texts muss ein Objekt sein." };
    for (const [section, vals] of Object.entries(d.texts as Record<string, unknown>)) {
      if (typeof vals !== "object" || vals === null || Array.isArray(vals)) return { ok: false, reason: `texts.${section} muss ein Objekt sein.` };
      for (const [k, v] of Object.entries(vals as Record<string, unknown>)) {
        if (typeof v === "string" || typeof v === "boolean") continue;
        // Allow one level of nesting for step text overrides (e.g. texts.steps.holzart = { title, subtitle })
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
            if (typeof sv !== "string" && typeof sv !== "boolean") return { ok: false, reason: `texts.${section}.${k}.${sk} muss ein String oder Boolean sein.` };
          }
          continue;
        }
        return { ok: false, reason: `texts.${section}.${k} muss ein String, Boolean oder Objekt sein.` };
      }
    }
  }

  // v3 array fields: must be arrays if present (CS-15)
  for (const k of ["oberflaechenItems", "extrasItems", "hakenMatItems", "darstellungItems", "products"]) {
    if (k in d && !Array.isArray(d[k])) return { ok: false, reason: `${k} muss ein Array sein.` };
  }

  // fusionEnabled: must be boolean if present
  if ("fusionEnabled" in d && typeof d.fusionEnabled !== "boolean") {
    return { ok: false, reason: "fusionEnabled muss ein Boolean sein." };
  }

  // categoryVisibility: must be an object if present
  if (d.categoryVisibility) {
    if (typeof d.categoryVisibility !== "object" || Array.isArray(d.categoryVisibility)) {
      return { ok: false, reason: "categoryVisibility muss ein Objekt sein." };
    }
  }

  // showroom: must be an object if present
  if (d.showroom) {
    if (typeof d.showroom !== "object" || Array.isArray(d.showroom)) {
      return { ok: false, reason: "showroom muss ein Objekt sein." };
    }
  }

  // stepDefaults: must be an object with object values if present
  if (d.stepDefaults) {
    if (typeof d.stepDefaults !== "object" || Array.isArray(d.stepDefaults)) {
      return { ok: false, reason: "stepDefaults muss ein Objekt sein." };
    }
    for (const [k, v] of Object.entries(d.stepDefaults as Record<string, unknown>)) {
      if (typeof v !== "object" || v === null || Array.isArray(v)) {
        return { ok: false, reason: `stepDefaults.${k} muss ein Objekt sein.` };
      }
    }
  }

  return { ok: true };
}
