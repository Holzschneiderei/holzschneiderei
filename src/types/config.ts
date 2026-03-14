/* ── Value types (string unions) ── */

export type HolzartValue = "eiche" | "buche" | "esche" | "nussbaum" | "ahorn" | "arve";
export type SchriftartValue = "sans" | "serif" | "slab" | "condensed" | "rounded" | "script";
export type BergValue = "matterhorn" | "eiger" | "jungfrau" | "pilatus" | "saentis" | "titlis" | "rigi";
export type OberflaeceValue = "natur-geoelt" | "ungeoelt" | "weiss-geoelt" | "gewachst" | "lackiert" | "unbehandelt";
export type DarstellungValue = "wandmontage" | "staender-gekippt" | "staender-aufrecht";
export type HakenMatValue = "holz" | "edelstahl" | "messing" | "schwarz-metall";
export type DriftDirection = "left" | "right" | "up" | "down";
export type AspectRatio = "3:2" | "4:3" | "16:9";
export type DimModeValue = "pills" | "combo" | "text";
export type ShowroomLayout = "grid" | "hero" | "carousel";
export type ClickBehavior = "summary" | "wizard" | "detail";

/* ── Data structures ── */

export interface Constraints {
  MIN_W: number;
  MAX_W: number;
  MIN_H: number;
  MAX_H: number;
  MIN_D: number;
  MAX_D: number;
  HOOK_SPACING: number;
  EDGE_MARGIN: number;
  LETTER_W: number;
  LETTER_MARGIN: number;
}

export interface Pricing {
  woodCosts: Record<string, number>;
  labourRate: number;
  hoursBase: number;
  hoursPerM2: number;
  extrasCosts: Record<string, number>;
  margin: number;
}

export interface DimFieldConfig {
  enabled: boolean;
  mode: DimModeValue;
  presets: number[];
}

export type DimConfig = Record<string, DimFieldConfig>;

export interface Limits {
  minW: number;
  maxW: number;
  minWText: number;
  textTooLong: boolean;
  maxLetters: number;
  letters: number;
  maxHooks: number;
  maxHooksMax: number;
  maxHooksMin: number;
  hookOptions: number[];
  clampedW: number;
}

export interface PriceBreakdown {
  surfaceM2: number;
  materialCost: number;
  labourCost: number;
  extrasCost: number;
  estimatedHours: number;
  productionCost: number;
  customerPrice: number;
  isFixed: boolean;
}

export interface FormState {
  typ: string;
  product: string;
  schriftzug: string;
  schriftart: string;
  berg: string;
  darstellung: string;
  holzart: string;
  breite: string;
  hoehe: string;
  tiefe: string;
  oberflaeche: string;
  haken: string;
  hakenmaterial: string;
  hutablage: string;
  extras: string[];
  bemerkungen: string;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
  datenschutz: boolean;
}

export interface OptionalStep {
  id: string;
  label: string;
  desc: string;
  icon: string;
  defaultOn: boolean;
  defaults: Partial<FormState>;
  defaultLabel: string;
}

/* ── Option list item (used by useOptionList / admin) ── */

export interface OptionItem {
  value: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
  meta: Record<string, unknown>;
}

/* ── Flat item (legacy format derived from OptionItem via toFlatItem) ── */

export interface FlatItem {
  value: string;
  label: string;
  [key: string]: unknown;
}

/* ── Product ── */

export interface Product {
  id: string;
  label: string;
  desc: string;
  icon: string;
  enabled: boolean;
  comingSoon: boolean;
  teaser: string;
  steps: string[];
  optionLists: string[];
  motif: string | null;
  constraints: Partial<Constraints>;
  fixedPrices: Record<string, number>;
  previewImages: (string | CarouselImage)[];
  showIcon?: boolean;
  iconSize?: number;
  showDesc?: boolean;
  sortOrder: number;
  group: string | null;
  groupPrimary?: boolean;
  groupLabel?: string;
  groupDesc?: string;
  groupIcon?: string;
  variantLabel?: string;
  variantDesc?: string;
  variantIcon?: string;
}

/* ── Product group (returned by getProductGroups) ── */

export type ProductGroup =
  | { type: "group"; primary: Product; variants: Product[]; allProducts: Product[] }
  | { type: "standalone"; product: Product };

/* ── Berg display ── */

export interface BergDisplay {
  mode: string;
  showName: boolean;
  showHeight: boolean;
  showRegion: boolean;
  labelFont: string;
}

/* ── Texts (per-section, values are strings or visibility booleans) ── */

export type TextSectionValues = Record<string, string | boolean>;
export type Texts = Record<string, TextSectionValues>;

/* ── Showroom ── */

export interface Preset {
  id: string;
  title: string;
  desc: string;
  images: (string | CarouselImage)[];
  productId: string;
  formSnapshot: Partial<FormState>;
  clickBehavior: ClickBehavior;
  isBlank: boolean;
  sortOrder: number;
  enabled: boolean;
  showPrice: boolean | null;
  showSpecs: boolean | null;
  showTitle: boolean;
  showDesc: boolean;
  ctaText: string;
}

export interface Showroom {
  layout: ShowroomLayout;
  columns: number;
  showPrice: boolean;
  showSpecs: boolean;
  presets: Preset[];
}

/* ── Toggle set (e.g. { eiche: true, buche: false }) ── */

export type ToggleMap = Record<string, boolean>;

/* ── Category visibility ── */

export interface CategoryVisibility {
  holzarten: boolean;
  oberflaechen: boolean;
  extras: boolean;
  hakenMaterialien: boolean;
  darstellungen: boolean;
  hutablage?: boolean;
}

/* ── Per-product step configuration ── */

export interface ProductStepConfig {
  enabledSteps: Record<string, boolean>;
  stepOrder: string[];
  stepDefaults: Record<string, Partial<FormState>>;
}

/* ── Full config blob (version 4) — what getConfig() returns ── */

export interface AppConfig {
  version: number;
  constr: Constraints;
  dimConfig: DimConfig;
  enabledHolzarten: ToggleMap;
  holzartenItems?: OptionItem[];
  enabledSchriftarten: ToggleMap;
  schriftartenItems?: OptionItem[];
  enabledBerge: ToggleMap;
  bergeItems?: OptionItem[];
  bergDisplay: BergDisplay;
  pricing: Pricing;
  oberflaechenItems: OptionItem[];
  extrasItems: OptionItem[];
  hakenMatItems: OptionItem[];
  darstellungItems: OptionItem[];
  products: Product[];
  categoryVisibility: CategoryVisibility;
  fusionEnabled: boolean;
  texts: Texts;
  showroom: Showroom;
  carousel: CarouselConfig;
  productStepConfig: Record<string, ProductStepConfig>;
  /** @deprecated v3 compat — use productStepConfig instead */
  enabledSteps?: Record<string, boolean>;
  /** @deprecated v3 compat — use productStepConfig instead */
  stepOrder?: string[];
  /** @deprecated v3 compat — use productStepConfig instead */
  stepDefaults?: Record<string, Partial<FormState>>;
}

/* ── Validation result ── */

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/* ── Misc constants types ── */

export interface FlowOption {
  id: string;
  label: string;
  title: string;
}

export type DimKey = "breite" | "hoehe" | "tiefe";

export interface DimField {
  key: DimKey;
  label: string;
  unit: string;
  constrMin: keyof Constraints;
  constrMax: keyof Constraints;
}

export interface DimModeOption {
  value: DimModeValue;
  label: string;
}

export interface BrandTokens {
  text: string;
  muted: string;
  brand: string;
  border: string;
  error: string;
  fieldBg: string;
  white: string;
}

export interface CarouselImage {
  src: string;
  drift?: DriftDirection;
}

export interface CarouselConfig {
  interval: number;
  driftDuration: number;
  fadeDuration: number;
  zoom: number;
  aspectRatio: AspectRatio;
}
