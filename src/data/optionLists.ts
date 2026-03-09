import type { FlatItem, OptionItem } from "../types/config";

export const DEFAULT_HOLZARTEN: OptionItem[] = [
  { value: "eiche", label: "Eiche", enabled: true, sortOrder: 0, meta: { desc: "Robust & zeitlos", emoji: "\u{1FAB5}" } },
  { value: "buche", label: "Buche", enabled: true, sortOrder: 1, meta: { desc: "Hart & vielseitig", emoji: "\u{1F333}" } },
  { value: "esche", label: "Esche", enabled: false, sortOrder: 2, meta: { desc: "Hell & elegant", emoji: "\u{1F33F}" } },
  { value: "nussbaum", label: "Nussbaum", enabled: false, sortOrder: 3, meta: { desc: "Warm & edel", emoji: "\u{1F330}" } },
  { value: "ahorn", label: "Ahorn", enabled: false, sortOrder: 4, meta: { desc: "Fein & hell", emoji: "\u{1F341}" } },
  { value: "arve", label: "Arve / Zirbe", enabled: false, sortOrder: 5, meta: { desc: "Duftend & alpin", emoji: "\u{1F332}" } },
];

export const DEFAULT_OBERFLAECHEN: OptionItem[] = [
  { value: "natur-geoelt", label: "Natur ge\u00F6lt", enabled: true, sortOrder: 0, meta: {} },
  { value: "ungeoelt", label: "Unge\u00F6lt", enabled: true, sortOrder: 1, meta: {} },
  { value: "weiss-geoelt", label: "Weiss ge\u00F6lt", enabled: false, sortOrder: 2, meta: {} },
  { value: "gewachst", label: "Gewachst", enabled: false, sortOrder: 3, meta: {} },
  { value: "lackiert", label: "Lackiert (matt)", enabled: false, sortOrder: 4, meta: {} },
  { value: "unbehandelt", label: "Unbehandelt", enabled: false, sortOrder: 5, meta: {} },
];

export const DEFAULT_EXTRAS_OPTIONS: OptionItem[] = [
  { value: "spiegel", label: "Spiegel", enabled: true, sortOrder: 0, meta: { icon: "\u{1FA9E}" } },
  { value: "schuhablage", label: "Schuhablage", enabled: true, sortOrder: 1, meta: { icon: "\u{1F45F}" } },
  { value: "schublade", label: "Schublade", enabled: true, sortOrder: 2, meta: { icon: "\u{1F5C4}" } },
  { value: "schluesselleiste", label: "Schl\u00FCsselleiste", enabled: true, sortOrder: 3, meta: { icon: "\u{1F511}" } },
  { value: "sitzbank", label: "Sitzbank", enabled: true, sortOrder: 4, meta: { icon: "\u{1FA91}" } },
];

export const DEFAULT_HAKEN_MATERIALIEN: OptionItem[] = [
  { value: "holz", label: "Holz (passend)", enabled: true, sortOrder: 0, meta: {} },
  { value: "edelstahl", label: "Edelstahl", enabled: true, sortOrder: 1, meta: {} },
  { value: "messing", label: "Messing", enabled: true, sortOrder: 2, meta: {} },
  { value: "schwarz-metall", label: "Schwarz Metall", enabled: true, sortOrder: 3, meta: {} },
];

export const DEFAULT_BERGE: OptionItem[] = [
  { value: "matterhorn", label: "Matterhorn", enabled: true, sortOrder: 0, meta: { hoehe: "4'478 m", region: "Wallis", path: "M 0,70 L 18,72 28,55 38,28 42,15 46,10 50,8 52,10 55,18 58,28 62,38 70,50 78,58 88,65 100,70" } },
  { value: "eiger", label: "Eiger", enabled: true, sortOrder: 1, meta: { hoehe: "3'967 m", region: "Berner Oberland", path: "M 0,70 L 15,68 25,52 30,40 36,30 42,20 50,14 55,12 60,16 65,22 72,35 78,48 85,58 100,70" } },
  { value: "jungfrau", label: "Jungfrau", enabled: true, sortOrder: 2, meta: { hoehe: "4'158 m", region: "Berner Oberland", path: "M 0,70 L 12,65 22,50 30,38 38,25 44,16 50,11 56,14 60,20 66,30 74,42 82,55 92,64 100,70" } },
  { value: "pilatus", label: "Pilatus", enabled: true, sortOrder: 3, meta: { hoehe: "2'128 m", region: "Zentralschweiz", path: "M 0,70 L 10,66 20,55 28,42 35,32 40,25 48,18 55,15 62,18 68,28 72,22 78,16 82,20 88,35 94,52 100,70" } },
  { value: "saentis", label: "S\u00E4ntis", enabled: true, sortOrder: 4, meta: { hoehe: "2'502 m", region: "Appenzell", path: "M 0,70 L 14,65 24,50 32,38 40,28 46,20 52,14 56,12 60,15 66,24 72,34 80,48 90,60 100,70" } },
  { value: "titlis", label: "Titlis", enabled: true, sortOrder: 5, meta: { hoehe: "3'238 m", region: "Obwalden", path: "M 0,70 L 12,66 20,55 26,44 34,34 40,24 46,18 52,13 58,12 64,15 70,24 76,36 84,50 92,62 100,70" } },
  { value: "rigi", label: "Rigi", enabled: true, sortOrder: 6, meta: { hoehe: "1'797 m", region: "Zentralschweiz", path: "M 0,70 L 10,62 20,50 30,40 40,32 48,26 56,22 62,20 68,22 74,28 80,38 88,50 94,60 100,70" } },
];

export const DEFAULT_SCHRIFTARTEN: OptionItem[] = [
  { value: "sans", label: "Modern", enabled: true, sortOrder: 0, meta: { desc: "Klar & zeitlos", family: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', weight: 800, sample: "Ag" } },
  { value: "serif", label: "Klassisch", enabled: true, sortOrder: 1, meta: { desc: "Elegant & traditionell", family: 'Georgia, "Times New Roman", Times, serif', weight: 700, sample: "Ag" } },
  { value: "slab", label: "Slab", enabled: true, sortOrder: 2, meta: { desc: "Kr\u00E4ftig & industrial", family: '"Courier New", Courier, monospace', weight: 700, sample: "Ag" } },
  { value: "condensed", label: "Schmal", enabled: true, sortOrder: 3, meta: { desc: "Kompakt & markant", family: 'Impact, "Arial Narrow", sans-serif', weight: 400, sample: "Ag" } },
  { value: "rounded", label: "Rund", enabled: true, sortOrder: 4, meta: { desc: "Weich & freundlich", family: 'Verdana, "Trebuchet MS", sans-serif', weight: 700, sample: "Ag" } },
  { value: "script", label: "Handschrift", enabled: true, sortOrder: 5, meta: { desc: "Pers\u00F6nlich & warm", family: '"Brush Script MT", "Segoe Script", cursive', weight: 400, sample: "Ag" } },
];

export const DEFAULT_DARSTELLUNGEN: OptionItem[] = [
  { value: "wandmontage", label: "Wandmontage", enabled: true, sortOrder: 0, meta: {} },
  { value: "staender-gekippt", label: "St\u00E4nder gekippt", enabled: true, sortOrder: 1, meta: {} },
  { value: "staender-aufrecht", label: "St\u00E4nder aufrecht", enabled: true, sortOrder: 2, meta: {} },
];

export function toFlatItem(item: OptionItem): FlatItem {
  return { value: item.value, label: item.label, ...item.meta };
}

export function getActiveItems(list: OptionItem[]): FlatItem[] {
  return list
    .filter((item) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toFlatItem);
}

export function getAllItems(list: OptionItem[]): FlatItem[] {
  return [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toFlatItem);
}
