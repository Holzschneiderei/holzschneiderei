import type { FormState, Preset, Product, Showroom } from "../types/config";

let _counter = 0;

export const DEFAULT_SHOWROOM: Showroom = {
  layout: "grid",
  columns: 3,
  showPrice: true,
  showSpecs: true,
  presets: [],
};

export function createPreset(overrides: Partial<Preset> = {}): Preset {
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

export function hydrateForm(defaultForm: FormState, preset: Preset): FormState {
  return {
    ...defaultForm,
    ...preset.formSnapshot,
    product: preset.productId,
  };
}

export function deriveSpecs(formSnapshot: Partial<FormState>, products: Product[]): string[] {
  const specs: string[] = [];

  if (formSnapshot.holzart) {
    specs.push(formSnapshot.holzart.charAt(0).toUpperCase() + formSnapshot.holzart.slice(1));
  }

  if (formSnapshot.breite) {
    specs.push(`${formSnapshot.breite} cm`);
  }

  if (formSnapshot.haken) {
    const product = products.find((p) => p.id === formSnapshot.product);
    if (product?.steps?.includes("ausfuehrung")) {
      specs.push(`${formSnapshot.haken} Haken`);
    }
  }

  if (formSnapshot.schriftzug) {
    specs.push(`\u201E${formSnapshot.schriftzug}\u201C`);
  }

  return specs;
}
