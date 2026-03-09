import { useCallback } from "react";
import { send, saveSettings } from "../bridge";
import validateConfigShape from "../lib/validateConfig";

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
  texts, setTexts,
  showroom, setShowroom,
}) {
  const getConfig = useCallback(() => ({
    version: 3, constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled, texts, showroom,
  }), [constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled, texts, showroom]);

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
    if (data.texts) setTexts(prev => ({ ...prev, ...data.texts }));
    if (data.showroom) setShowroom(data.showroom);
    return { ok: true };
  }, [setConstr, setDimConfig, setEnabledHolzarten, setEnabledSteps, setPricing, setStepOrder,
    setEnabledSchriftarten, setEnabledBerge, setBergDisplay,
    setOberflaechenItems, setExtrasItems, setHakenMatItems, setDarstellungItems, setProducts, setFusionEnabled, setTexts, setShowroom]);

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
