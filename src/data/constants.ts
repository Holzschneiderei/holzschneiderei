import type { BrandTokens, DimField, DimModeOption, FlowOption, FormState, OptionalStep, Texts } from "../types/config";
import {DEFAULT_BERGE, DEFAULT_EXTRAS_OPTIONS,
  DEFAULT_HAKEN_MATERIALIEN, 
  DEFAULT_HOLZARTEN, DEFAULT_OBERFLAECHEN, DEFAULT_SCHRIFTARTEN,
  getAllItems,
} from './optionLists';

export const holzarten = getAllItems(DEFAULT_HOLZARTEN);
export const oberflaechen = getAllItems(DEFAULT_OBERFLAECHEN);
export const hakenMaterialien = getAllItems(DEFAULT_HAKEN_MATERIALIEN);
export const extrasOptions = getAllItems(DEFAULT_EXTRAS_OPTIONS);
export const berge = getAllItems(DEFAULT_BERGE);
export const schriftarten = getAllItems(DEFAULT_SCHRIFTARTEN);

export const OPTIONAL_STEPS: OptionalStep[] = [
  { id: "motiv", label: "Motiv", desc: "Schriftzug oder Bergmotiv konfigurieren", icon: "\u270F\uFE0F", defaultOn: true, required: true, defaults: {}, defaultLabel: "" },
  { id: "holzart", label: "Holzart", desc: "Eiche, Esche, Nussbaum, Ahorn oder Arve", icon: "\u{1FAB5}", defaultOn: true, required: false, defaults: { holzart: "eiche" }, defaultLabel: "Eiche" },
  { id: "masse", label: "Abmessungen", desc: "Breite, H\u00F6he und Tiefe in cm", icon: "\u{1F4D0}", defaultOn: true, required: true, defaults: { breite: "80", hoehe: "180", tiefe: "35" }, defaultLabel: "80 \u00D7 180 \u00D7 35 cm" },
  { id: "ausfuehrung", label: "Ausf\u00FChrung", desc: "Oberfl\u00E4che, Haken & Hutablage", icon: "\u2728", defaultOn: true, required: false, defaults: { oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja" }, defaultLabel: "Natur ge\u00F6lt, 6 Holzhaken" },
  { id: "extras", label: "Extras & W\u00FCnsche", desc: "Spiegel, Schuhablage, Bemerkungen", icon: "\u{1F39B}", defaultOn: false, required: false, defaults: { extras: [], bemerkungen: "" }, defaultLabel: "Keine Extras" },
  { id: "darstellung", label: "Darstellung", desc: "Pr\u00E4sentationsart: Wandmontage oder St\u00E4nder", icon: "\u{1F5BC}", defaultOn: false, required: false, defaults: { darstellung: "wandmontage" }, defaultLabel: "Wandmontage" },
];

export const FIXED_STEP_IDS: string[] = ["kontakt", "uebersicht"];

export const DEFAULT_TEXTS: Texts = {
  produktwahl: {
    heading: "Dein Unikat gestalten",
    subheading: "Massanfertigung aus Schweizer Holz",
    description: "W\u00E4hle dein Produkt \u2013 danach konfigurierst du Holz, Masse und Details.",
  },
};

export const DEFAULT_FORM: FormState = {
  typ: "", product: "", schriftzug: "", schriftart: "", berg: "", darstellung: "",
  holzart: "eiche", breite: "80", hoehe: "180", tiefe: "35",
  oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja",
  extras: [], bemerkungen: "",
  anrede: "", vorname: "", nachname: "", email: "", telefon: "", strasse: "", plz: "", ort: "",
  datenschutz: false,
};

export const FLOWS: FlowOption[] = [
  { id: "ltr", label: "\u2192", title: "Links \u2192 Rechts" },
  { id: "ttb", label: "\u2193", title: "Oben \u2192 Unten" },
  { id: "btt", label: "\u2191", title: "Unten \u2192 Oben" },
];

export const DIM_FIELDS: DimField[] = [
  { key: "breite", label: "Breite", unit: "cm", constrMin: "MIN_W", constrMax: "MAX_W" },
  { key: "hoehe", label: "H\u00F6he", unit: "cm", constrMin: "MIN_H", constrMax: "MAX_H" },
  { key: "tiefe", label: "Tiefe", unit: "cm", constrMin: "MIN_D", constrMax: "MAX_D" },
];

export const DIM_MODES: DimModeOption[] = [
  { value: "text", label: "Freitext" },
  { value: "combo", label: "Combobox" },
  { value: "pills", label: "Pills" },
];

/** Brand colour tokens for SVG fill/stroke interpolation. */
export const t: BrandTokens = {
  text: "#1f2a23", muted: "#5b615b", brand: "#1f3b31",
  border: "#c8c5bb", error: "#a03030", fieldBg: "#faf9f6", white: "#ffffff",
};
