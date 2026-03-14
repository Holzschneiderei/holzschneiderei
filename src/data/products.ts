import type { FormState, Product, ProductGroup } from "../types/config";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "garderobe",
    label: "Garderobe",
    desc: "Schriftzug mit Haken, Hutablage und Extras.",
    icon: "\u{1F6AA}",
    enabled: true,
    comingSoon: false,
    teaser: "",
    steps: ["motiv", "holzart", "masse", "ausfuehrung", "extras", "kontakt", "uebersicht"],
    optionLists: ["holzarten", "oberflaechen", "hakenMaterialien", "extrasOptions"],
    motif: "schriftzug",
    constraints: {
      MIN_W: 30, MAX_W: 80,
      MIN_H: 30, MAX_H: 80,
      MIN_D: 2, MAX_D: 4,
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
    previewImages: [
      "https://static.wixstatic.com/media/01b6e0_9e2a0b063a85489fa54bd7336421df2b~mv2.jpg",
      "https://static.wixstatic.com/media/01b6e0_c624133af7cb4a86900a0c5ebc513a41~mv2.jpg",
      "https://static.wixstatic.com/media/01b6e0_46a1aa0dc27442f0919291ca4064ae56~mv2.jpg",
    ],
    sortOrder: 0,
    group: "schriftzug",
    variantLabel: "Garderobe mit Haken",
    variantDesc: "Schriftzug + Haken, Hutablage und Extras",
    variantIcon: "\u{1F6AA}",
  },
  {
    id: "schriftzug",
    label: "Schriftzug",
    desc: "Freistehender Schriftzug aus Massivholz.",
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
    previewImages: [
      "https://static.wixstatic.com/media/01b6e0_89131604d2b6426ebec22504c9bac468~mv2.jpg",
      "https://static.wixstatic.com/media/01b6e0_0eef0cc2a3e74f36ac63d59ae1bdfb68~mv2.jpg",
      "https://static.wixstatic.com/media/01b6e0_4c925a271ec7480ba5528c2032f253ee~mv2.png",
    ],
    sortOrder: 1,
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
    previewImages: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop",
    ],
    sortOrder: 2,
    group: null,
  },
];

export function getProductGroups(products: Product[]): ProductGroup[] {
  const enabled = products.filter((p) => p.enabled || p.comingSoon).sort((a, b) => a.sortOrder - b.sortOrder);
  const grouped = new Map<string, Product[]>();
  const standalone: Product[] = [];

  for (const p of enabled) {
    if (p.group) {
      if (!grouped.has(p.group)) grouped.set(p.group, []);
      grouped.get(p.group)!.push(p);
    } else {
      standalone.push(p);
    }
  }

  const result: ProductGroup[] = [];
  for (const [, members] of grouped) {
    const primary = members.find((m) => m.groupPrimary) || members[0]!;
    const variants = members.filter((m) => !m.comingSoon);
    if (variants.length > 0) {
      result.push({ type: "group", primary, variants, allProducts: members });
    }
  }
  result.sort((a, b) => {
    const aOrder = a.type === "group" ? a.primary.sortOrder : a.product.sortOrder;
    const bOrder = b.type === "group" ? b.primary.sortOrder : b.product.sortOrder;
    return aOrder - bOrder;
  });
  for (const p of standalone) {
    result.push({ type: "standalone", product: p });
  }
  return result;
}

export function getTypForProduct(product: Product | null | undefined): string {
  if (!product) return "";
  if (product.motif === "schriftzug" || product.id === "schriftzug") return "schriftzug";
  if (product.id === "bergmotiv") return "bergmotiv";
  return "";
}

export function computeFixedPrice(form: FormState, product: Product | null | undefined): number | null {
  if (!product || !product.fixedPrices) return null;
  const key = `${form.breite}-${form.holzart}`;
  return product.fixedPrices[key] ?? null;
}

export function getProductWidths(product: Product | null | undefined): number[] {
  if (!product || !product.fixedPrices) return [];
  const widths = new Set<number>();
  for (const key of Object.keys(product.fixedPrices)) {
    widths.add(parseInt(key.split("-")[0]!, 10));
  }
  return [...widths].sort((a, b) => a - b);
}
