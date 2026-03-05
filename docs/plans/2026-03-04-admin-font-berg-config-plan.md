# Admin Font & Mountain Configuration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add admin controls to enable/disable fonts and mountains, plus mountain display config (relief/clean mode, label visibility, label font).

**Architecture:** Three new state variables (`enabledSchriftarten`, `enabledBerge`, `bergDisplay`) following the existing `enabledHolzarten` pattern. New `AdminBergDisplay` component in a new collapsible section. Customer-facing font picker and berg grid filter by enabled items and respect display config.

**Tech Stack:** React (useState/useMemo), inline styles using existing `S.*` and `t.*` tokens.

---

### Task 1: Add enabledSchriftarten state + toggle + memo

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:171-185` (after enabledHolzarten block)

**Step 1: Add state, memo, and toggle function**

Insert after line 185 (end of `toggleHolz`):

```jsx
const [enabledSchriftarten, setEnabledSchriftarten] = useState(
  schriftarten.reduce((acc, f) => ({ ...acc, [f.value]: true }), {})
);
const activeSchriftarten = useMemo(() => schriftarten.filter((f) => enabledSchriftarten[f.value]), [enabledSchriftarten]);
const toggleSchriftart = (val) => {
  setEnabledSchriftarten((p) => {
    const next = { ...p, [val]: !p[val] };
    if (Object.values(next).filter(Boolean).length === 0) return p;
    if (!next[form.schriftart]) {
      const first = schriftarten.find((f) => next[f.value]);
      if (first) setForm((f) => ({ ...f, schriftart: first.value }));
    }
    return next;
  });
};
```

**Step 2: Verify no syntax errors**

Open `http://localhost:3000/test-wizard?mode=admin` — page should load without errors.

---

### Task 2: Add enabledBerge state + toggle + memo

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` (directly after Task 1's insertion)

**Step 1: Add state, memo, and toggle function**

Insert after the `toggleSchriftart` block:

```jsx
const [enabledBerge, setEnabledBerge] = useState(
  berge.reduce((acc, b) => ({ ...acc, [b.value]: true }), {})
);
const activeBerge = useMemo(() => berge.filter((b) => enabledBerge[b.value]), [enabledBerge]);
const toggleBerg = (val) => {
  setEnabledBerge((p) => {
    const next = { ...p, [val]: !p[val] };
    if (Object.values(next).filter(Boolean).length === 0) return p;
    if (!next[form.berg]) {
      const first = berge.find((b) => next[b.value]);
      if (first) setForm((f) => ({ ...f, berg: first.value }));
    }
    return next;
  });
};
```

**Step 2: Verify no syntax errors**

Page loads without errors.

---

### Task 3: Add bergDisplay state + setter

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` (directly after Task 2's insertion)

**Step 1: Add state and setter**

Insert after the `toggleBerg` block:

```jsx
const [bergDisplay, setBergDisplay] = useState({ mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" });
const setBergDisp = (key, val) => setBergDisplay((p) => ({ ...p, [key]: val }));
```

**Step 2: Verify no syntax errors**

Page loads without errors.

---

### Task 4: Add bergDisplay to adminSections + new section key

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:158-161` (adminSections useState)

**Step 1: Add `bergDisplay` key to adminSections**

Change:
```jsx
const [adminSections, setAdminSections] = useState({
  typeDefaults: true, constraints: false, wood: false, dimensions: false,
  steps: false, pricing: false, importExport: false,
});
```

To:
```jsx
const [adminSections, setAdminSections] = useState({
  typeDefaults: true, bergDisplay: false, constraints: false, wood: false, dimensions: false,
  steps: false, pricing: false, importExport: false,
});
```

---

### Task 5: Update import/export to include new state

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:201-222` (exportParams and importParams)

**Step 1: Update exportParams**

Change line 202:
```jsx
const data = { version: 2, constr, dimConfig, enabledHolzarten, enabledSteps, pricing, stepOrder };
```
To:
```jsx
const data = { version: 2, constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder };
```

**Step 2: Update importParams**

After line 221 (`if (data.stepOrder) setStepOrder(data.stepOrder);`), add:
```jsx
if (data.enabledSchriftarten) setEnabledSchriftarten(data.enabledSchriftarten);
if (data.enabledBerge) setEnabledBerge(data.enabledBerge);
if (data.bergDisplay) setBergDisplay(data.bergDisplay);
```

---

### Task 6: Add enable/disable toggles to AdminTypeDefaults

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — AdminTypeDefaults component (lines ~937-1038)

**Step 1: Update component signature**

Change:
```jsx
function AdminTypeDefaults({ form, set, constr, limits }) {
```
To:
```jsx
function AdminTypeDefaults({ form, set, constr, limits, enabledSchriftarten, toggleSchriftart, enabledBerge, toggleBerg }) {
```

**Step 2: Add eye toggle to each font row**

In the font picker section, each `<button>` for a font gets an eye icon overlay. Replace the schriftarten.map block (lines ~965-977) with:

```jsx
{schriftarten.map((f) => {
  const on = form.schriftart === f.value;
  const enabled = enabledSchriftarten[f.value];
  const isLastEnabled = Object.values(enabledSchriftarten).filter(Boolean).length === 1 && enabled;
  return (
    <div key={f.value} style={{ position: "relative", opacity: enabled ? 1 : 0.4, transition: "opacity .2s" }}>
      <button onClick={() => set("schriftart", f.value)}
        style={{ ...S.fontRow, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg, width: "100%" }}>
        {on && <div style={S.fontCheck}>✓</div>}
        <span style={{ fontSize: 24, fontFamily: f.family, fontWeight: f.weight, color: on ? t.brand : t.text, lineHeight: 1.1, letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
          {form.schriftzug || "Beispiel"}
        </span>
      </button>
      <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleSchriftart(f.value); }}
        title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
        style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${enabled ? t.brand : t.border}`, background: enabled ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLastEnabled ? "not-allowed" : "pointer", fontSize: 14, padding: 0, fontFamily: "inherit" }}>
        {enabled ? "👁" : "🚫"}
      </button>
    </div>
  );
})}
```

**Step 3: Add eye toggle to each berg card**

Replace the berge.map block (lines ~1025-1033) with:

```jsx
{berge.map((b) => { const on = form.berg === b.value; const enabled = enabledBerge[b.value]; const isLastEnabled = Object.values(enabledBerge).filter(Boolean).length === 1 && enabled; return (
  <div key={b.value} style={{ position: "relative", opacity: enabled ? 1 : 0.4, transition: "opacity .2s" }}>
    <button onClick={() => set("berg", b.value)} style={{ ...S.bergCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg, width: "100%" }}>
      {on && <div style={S.bergCheckmark}>✓</div>}
      <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
        <path d={b.path} fill={on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)"} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: on ? t.brand : t.text }}>{b.label}</span>
      <span style={{ fontSize: 10, color: t.muted }}>{b.hoehe} · {b.region}</span>
    </button>
    <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleBerg(b.value); }}
      title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
      style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, border: `1.5px solid ${enabled ? t.brand : t.border}`, background: enabled ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLastEnabled ? "not-allowed" : "pointer", fontSize: 12, padding: 0, fontFamily: "inherit", zIndex: 2 }}>
      {enabled ? "👁" : "🚫"}
    </button>
  </div>
);})}
```

**Step 4: Update the component call** at line ~311

Change:
```jsx
<AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} />
```
To:
```jsx
<AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} enabledSchriftarten={enabledSchriftarten} toggleSchriftart={toggleSchriftart} enabledBerge={enabledBerge} toggleBerg={toggleBerg} />
```

**Step 5: Verify**

Open admin mode. Each font row and berg card should show an eye icon. Clicking toggles opacity. Cannot disable the last one.

---

### Task 7: Create AdminBergDisplay component

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — insert new component after AdminTypeDefaults (before AdminConstraints)

**Step 1: Write the component**

Insert after the closing `}` of AdminTypeDefaults (before `function AdminConstraints`):

```jsx
function AdminBergDisplay({ bergDisplay, setBergDisp }) {
  const sampleBerg = berge[0];
  const labelFont = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Relief / Clean toggle */}
      <div>
        <label style={S.label}>Darstellungsmodus</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ value: "relief", label: "Relief (gefüllt)" }, { value: "clean", label: "Clean (Kontur)" }].map((m) => (
            <button key={m.value} onClick={() => setBergDisp("mode", m.value)}
              style={{ ...S.toggleBtn, flex: 1, borderColor: bergDisplay.mode === m.value ? t.brand : t.border, background: bergDisplay.mode === m.value ? "rgba(31,59,49,.07)" : t.fieldBg, color: bergDisplay.mode === m.value ? t.brand : t.muted, fontWeight: bergDisplay.mode === m.value ? 700 : 400 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview: side by side */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Vorschau</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {["relief", "clean"].map((mode) => {
            const active = bergDisplay.mode === mode;
            return (
              <div key={mode} style={{ flex: 1, maxWidth: 160, padding: 10, border: `1.5px solid ${active ? t.brand : t.border}`, borderRadius: 3, background: active ? "rgba(31,59,49,.04)" : t.fieldBg, textAlign: "center", transition: "all .2s" }}>
                <svg viewBox="0 0 100 70" style={{ width: "100%", height: 50 }} preserveAspectRatio="none">
                  <path d={sampleBerg.path}
                    fill={mode === "relief" ? (active ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)") : "none"}
                    stroke={active ? t.brand : t.muted}
                    strokeWidth={active ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <div style={{ fontSize: 11, fontWeight: 700, color: active ? t.brand : t.text, fontFamily: labelFont?.family || "inherit" }}>{sampleBerg.label}</div>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && (
                  <div style={{ fontSize: 9, color: t.muted }}>
                    {[bergDisplay.showHeight && sampleBerg.hoehe, bergDisplay.showRegion && sampleBerg.region].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ fontSize: 9, color: t.muted, marginTop: 4, fontStyle: "italic" }}>{mode === "relief" ? "Relief" : "Clean"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Label visibility toggles */}
      <div>
        <label style={S.label}>Sichtbare Labels</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ key: "showName", label: "Bergname" }, { key: "showHeight", label: "Höhe" }, { key: "showRegion", label: "Region" }].map((item) => {
            const on = bergDisplay[item.key];
            return (
              <button key={item.key} onClick={() => setBergDisp(item.key, !on)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: `1.5px solid ${on ? t.brand : t.border}`, borderRadius: 3, background: on ? "rgba(31,59,49,.05)" : t.fieldBg, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${on ? t.brand : t.border}`, background: on ? t.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                  {on && <span style={{ color: t.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? t.text : t.muted }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Label font picker */}
      <div>
        <label style={S.label}>Label-Schriftart</label>
        <select value={bergDisplay.labelFont} onChange={(e) => setBergDisp("labelFont", e.target.value)} style={S.select}>
          <option value="">System (Standard)</option>
          {schriftarten.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        {bergDisplay.labelFont && labelFont && (
          <div style={{ marginTop: 8, padding: "8px 12px", border: `1px solid ${t.border}`, borderRadius: 3, background: t.fieldBg, textAlign: "center" }}>
            <span style={{ fontSize: 18, fontFamily: labelFont.family, fontWeight: labelFont.weight, color: t.text }}>{sampleBerg.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Task 8: Add AdminBergDisplay section to admin layout

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:312-313` (after AdminTypeDefaults CollapsibleSection)

**Step 1: Insert new CollapsibleSection**

After the closing `</CollapsibleSection>` of typeDefaults (line ~312), insert:

```jsx
<CollapsibleSection id="bergDisplay" title="Bergmotiv-Darstellung" summary={`${bergDisplay.mode === "relief" ? "Relief" : "Clean"} · ${[bergDisplay.showName && "Name", bergDisplay.showHeight && "Höhe", bergDisplay.showRegion && "Region"].filter(Boolean).join(", ") || "Keine Labels"}`} icon="🏔" open={adminSections.bergDisplay} onToggle={toggleSection}>
  <AdminBergDisplay bergDisplay={bergDisplay} setBergDisp={setBergDisp} />
</CollapsibleSection>
```

**Step 2: Verify**

Open admin mode. New "Bergmotiv-Darstellung" section should appear between "Produkt-Typ Vorgaben" and "Produktgrenzen". Toggle relief/clean, toggle labels, pick a font — preview updates live.

---

### Task 9: Update customer-facing font picker to use activeSchriftarten

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:484-497` (customer typen phase font picker)

**Step 1: Replace `schriftarten` with `activeSchriftarten`**

Change line ~485:
```jsx
{schriftarten.map((f) => {
```
To:
```jsx
{activeSchriftarten.map((f) => {
```

---

### Task 10: Update customer-facing berg grid to use activeBerge + bergDisplay

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:564-575` (customer typen phase berg grid)

**Step 1: Replace the berg grid**

Change lines ~566-574:
```jsx
<div style={S.bergGrid}>{berge.map((b) => { const on = form.berg === b.value; return (
  <button key={b.value} onClick={() => set("berg", b.value)} style={{ ...S.bergCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg }}>
    {on && <div style={S.bergCheckmark}>✓</div>}
    <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
      <path d={b.path} fill={on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)"} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span style={{ fontSize: 12, fontWeight: 700, color: on ? t.brand : t.text }}>{b.label}</span>
    <span style={{ fontSize: 10, color: t.muted }}>{b.hoehe} · {b.region}</span>
  </button>);})}</div>
```

To:
```jsx
<div style={S.bergGrid}>{activeBerge.map((b) => { const on = form.berg === b.value; const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null; return (
  <button key={b.value} onClick={() => set("berg", b.value)} style={{ ...S.bergCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg }}>
    {on && <div style={S.bergCheckmark}>✓</div>}
    <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
      <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {bergDisplay.showName && <span style={{ fontSize: 12, fontWeight: 700, color: on ? t.brand : t.text, fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
    {(bergDisplay.showHeight || bergDisplay.showRegion) && <span style={{ fontSize: 10, color: t.muted }}>{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" · ")}</span>}
  </button>);})}</div>
```

---

### Task 11: Update admin berg grid in AdminTypeDefaults to also use bergDisplay

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — AdminTypeDefaults bergmotiv section

**Step 1: Update component signature**

Add `bergDisplay` to the destructured props:
```jsx
function AdminTypeDefaults({ form, set, constr, limits, enabledSchriftarten, toggleSchriftart, enabledBerge, toggleBerg, bergDisplay }) {
```

**Step 2: Apply bergDisplay to the admin berg cards**

In the admin berg grid (Task 6's berg cards), update the SVG path fill and label rendering to match the customer-facing version from Task 10 — use `bergDisplay.mode`, `bergDisplay.showName`, `bergDisplay.showHeight`, `bergDisplay.showRegion`, `bergDisplay.labelFont`.

**Step 3: Pass bergDisplay in the component call**

Update line ~311:
```jsx
<AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} enabledSchriftarten={enabledSchriftarten} toggleSchriftart={toggleSchriftart} enabledBerge={enabledBerge} toggleBerg={toggleBerg} bergDisplay={bergDisplay} />
```

---

### Task 12: Final verification

**Step 1: Admin mode**
- Open `http://localhost:3000/test-wizard?mode=admin`
- Expand "Produkt-Typ Vorgaben": toggle fonts on/off (eye icon), toggle berge on/off
- Expand "Bergmotiv-Darstellung": switch relief/clean, toggle name/height/region, pick label font
- Verify preview updates in real-time

**Step 2: Customer mode**
- Switch to "Kunde" mode
- Select Schriftzug: only enabled fonts appear
- Select Bergmotiv: only enabled mountains appear, display matches relief/clean config, labels match visibility and font settings

**Step 3: Import/Export**
- Export settings, disable some fonts/mountains, change berg display
- Re-import — verify settings restore correctly

**Step 4: Cross-mode persistence**
- Make selections in admin, switch to Kunde, switch back — all settings persist
