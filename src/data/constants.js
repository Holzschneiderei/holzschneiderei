/**
 * @typedef {"eiche" | "esche" | "nussbaum" | "ahorn" | "arve"} HolzartValue
 * @typedef {{ value: HolzartValue, label: string, desc: string, emoji: string }} Holzart
 */

/** @type {Holzart[]} */
export const holzarten = [
  { value: "eiche", label: "Eiche", desc: "Robust & zeitlos", emoji: "\u{1FAB5}" },
  { value: "esche", label: "Esche", desc: "Hell & elegant", emoji: "\u{1F33F}" },
  { value: "nussbaum", label: "Nussbaum", desc: "Warm & edel", emoji: "\u{1F330}" },
  { value: "ahorn", label: "Ahorn", desc: "Fein & hell", emoji: "\u{1F341}" },
  { value: "arve", label: "Arve / Zirbe", desc: "Duftend & alpin", emoji: "\u{1F332}" },
];

/**
 * @typedef {{ value: string, label: string }} Oberflaeche
 */

/** @type {Oberflaeche[]} */
export const oberflaechen = [
  { value: "natur-geoelt", label: "Natur geölt" },
  { value: "weiss-geoelt", label: "Weiss geölt" },
  { value: "gewachst", label: "Gewachst" },
  { value: "lackiert", label: "Lackiert (matt)" },
  { value: "unbehandelt", label: "Unbehandelt" },
];

/**
 * @typedef {{ value: string, label: string }} HakenMaterial
 */

/** @type {HakenMaterial[]} */
export const hakenMaterialien = [
  { value: "holz", label: "Holz (passend)" },
  { value: "edelstahl", label: "Edelstahl" },
  { value: "messing", label: "Messing" },
  { value: "schwarz-metall", label: "Schwarz Metall" },
];

/**
 * @typedef {{ value: string, label: string, icon: string }} ExtraOption
 */

/** @type {ExtraOption[]} */
export const extrasOptions = [
  { value: "spiegel", label: "Spiegel", icon: "\u{1FA9E}" },
  { value: "schuhablage", label: "Schuhablage", icon: "\u{1F45F}" },
  { value: "schublade", label: "Schublade", icon: "\u{1F5C4}" },
  { value: "schluesselleiste", label: "Schlüsselleiste", icon: "\u{1F511}" },
  { value: "sitzbank", label: "Sitzbank", icon: "\u{1FA91}" },
];

/**
 * @typedef {"matterhorn" | "eiger" | "jungfrau" | "pilatus" | "saentis" | "titlis" | "rigi"} BergValue
 * @typedef {{ value: BergValue, label: string, hoehe: string, region: string, path: string }} Berg
 */

/** @type {Berg[]} */
export const berge = [
  { value: "matterhorn", label: "Matterhorn", hoehe: "4'478 m", region: "Wallis", path: "M 0,70 L 18,72 28,55 38,28 42,15 46,10 50,8 52,10 55,18 58,28 62,38 70,50 78,58 88,65 100,70" },
  { value: "eiger", label: "Eiger", hoehe: "3'967 m", region: "Berner Oberland", path: "M 0,70 L 15,68 25,52 30,40 36,30 42,20 50,14 55,12 60,16 65,22 72,35 78,48 85,58 100,70" },
  { value: "jungfrau", label: "Jungfrau", hoehe: "4'158 m", region: "Berner Oberland", path: "M 0,70 L 12,65 22,50 30,38 38,25 44,16 50,11 56,14 60,20 66,30 74,42 82,55 92,64 100,70" },
  { value: "pilatus", label: "Pilatus", hoehe: "2'128 m", region: "Zentralschweiz", path: "M 0,70 L 10,66 20,55 28,42 35,32 40,25 48,18 55,15 62,18 68,28 72,22 78,16 82,20 88,35 94,52 100,70" },
  { value: "saentis", label: "Säntis", hoehe: "2'502 m", region: "Appenzell", path: "M 0,70 L 14,65 24,50 32,38 40,28 46,20 52,14 56,12 60,15 66,24 72,34 80,48 90,60 100,70" },
  { value: "titlis", label: "Titlis", hoehe: "3'238 m", region: "Obwalden", path: "M 0,70 L 12,66 20,55 26,44 34,34 40,24 46,18 52,13 58,12 64,15 70,24 76,36 84,50 92,62 100,70" },
  { value: "rigi", label: "Rigi", hoehe: "1'797 m", region: "Zentralschweiz", path: "M 0,70 L 10,62 20,50 30,40 40,32 48,26 56,22 62,20 68,22 74,28 80,38 88,50 94,60 100,70" },
];

/**
 * @typedef {"sans" | "serif" | "slab" | "condensed" | "rounded" | "script"} SchriftartValue
 * @typedef {{ value: SchriftartValue, label: string, desc: string, family: string, weight: number, sample: string }} Schriftart
 */

/** @type {Schriftart[]} */
export const schriftarten = [
  { value: "sans", label: "Modern", desc: "Klar & zeitlos", family: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', weight: 800, sample: "Ag" },
  { value: "serif", label: "Klassisch", desc: "Elegant & traditionell", family: 'Georgia, "Times New Roman", Times, serif', weight: 700, sample: "Ag" },
  { value: "slab", label: "Slab", desc: "Kräftig & industrial", family: '"Courier New", Courier, monospace', weight: 700, sample: "Ag" },
  { value: "condensed", label: "Schmal", desc: "Kompakt & markant", family: 'Impact, "Arial Narrow", sans-serif', weight: 400, sample: "Ag" },
  { value: "rounded", label: "Rund", desc: "Weich & freundlich", family: 'Verdana, "Trebuchet MS", sans-serif', weight: 700, sample: "Ag" },
  { value: "script", label: "Handschrift", desc: "Persönlich & warm", family: '"Brush Script MT", "Segoe Script", cursive', weight: 400, sample: "Ag" },
];

/**
 * @typedef {{ id: string, label: string, desc: string, icon: string, defaultOn: boolean, required: boolean, defaults: Partial<FormState>, defaultLabel: string }} OptionalStep
 */

/** @type {OptionalStep[]} */
export const OPTIONAL_STEPS = [
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
