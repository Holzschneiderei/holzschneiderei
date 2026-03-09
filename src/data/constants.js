/**
 * Flat option arrays derived from the canonical option lists.
 * Single source of truth: optionLists.js defines the data, these are convenience re-exports.
 */
import {
  DEFAULT_HOLZARTEN, DEFAULT_OBERFLAECHEN, DEFAULT_EXTRAS_OPTIONS,
  DEFAULT_HAKEN_MATERIALIEN, DEFAULT_BERGE, DEFAULT_SCHRIFTARTEN,
  getAllItems,
} from './optionLists.js';

export const holzarten = getAllItems(DEFAULT_HOLZARTEN);
export const oberflaechen = getAllItems(DEFAULT_OBERFLAECHEN);
export const hakenMaterialien = getAllItems(DEFAULT_HAKEN_MATERIALIEN);
export const extrasOptions = getAllItems(DEFAULT_EXTRAS_OPTIONS);
export const berge = getAllItems(DEFAULT_BERGE);
export const schriftarten = getAllItems(DEFAULT_SCHRIFTARTEN);

/**
 * @typedef {{ id: string, label: string, desc: string, icon: string, defaultOn: boolean, required: boolean, defaults: Partial<FormState>, defaultLabel: string }} OptionalStep
 */

/** @type {OptionalStep[]} */
export const OPTIONAL_STEPS = [
  { id: "motiv", label: "Motiv", desc: "Schriftzug oder Bergmotiv konfigurieren", icon: "✏️", defaultOn: true, required: true, defaults: {}, defaultLabel: "" },
  { id: "holzart", label: "Holzart", desc: "Eiche, Esche, Nussbaum, Ahorn oder Arve", icon: "\u{1FAB5}", defaultOn: true, required: false, defaults: { holzart: "eiche" }, defaultLabel: "Eiche" },
  { id: "masse", label: "Abmessungen", desc: "Breite, Höhe und Tiefe in cm", icon: "\u{1F4D0}", defaultOn: true, required: true, defaults: { breite: "80", hoehe: "180", tiefe: "35" }, defaultLabel: "80 \u00D7 180 \u00D7 35 cm" },
  { id: "ausfuehrung", label: "Ausführung", desc: "Oberfläche, Haken & Hutablage", icon: "\u2728", defaultOn: true, required: false, defaults: { oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja" }, defaultLabel: "Natur geölt, 6 Holzhaken" },
  { id: "extras", label: "Extras & Wünsche", desc: "Spiegel, Schuhablage, Bemerkungen", icon: "\u{1F39B}", defaultOn: false, required: false, defaults: { extras: [], bemerkungen: "" }, defaultLabel: "Keine Extras" },
  { id: "darstellung", label: "Darstellung", desc: "Pr\u00E4sentationsart: Wandmontage oder St\u00E4nder", icon: "\u{1F5BC}", defaultOn: false, required: false, defaults: { darstellung: "wandmontage" }, defaultLabel: "Wandmontage" },
];

/** @type {string[]} Fixed step IDs always shown at the end of the wizard */
export const FIXED_STEP_IDS = ["kontakt", "uebersicht"];

/**
 * @typedef {Object} FormState
 * @property {string}   typ          - "schriftzug" | "bergmotiv"
 * @property {string}   schriftzug   - Custom text for engraving
 * @property {SchriftartValue} schriftart - Selected font
 * @property {BergValue} berg        - Selected mountain
 * @property {HolzartValue} holzart  - Selected wood type
 * @property {string}   breite       - Width in cm (string for input binding)
 * @property {string}   hoehe        - Height in cm
 * @property {string}   tiefe        - Depth in cm
 * @property {string}   oberflaeche  - Surface finish
 * @property {string}   haken        - Number of hooks (string)
 * @property {string}   hakenmaterial - Hook material
 * @property {string}   hutablage    - "ja" | "nein"
 * @property {string[]} extras       - Selected extra option values
 * @property {string}   bemerkungen  - Free-text remarks
 * @property {string}   anrede       - Salutation
 * @property {string}   vorname      - First name
 * @property {string}   nachname     - Last name
 * @property {string}   email        - Email address
 * @property {string}   telefon      - Phone number
 * @property {string}   strasse      - Street address
 * @property {string}   plz          - Postal code
 * @property {string}   ort          - City
 * @property {boolean}  datenschutz  - Privacy policy accepted
 */

/** Default customer-facing texts, configurable per step via admin */
export const DEFAULT_TEXTS = {
  produktwahl: {
    heading: "Dein Unikat gestalten",
    subheading: "Massanfertigung aus Schweizer Holz",
    description: "W\u00E4hle dein Produkt \u2013 danach konfigurierst du Holz, Masse und Details.",
  },
};

/** @type {FormState} */
export const DEFAULT_FORM = {
  typ: "", product: "", schriftzug: "", schriftart: "", berg: "", darstellung: "",
  holzart: "eiche", breite: "80", hoehe: "180", tiefe: "35",
  oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja",
  extras: [], bemerkungen: "",
  anrede: "", vorname: "", nachname: "", email: "", telefon: "", strasse: "", plz: "", ort: "",
  datenschutz: false,
};

/**
 * @typedef {{ id: string, label: string, title: string }} FlowOption
 */

/** @type {FlowOption[]} */
export const FLOWS = [
  { id: "ltr", label: "\u2192", title: "Links \u2192 Rechts" },
  { id: "ttb", label: "\u2193", title: "Oben \u2192 Unten" },
  { id: "btt", label: "\u2191", title: "Unten \u2192 Oben" },
];

/**
 * @typedef {{ key: string, label: string, unit: string, constrMin: string, constrMax: string }} DimField
 */

/** @type {DimField[]} */
export const DIM_FIELDS = [
  { key: "breite", label: "Breite", unit: "cm", constrMin: "MIN_W", constrMax: "MAX_W" },
  { key: "hoehe", label: "Höhe", unit: "cm", constrMin: "MIN_H", constrMax: "MAX_H" },
  { key: "tiefe", label: "Tiefe", unit: "cm", constrMin: "MIN_D", constrMax: "MAX_D" },
];

/**
 * @typedef {"text" | "combo" | "pills"} DimModeValue
 * @typedef {{ value: DimModeValue, label: string }} DimMode
 */

/** @type {DimMode[]} */
export const DIM_MODES = [
  { value: "text", label: "Freitext" },
  { value: "combo", label: "Combobox" },
  { value: "pills", label: "Pills" },
];

/**
 * Brand colour tokens for SVG fill/stroke interpolation.
 * UI components use Tailwind utilities (`text-brand`, `bg-field`, etc.) instead.
 * @type {{ text: string, muted: string, brand: string, border: string, error: string, fieldBg: string, white: string }}
 */
export const t = {
  text: "#1f2a23", muted: "#5b615b", brand: "#1f3b31",
  border: "#c8c5bb", error: "#a03030", fieldBg: "#faf9f6", white: "#ffffff",
};
