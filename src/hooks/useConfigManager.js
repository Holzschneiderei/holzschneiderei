import { useCallback } from "react";
import { send, saveSettings } from "../bridge";

/**
 * Validate the shape of an imported config object.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
function validateConfigShape(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, reason: "Ungültige Datei — kein JSON-Objekt." };
  }

  // constr: must be an object with all required numeric keys
  const CONSTR_KEYS = ["MIN_W", "MAX_W", "MIN_H", "MAX_H", "MIN_D", "MAX_D", "HOOK_SPACING", "EDGE_MARGIN", "LETTER_W", "LETTER_MARGIN"];
  if (data.constr) {
    if (typeof data.constr !== "object") return { ok: false, reason: "constr muss ein Objekt sein." };
    for (const k of CONSTR_KEYS) {
      if (k in data.constr && (typeof data.constr[k] !== "number" || isNaN(data.constr[k]))) {
        return { ok: false, reason: `constr.${k} muss eine Zahl sein.` };
      }
    }
  }

  // pricing: must be an object with numeric top-level values and nested objects
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

  // arrays: must actually be arrays
  for (const k of ["enabledHolzarten", "enabledSchriftarten", "enabledBerge", "stepOrder"]) {
    if (k in data && !Array.isArray(data[k])) return { ok: false, reason: `${k} muss ein Array sein.` };
  }

  // enabledSteps: must be an object with boolean values
  if (data.enabledSteps) {
    if (typeof data.enabledSteps !== "object" || Array.isArray(data.enabledSteps)) return { ok: false, reason: "enabledSteps muss ein Objekt sein." };
    for (const [k, v] of Object.entries(data.enabledSteps)) {
      if (typeof v !== "boolean") return { ok: false, reason: `enabledSteps.${k} muss boolean sein.` };
    }
  }

  // bergDisplay: optional string
  if ("bergDisplay" in data && typeof data.bergDisplay !== "string") return { ok: false, reason: "bergDisplay muss ein String sein." };

  return { ok: true };
}

/**
 * Manages config export/import and persistence for admin mode.
 */
export default function useConfigManager({
  constr, setConstr, dimConfig, setDimConfig,
  enabledHolzarten, setEnabledHolzarten, enabledSchriftarten, setEnabledSchriftarten,
  enabledBerge, setEnabledBerge, bergDisplay, setBergDisplay,
  enabledSteps, setEnabledSteps, pricing, setPricing, stepOrder, setStepOrder,
  oberflaechenItems, setOberflaechenItems,
  extrasItems, setExtrasItems,
  hakenMatItems, setHakenMatItems,
  darstellungItems, setDarstellungItems,
  products, setProducts,
  categoryVisibility, setCategoryVisibility,
  fusionEnabled, setFusionEnabled,
}) {
  const getConfig = useCallback(() => ({
    version: 3, constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled,
  }), [constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled]);

  const applyConfig = useCallback((data) => {
    const result = validateConfigShape(data);
    if (!result.ok) return result;
    if (data.constr) setConstr(data.constr);
    if (data.dimConfig) setDimConfig(data.dimConfig);
    if (data.enabledHolzarten) setEnabledHolzarten(data.enabledHolzarten);
    if (data.enabledSteps) setEnabledSteps(data.enabledSteps);
    if (data.pricing) setPricing(data.pricing);
    if (data.stepOrder) setStepOrder(data.stepOrder);
    if (data.enabledSchriftarten) setEnabledSchriftarten(data.enabledSchriftarten);
    if (data.enabledBerge) setEnabledBerge(data.enabledBerge);
    if (data.bergDisplay) setBergDisplay(data.bergDisplay);
    // v3 fields
    if (data.oberflaechenItems) setOberflaechenItems(data.oberflaechenItems);
    if (data.extrasItems) setExtrasItems(data.extrasItems);
    if (data.hakenMatItems) setHakenMatItems(data.hakenMatItems);
    if (data.darstellungItems) setDarstellungItems(data.darstellungItems);
    if (data.products) setProducts(data.products);
    if (data.categoryVisibility) setCategoryVisibility(data.categoryVisibility);
    if (typeof data.fusionEnabled === 'boolean') setFusionEnabled(data.fusionEnabled);
    return { ok: true };
  }, [setConstr, setDimConfig, setEnabledHolzarten, setEnabledSteps, setPricing, setStepOrder,
    setEnabledSchriftarten, setEnabledBerge, setBergDisplay,
    setOberflaechenItems, setExtrasItems, setHakenMatItems, setDarstellungItems, setProducts, setFusionEnabled]);

  const exportParams = useCallback(() => {
    const config = getConfig();
    send("config-save", { config });
    saveSettings(config.pricing, config.constr);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "garderobe-parameter.json"; a.click();
    URL.revokeObjectURL(url);
  }, [getConfig]);

  const importParams = useCallback(() => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          const result = applyConfig(parsed);
          if (!result.ok) alert("Import fehlgeschlagen: " + result.reason);
        } catch {
          alert("Import fehlgeschlagen: Ungültige JSON-Datei.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [applyConfig]);

  return { getConfig, applyConfig, exportParams, importParams };
}
