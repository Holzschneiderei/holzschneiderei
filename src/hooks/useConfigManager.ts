import { useCallback } from "react";
import { saveSettings, send } from "../bridge";
import validateConfigShape from "../lib/validateConfig";
import type {
  AppConfig, BergDisplay, CarouselConfig, CategoryVisibility, Constraints, DimConfig, OptionItem,
  Pricing, Product, Showroom, Texts, ToggleMap, ValidationResult,
} from "../types/config";

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface ConfigManagerParams {
  constr: Constraints;
  setConstr: Setter<Constraints>;
  dimConfig: DimConfig;
  setDimConfig: Setter<DimConfig>;
  holzartenItems: OptionItem[];
  setHolzartenItems: Setter<OptionItem[]>;
  enabledHolzarten: ToggleMap;
  setEnabledHolzarten: (enabledMap: ToggleMap) => void;
  enabledSchriftarten: ToggleMap;
  setEnabledSchriftarten: Setter<ToggleMap>;
  enabledBerge: ToggleMap;
  setEnabledBerge: Setter<ToggleMap>;
  bergDisplay: BergDisplay;
  setBergDisplay: Setter<BergDisplay>;
  enabledSteps: Record<string, boolean>;
  setEnabledSteps: Setter<Record<string, boolean>>;
  pricing: Pricing;
  setPricing: Setter<Pricing>;
  stepOrder: string[];
  setStepOrder: Setter<string[]>;
  oberflaechenItems: OptionItem[];
  setOberflaechenItems: Setter<OptionItem[]>;
  extrasItems: OptionItem[];
  setExtrasItems: Setter<OptionItem[]>;
  hakenMatItems: OptionItem[];
  setHakenMatItems: Setter<OptionItem[]>;
  darstellungItems: OptionItem[];
  setDarstellungItems: Setter<OptionItem[]>;
  products: Product[];
  setProducts: Setter<Product[]>;
  categoryVisibility: CategoryVisibility;
  setCategoryVisibility: Setter<CategoryVisibility>;
  fusionEnabled: boolean;
  setFusionEnabled: Setter<boolean>;
  texts: Texts;
  setTexts: Setter<Texts>;
  showroom: Showroom;
  setShowroom: Setter<Showroom>;
  carousel: CarouselConfig;
  setCarousel: Setter<CarouselConfig>;
}

interface ConfigManagerReturn {
  getConfig: () => AppConfig;
  applyConfig: (data: unknown) => ValidationResult;
  exportParams: () => void;
  importParams: () => void;
}

export default function useConfigManager({
  constr, setConstr, dimConfig, setDimConfig,
  holzartenItems, setHolzartenItems,
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
  carousel, setCarousel,
}: ConfigManagerParams): ConfigManagerReturn {
  const getConfig = useCallback((): AppConfig => ({
    version: 3, constr, dimConfig, enabledHolzarten, holzartenItems, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled, texts, showroom, carousel,
  }), [constr, dimConfig, enabledHolzarten, holzartenItems, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder,
    oberflaechenItems, extrasItems, hakenMatItems, darstellungItems, products, categoryVisibility, fusionEnabled, texts, showroom, carousel]);

  const applyConfig = useCallback((data: unknown): ValidationResult => {
    const result = validateConfigShape(data);
    if (!result.ok) return result;
    const d = data as Partial<AppConfig>;
    if (d.constr) setConstr(d.constr);
    if (d.dimConfig) setDimConfig(d.dimConfig);
    if (d.holzartenItems) setHolzartenItems(d.holzartenItems);
    else if (d.enabledHolzarten) setEnabledHolzarten(d.enabledHolzarten);
    if (d.enabledSteps) setEnabledSteps(d.enabledSteps);
    if (d.pricing) setPricing(d.pricing);
    if (d.stepOrder) setStepOrder(d.stepOrder);
    if (d.enabledSchriftarten) setEnabledSchriftarten(d.enabledSchriftarten);
    if (d.enabledBerge) setEnabledBerge(d.enabledBerge);
    if (d.bergDisplay) setBergDisplay(d.bergDisplay);
    if (d.oberflaechenItems) setOberflaechenItems(d.oberflaechenItems);
    if (d.extrasItems) setExtrasItems(d.extrasItems);
    if (d.hakenMatItems) setHakenMatItems(d.hakenMatItems);
    if (d.darstellungItems) setDarstellungItems(d.darstellungItems);
    if (d.products) setProducts(d.products);
    if (d.categoryVisibility) setCategoryVisibility(d.categoryVisibility);
    if (typeof d.fusionEnabled === 'boolean') setFusionEnabled(d.fusionEnabled);
    if (d.texts) setTexts(prev => ({ ...prev, ...d.texts }));
    if (d.showroom) setShowroom(d.showroom);
    if (d.carousel) setCarousel(d.carousel);
    return { ok: true };
  }, [setConstr, setDimConfig, setHolzartenItems, setEnabledHolzarten, setEnabledSteps, setPricing, setStepOrder,
    setEnabledSchriftarten, setEnabledBerge, setBergDisplay,
    setOberflaechenItems, setExtrasItems, setHakenMatItems, setDarstellungItems, setProducts,
    setCategoryVisibility, setFusionEnabled, setTexts, setShowroom, setCarousel]);

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
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed: unknown = JSON.parse(ev.target?.result as string);
          const result = applyConfig(parsed);
          if (!result.ok) alert("Import fehlgeschlagen: " + result.reason);
        } catch {
          alert("Import fehlgeschlagen: Ung\u00FCltige JSON-Datei.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [applyConfig]);

  return { getConfig, applyConfig, exportParams, importParams };
}
