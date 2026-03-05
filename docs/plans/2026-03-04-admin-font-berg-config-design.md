# Admin Font & Mountain Configuration Design

## Goal

Add admin controls to enable/disable fonts and mountains, configure mountain card display (relief vs clean, label visibility, label font).

## File

`app/garderobe-wizard (3).jsx` — all changes in this single file.

## New State

### Enable/Disable (follows existing `enabledHolzarten` / `toggleHolz` pattern)

```js
const [enabledSchriftarten, setEnabledSchriftarten] = useState(
  schriftarten.reduce((acc, f) => ({ ...acc, [f.value]: true }), {})
);
const activeSchriftarten = useMemo(
  () => schriftarten.filter(f => enabledSchriftarten[f.value]), [enabledSchriftarten]
);
const toggleSchriftart = (val) => {
  setEnabledSchriftarten(p => {
    const next = { ...p, [val]: !p[val] };
    if (Object.values(next).filter(Boolean).length === 0) return p;
    if (!next[form.schriftart]) {
      const first = schriftarten.find(f => next[f.value]);
      if (first) setForm(f => ({ ...f, schriftart: first.value }));
    }
    return next;
  });
};

const [enabledBerge, setEnabledBerge] = useState(
  berge.reduce((acc, b) => ({ ...acc, [b.value]: true }), {})
);
const activeBerge = useMemo(
  () => berge.filter(b => enabledBerge[b.value]), [enabledBerge]
);
const toggleBerg = (val) => {
  setEnabledBerge(p => {
    const next = { ...p, [val]: !p[val] };
    if (Object.values(next).filter(Boolean).length === 0) return p;
    if (!next[form.berg]) {
      const first = berge.find(b => next[b.value]);
      if (first) setForm(f => ({ ...f, berg: first.value }));
    }
    return next;
  });
};
```

### Mountain Display Config

```js
const [bergDisplay, setBergDisplay] = useState({
  mode: "relief",       // "relief" | "clean"
  showName: true,
  showHeight: true,
  showRegion: true,
  labelFont: ""         // schriftarten value or "" for system default
});
const setBergDisp = (key, val) => setBergDisplay(p => ({ ...p, [key]: val }));
```

## Admin UI

### AdminTypeDefaults — enable/disable toggles

Each font row in the schriftzug card gets an eye icon button. Disabled fonts are dimmed (opacity 0.35). Admin can still select a disabled font as default — the toggle only affects customer visibility.

Each mountain card in the bergmotiv card gets an eye icon button. Same dimming behavior.

Props: pass `enabledSchriftarten`, `toggleSchriftart`, `enabledBerge`, `toggleBerg`.

### New Section: AdminBergDisplay

New `<CollapsibleSection>` after "Produkt-Typ Vorgaben":
- **Relief/Clean toggle**: two-button toggle (like typ selector)
- **Live preview**: side-by-side SVG showing a sample mountain in both modes
- **Label visibility**: three checkboxes — "Name anzeigen", "Höhe anzeigen", "Region anzeigen"
- **Label font**: dropdown from schriftarten list + "System (Standard)" option

Props: `bergDisplay`, `setBergDisp`.

## Customer UI Changes

### Font picker (typen phase, ~line 484)
Replace `schriftarten` with `activeSchriftarten`.

### Berg grid (typen phase, ~line 566)
- Replace `berge` with `activeBerge`
- SVG path fill: `bergDisplay.mode === "clean"` → `fill="none"`, else current filled behavior
- Conditionally render label/height/region based on `bergDisplay.showName/showHeight/showRegion`
- Apply `bergDisplay.labelFont` font family to name span (if set)

### Admin berg grid (AdminTypeDefaults)
Same display changes so admin sees the actual customer rendering.

## Import/Export

Add `enabledSchriftarten`, `enabledBerge`, `bergDisplay` to the export/import JSON in `AdminImportExport`.
