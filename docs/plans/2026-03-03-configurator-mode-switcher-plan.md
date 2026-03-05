# Configurator Mode-Switcher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate admin configuration from customer wizard into three switchable modes (Admin/Preview/Workflow) in the existing single-file GarderobeWizard component.

**Architecture:** Add a `mode` state driven by `?mode=admin` URL param. Admin mode shows collapsible config panels. Preview mode shows drag-reorderable pipeline + phone-frame wizard preview + financial breakdown. Workflow mode is the unchanged customer experience. All in one file, consistent with current pattern.

**Tech Stack:** React (hooks), inline CSS-in-JS (existing `S` object + `t` tokens), no external dependencies.

**Source file:** `app/garderobe-wizard (3).jsx` (~1127 lines)

---

### Task 1: Add Mode State + URL Param Detection

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:121-130` (inside GarderobeWizard component, state declarations)

**Step 1: Add mode state and URL detection**

At line 122, after `const [phase, setPhase] = useState("typen");`, add:

```jsx
const [mode, setMode] = useState(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "admin" ? "admin" : "workflow";
  }
  return "workflow";
});
const isAdmin = mode !== "workflow";
```

**Step 2: Verify it renders**

Open the page with no params — should render exactly as before (workflow mode).
Open with `?mode=admin` — should also render (still shows old config phase for now).

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add mode state with URL param detection for admin/workflow"
```

---

### Task 2: Add AdminHeader Component with Mode Switcher

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add component before the `Shell` component (~line 987), add styles to `S` object (~line 1025)

**Step 1: Add the AdminHeader component**

Insert before the `Shell` function (around line 987):

```jsx
function AdminHeader({ mode, onModeChange }) {
  const modes = [
    { id: "admin", label: "Admin", icon: "⚙️" },
    { id: "preview", label: "Vorschau", icon: "👁" },
    { id: "workflow", label: "Kunde", icon: "🛒" },
  ];
  return (
    <header style={S.adminHeader}>
      <div style={S.adminHeaderInner}>
        <div style={S.brandRow}>
          <div style={S.brandMark} />
          <span style={S.brandName}>Holzschneiderei</span>
        </div>
        <div style={S.modeSwitcher}>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              style={{
                ...S.modeBtn,
                background: mode === m.id ? t.brand : "transparent",
                color: mode === m.id ? t.white : t.muted,
                borderColor: mode === m.id ? t.brand : t.border,
              }}
            >
              <span style={{ fontSize: 12 }}>{m.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em" }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Add styles to the S object**

Add these entries to the `S` object (around line 1025):

```jsx
adminHeader: {
  position: "sticky", top: 0, zIndex: 10, background: t.bg,
  borderBottom: `1px solid ${t.border}`,
},
adminHeaderInner: {
  maxWidth: 600, margin: "0 auto", padding: "10px 20px",
  display: "flex", justifyContent: "space-between", alignItems: "center",
},
modeSwitcher: {
  display: "flex", gap: 3, background: t.fieldBg,
  border: `1px solid ${t.border}`, borderRadius: 3, padding: 2,
},
modeBtn: {
  display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
  border: "1px solid", borderRadius: 2, cursor: "pointer",
  fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap",
},
```

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminHeader component with mode switcher"
```

---

### Task 3: Wire Mode Switcher into Main Component Routing

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:121` (GarderobeWizard main render logic)

**Step 1: Add top-level mode routing**

In the `GarderobeWizard` function, find the existing phase-based rendering. Wrap the entire return logic with mode-based routing. At the very top of the render section (before `if (phase === "typen")`), add:

```jsx
/* ═══════════ MODE: ADMIN ═══════════ */
if (isAdmin && mode === "admin") {
  return (
    <div style={S.shell}>
      <AdminHeader mode={mode} onModeChange={setMode} />
      <main style={S.main}>
        <div style={S.card}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ ...S.configTitle, fontSize: "clamp(18px,3vw,26px)" }}>Admin-Konfiguration</h1>
              <p style={{ fontSize: 13, color: t.muted }}>Produktparameter, Schritte und Preise verwalten</p>
            </div>
            <p style={{ textAlign: "center", color: t.muted, fontSize: 12 }}>Admin panels werden hier eingesetzt (Task 5–11)</p>
          </Fade>
        </div>
      </main>
      <Footer />
      <GlobalStyles flow={flow} />
    </div>
  );
}

/* ═══════════ MODE: PREVIEW ═══════════ */
if (isAdmin && mode === "preview") {
  return (
    <div style={S.shell}>
      <AdminHeader mode={mode} onModeChange={setMode} />
      <main style={S.main}>
        <div style={S.card}>
          <p style={{ textAlign: "center", color: t.muted, fontSize: 12 }}>Preview wird hier eingesetzt (Task 12–14)</p>
        </div>
      </main>
      <Footer />
      <GlobalStyles flow={flow} />
    </div>
  );
}

/* ═══════════ MODE: WORKFLOW (customer) — existing logic below ═══════════ */
```

The existing `if (phase === "typen")` etc. blocks remain unchanged — they are the workflow mode.

**Step 2: Verify**

- `?mode=admin` → shows "Admin-Konfiguration" placeholder
- `?mode=admin` then click "Vorschau" → shows preview placeholder
- `?mode=admin` then click "Kunde" → shows normal customer wizard
- No param → normal customer wizard, no mode switcher

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: wire mode routing — admin/preview placeholders, workflow unchanged"
```

---

### Task 4: Add Collapsible Section Component + Pricing Defaults

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add CollapsibleSection component, pricing state, DEFAULT_PRICING constant

**Step 1: Add DEFAULT_PRICING constant**

After `DEFAULT_CONSTR` (line 56), add:

```jsx
const DEFAULT_PRICING = {
  woodCosts: { eiche: 85, esche: 75, nussbaum: 120, ahorn: 70, arve: 95 },
  labourRate: 75,
  hoursBase: 4,
  hoursPerM2: 2,
  extrasCosts: { spiegel: 120, schuhablage: 180, schublade: 220, schluesselleiste: 45, sitzbank: 280 },
  margin: 1.8,
};
```

**Step 2: Add pricing state to GarderobeWizard**

After the `mode` state declaration, add:

```jsx
const [pricing, setPricing] = useState({ ...DEFAULT_PRICING });
const [stepOrder, setStepOrder] = useState(() =>
  [...OPTIONAL_STEPS.filter((s) => s.defaultOn).map((s) => s.id), ...FIXED_STEP_IDS]
);
const [adminSections, setAdminSections] = useState({
  typeDefaults: true, constraints: false, wood: false, dimensions: false,
  steps: false, pricing: false, importExport: false,
});
const toggleSection = (key) => setAdminSections((p) => ({ ...p, [key]: !p[key] }));
```

**Step 3: Add CollapsibleSection component**

Insert near the other shared components (around line 987):

```jsx
function CollapsibleSection({ id, title, summary, icon, open, onToggle, children }) {
  return (
    <div style={{ ...S.featureCard, marginBottom: 10 }}>
      <button onClick={() => onToggle(id)} style={S.collapseHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{title}</div>
            {!open && summary && <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{summary}</div>}
          </div>
        </div>
        <span style={{ fontSize: 14, color: t.muted, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {open && <div style={{ padding: "12px 0 0" }}>{children}</div>}
    </div>
  );
}
```

**Step 4: Add styles**

Add to `S` object:

```jsx
collapseHeader: {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", background: "none", border: "none", padding: 0,
  cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 12,
},
```

**Step 5: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add CollapsibleSection, pricing defaults, stepOrder + admin state"
```

---

### Task 5: AdminTypeDefaults Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add AdminTypeDefaults component, wire into admin mode render

**Step 1: Add AdminTypeDefaults component**

```jsx
function AdminTypeDefaults({ form, set }) {
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={S.label}>Standard-Typ</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["schriftzug", "bergmotiv"].map((typ) => (
            <button key={typ} onClick={() => set("typ", typ)}
              style={{ ...S.toggleBtn, flex: 1, borderColor: form.typ === typ ? t.brand : t.border, background: form.typ === typ ? "rgba(31,59,49,.07)" : t.fieldBg, color: form.typ === typ ? t.brand : t.muted, fontWeight: form.typ === typ ? 700 : 400 }}>
              {typ === "schriftzug" ? "✏️ Schriftzug" : "⛰️ Bergmotiv"}
            </button>
          ))}
        </div>
      </div>
      {form.typ === "schriftzug" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextField label="Standard-Schriftzug" value={form.schriftzug} onChange={(v) => set("schriftzug", v)} placeholder="z.B. Willkommen" />
          <div>
            <label style={S.label}>Standard-Schriftart</label>
            <select value={form.schriftart} onChange={(e) => set("schriftart", e.target.value)} style={S.select}>
              <option value="">Bitte wählen</option>
              {schriftarten.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {form.typ === "bergmotiv" && (
        <div>
          <label style={S.label}>Standard-Berg</label>
          <select value={form.berg} onChange={(e) => set("berg", e.target.value)} style={S.select}>
            <option value="">Bitte wählen</option>
            {berge.map((b) => <option key={b.value} value={b.value}>{b.label} ({b.hoehe})</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Wire into admin mode render**

Replace the placeholder text inside the admin mode `<Fade>` block with:

```jsx
<CollapsibleSection id="typeDefaults" title="Produkt-Typ Vorgaben" summary={form.typ ? (form.typ === "schriftzug" ? `✏️ "${form.schriftzug}"` : `⛰️ ${berge.find(b => b.value === form.berg)?.label || "–"}`) : "Nicht gesetzt"} icon="🏷" open={adminSections.typeDefaults} onToggle={toggleSection}>
  <AdminTypeDefaults form={form} set={set} />
</CollapsibleSection>
```

**Step 3: Verify**

Open `?mode=admin` — should show "Produkt-Typ Vorgaben" collapsible section. Click to expand. Select type, enter text. Collapse — summary should update.

**Step 4: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminTypeDefaults collapsible section"
```

---

### Task 6: AdminConstraints Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — extract constraint editor from existing config phase into AdminConstraints component

**Step 1: Add AdminConstraints component**

This is extracted from the existing inline constraint editor (lines 608-645). Create the component:

```jsx
function AdminConstraints({ constr, setConstrVal, limits }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
        {[
          { k: "MIN_W", l: "Min. Breite (cm)" }, { k: "MAX_W", l: "Max. Breite (cm)" },
          { k: "MIN_H", l: "Min. Höhe (cm)" }, { k: "MAX_H", l: "Max. Höhe (cm)" },
          { k: "MIN_D", l: "Min. Tiefe (cm)" }, { k: "MAX_D", l: "Max. Tiefe (cm)" },
          { k: "HOOK_SPACING", l: "Haken-Abstand (cm)" }, { k: "EDGE_MARGIN", l: "Randabstand (cm)" },
          { k: "LETTER_W", l: "Breite/Buchstabe (cm)" }, { k: "LETTER_MARGIN", l: "Schrift-Rand (cm)" },
        ].map(({ k, l }) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: t.muted, flex: 1, minWidth: 0 }}>{l}</span>
            <input type="number" value={constr[k]} onChange={(e) => setConstrVal(k, e.target.value)}
              style={{ ...S.input, width: 52, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
      {/* Hook distribution visual */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: t.muted, marginBottom: 4 }}>Haken-Verteilung:</div>
        {[limits.minW, Math.round((limits.minW + limits.maxW) / 2), limits.maxW].filter((w, i, a) => a.indexOf(w) === i).map((w) => {
          const mh = limits.hooksFor(w);
          const pct = (n) => constr.EDGE_MARGIN / w * 100 + (n * (constr.HOOK_SPACING / w * 100));
          return (
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: t.muted, width: 40, textAlign: "right", flexShrink: 0 }}>{w} cm</span>
              <div style={{ flex: 1, height: 16, background: "rgba(31,59,49,.05)", border: `1px solid ${t.border}`, borderRadius: 2, position: "relative" }}>
                {Array.from({ length: mh }).map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: `${pct(i)}%`, top: 2, width: 2, height: 12, background: t.brand, borderRadius: 1, opacity: 0.7 }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: t.brand, fontWeight: 700, width: 24, flexShrink: 0 }}>{mh}x</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Wire into admin mode**

Add after the typeDefaults CollapsibleSection:

```jsx
<CollapsibleSection id="constraints" title="Produktgrenzen" summary={`${constr.MIN_W}–${constr.MAX_W} cm B, ${constr.MIN_H}–${constr.MAX_H} cm H`} icon="📏" open={adminSections.constraints} onToggle={toggleSection}>
  <AdminConstraints constr={constr} setConstrVal={setConstrVal} limits={limits} />
</CollapsibleSection>
```

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminConstraints collapsible section"
```

---

### Task 7: AdminWoodSelection Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — extract wood toggle from existing config phase

**Step 1: Add AdminWoodSelection component**

Extracted from existing wood selection (lines 498-526):

```jsx
function AdminWoodSelection({ enabledHolzarten, toggleHolz, activeCount }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {holzarten.map((h) => {
        const on = enabledHolzarten[h.value];
        const isLast = activeCount === 1 && on;
        return (
          <button key={h.value} onClick={() => !isLast && toggleHolz(h.value)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${on ? t.brand : t.border}`, borderRadius: 3, background: on ? "rgba(31,59,49,.05)" : t.fieldBg, cursor: isLast ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s", opacity: isLast ? 0.7 : 1 }}>
            <div style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${on ? t.brand : t.border}`, background: on ? t.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
              {on && <span style={{ color: t.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{h.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: on ? t.text : t.muted }}>{h.label}</span>
              <span style={{ fontSize: 11, color: t.muted, marginLeft: 6 }}>{h.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Wire into admin mode**

```jsx
<CollapsibleSection id="wood" title="Holzarten" summary={`${activeHolzarten.length} von ${holzarten.length} aktiv`} icon="🪵" open={adminSections.wood} onToggle={toggleSection}>
  <AdminWoodSelection enabledHolzarten={enabledHolzarten} toggleHolz={toggleHolz} activeCount={activeHolzarten.length} />
</CollapsibleSection>
```

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminWoodSelection collapsible section"
```

---

### Task 8: AdminDimensions Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — extract dimension config from existing config phase

**Step 1: Add AdminDimensions component**

Extracted from existing dimension config (lines 546-605):

```jsx
function AdminDimensions({ constr, dimConfig, setDim, addPreset, removePreset }) {
  return (
    <div>
      {DIM_FIELDS.map((dim) => {
        const cfg = dimConfig[dim.key];
        const min = constr[dim.constrMin];
        const max = constr[dim.constrMax];
        return (
          <div key={dim.key} style={{ padding: "12px 0", borderTop: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setDim(dim.key, "enabled", !cfg.enabled)}
                  style={{ ...S.miniToggle, background: cfg.enabled ? t.brand : t.border }}>
                  <div style={{ ...S.miniToggleThumb, transform: cfg.enabled ? "translateX(14px)" : "translateX(0)" }} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 700, color: cfg.enabled ? t.text : t.muted }}>{dim.label}</span>
                <span style={{ fontSize: 10, color: t.muted }}>{min}–{max} {dim.unit}</span>
              </div>
              {cfg.enabled && (
                <div style={{ display: "flex", gap: 2, background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 3, padding: 2 }}>
                  {DIM_MODES.map((m) => (
                    <button key={m.value} onClick={() => setDim(dim.key, "mode", m.value)}
                      style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, border: "1px solid", borderColor: cfg.mode === m.value ? t.brand : "transparent", borderRadius: 2, background: cfg.mode === m.value ? t.brand : "transparent", color: cfg.mode === m.value ? t.white : t.muted, cursor: "pointer", fontFamily: "inherit" }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {cfg.enabled && cfg.mode !== "text" && (
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                  {cfg.presets.filter((v) => v >= min && v <= max).map((p) => (
                    <span key={p} style={S.presetPill}>{p}<button onClick={() => removePreset(dim.key, p)} style={S.presetRemove}>x</button></span>
                  ))}
                  {cfg.presets.filter((v) => v < min || v > max).map((p) => (
                    <span key={p} style={{ ...S.presetPill, opacity: 0.4, textDecoration: "line-through" }}>{p}<button onClick={() => removePreset(dim.key, p)} style={S.presetRemove}>x</button></span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" placeholder="Wert hinzufuegen" id={`add-${dim.key}`}
                    style={{ ...S.input, fontSize: 11, height: 28, flex: 1, padding: "0 8px" }}
                    onKeyDown={(e) => { if (e.key === "Enter") { addPreset(dim.key, e.target.value); e.target.value = ""; } }} />
                  <button onClick={() => { const el = document.getElementById(`add-${dim.key}`); addPreset(dim.key, el.value); el.value = ""; }}
                    style={{ ...S.navBtn, height: 28, padding: "0 10px", fontSize: 10, ...S.navBtnOutline }}>+</button>
                </div>
              </div>
            )}
            {cfg.enabled && cfg.mode === "text" && (
              <div style={{ fontSize: 10, color: t.muted, fontStyle: "italic" }}>Freitext-Eingabe ({min}–{max} {dim.unit})</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Wire into admin mode**

```jsx
<CollapsibleSection id="dimensions" title="Abmessungen" summary={DIM_FIELDS.map(d => `${d.label}: ${dimConfig[d.key].mode}`).join(", ")} icon="📐" open={adminSections.dimensions} onToggle={toggleSection}>
  <AdminDimensions constr={constr} dimConfig={dimConfig} setDim={setDim} addPreset={addPreset} removePreset={removePreset} />
</CollapsibleSection>
```

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminDimensions collapsible section"
```

---

### Task 9: AdminSteps Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add AdminSteps component with step toggles and pipeline preview

**Step 1: Add AdminSteps component**

```jsx
function AdminSteps({ enabledSteps, toggleStep, stepOrder }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {OPTIONAL_STEPS.map((s) => {
          const on = enabledSteps[s.id];
          const locked = s.required;
          return (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              style={{ ...S.configCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.05)" : t.fieldBg }}>
              <div style={S.configCardLeft}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.label}</span>
                    {locked && <span style={S.pflichtBadge}>Pflicht</span>}
                  </div>
                  <span style={{ fontSize: 11, color: t.muted, lineHeight: 1.35 }}>{s.desc}</span>
                  {!on && !locked && <div style={S.defaultHint}>Standard: {s.defaultLabel}</div>}
                </div>
              </div>
              <div style={{ ...S.toggle, background: locked ? t.brand : on ? t.brand : t.border, justifyContent: on || locked ? "flex-end" : "flex-start", opacity: locked ? .6 : 1 }}>
                <div style={S.toggleThumb} />
              </div>
            </button>
          );
        })}
      </div>
      {/* Pipeline preview */}
      <div style={S.pipelineBox}>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
          Ablauf — {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).length} Schritte
        </div>
        <div style={S.pipeline}>
          {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).map((id, i, arr) => {
            const o = OPTIONAL_STEPS.find((x) => x.id === id);
            const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
            const ic = o?.icon || (id === "kontakt" ? "📋" : "✓");
            return (
              <div key={id} style={{ display: "flex", alignItems: "center" }}>
                <div style={S.pipeChip}>
                  <span style={{ fontSize: 13 }}>{ic}</span>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{lb}</span>
                </div>
                {i < arr.length - 1 && <span style={{ color: t.border, margin: "0 3px", fontSize: 13 }}>›</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Wire into admin mode**

```jsx
<CollapsibleSection id="steps" title="Wizard-Schritte" summary={`${OPTIONAL_STEPS.filter(s => enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`} icon="🔀" open={adminSections.steps} onToggle={toggleSection}>
  <AdminSteps enabledSteps={enabledSteps} toggleStep={toggleStep} stepOrder={stepOrder} />
</CollapsibleSection>
```

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminSteps collapsible section with pipeline preview"
```

---

### Task 10: AdminPricing Section

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add AdminPricing component

**Step 1: Add pricing helper**

After `computeLimits` function, add:

```jsx
function computePrice(form, pricing) {
  const b = parseInt(form.breite) || 80;
  const h = parseInt(form.hoehe) || 180;
  const d = parseInt(form.tiefe) || 35;
  const surfaceM2 = (b * h * 2 + b * d * 2 + h * d * 2) / 10000;
  const materialCost = surfaceM2 * (pricing.woodCosts[form.holzart] || 85);
  const estimatedHours = pricing.hoursBase + surfaceM2 * pricing.hoursPerM2;
  const labourCost = estimatedHours * pricing.labourRate;
  const extrasCost = (form.extras || []).reduce((sum, ex) => sum + (pricing.extrasCosts[ex] || 0), 0);
  const productionCost = materialCost + labourCost + extrasCost;
  const customerPrice = productionCost * pricing.margin;
  return { surfaceM2, materialCost, labourCost, extrasCost, estimatedHours, productionCost, customerPrice };
}
```

**Step 2: Add AdminPricing component**

```jsx
function AdminPricing({ pricing, setPricing }) {
  const setField = (key, val) => setPricing((p) => ({ ...p, [key]: parseFloat(val) || 0 }));
  const setWoodCost = (wood, val) => setPricing((p) => ({ ...p, woodCosts: { ...p.woodCosts, [wood]: parseFloat(val) || 0 } }));
  const setExtraCost = (extra, val) => setPricing((p) => ({ ...p, extrasCosts: { ...p.extrasCosts, [extra]: parseFloat(val) || 0 } }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Wood costs */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Materialkosten (CHF/m²)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {holzarten.map((h) => (
            <div key={h.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{h.emoji}</span>
              <span style={{ fontSize: 11, color: t.muted, flex: 1 }}>{h.label}</span>
              <input type="number" value={pricing.woodCosts[h.value] || 0} onChange={(e) => setWoodCost(h.value, e.target.value)}
                style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      {/* Labour */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Arbeitskosten</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: t.muted, flex: 1 }}>Stundenansatz (CHF)</span>
            <input type="number" value={pricing.labourRate} onChange={(e) => setField("labourRate", e.target.value)}
              style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: t.muted, flex: 1 }}>Basis-Stunden</span>
            <input type="number" value={pricing.hoursBase} onChange={(e) => setField("hoursBase", e.target.value)}
              style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: t.muted, flex: 1 }}>Std/m² (zusätzlich)</span>
            <input type="number" step="0.1" value={pricing.hoursPerM2} onChange={(e) => setField("hoursPerM2", e.target.value)}
              style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
        </div>
      </div>
      {/* Extras */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Extras-Preise (CHF)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {extrasOptions.map((ex) => (
            <div key={ex.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{ex.icon}</span>
              <span style={{ fontSize: 11, color: t.muted, flex: 1 }}>{ex.label}</span>
              <input type="number" value={pricing.extrasCosts[ex.value] || 0} onChange={(e) => setExtraCost(ex.value, e.target.value)}
                style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      {/* Margin */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Marge</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: t.muted }}>Faktor:</span>
          <input type="number" step="0.1" value={pricing.margin} onChange={(e) => setField("margin", e.target.value)}
            style={{ ...S.input, width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px" }} />
          <span style={{ fontSize: 11, color: t.muted }}>= {Math.round((pricing.margin - 1) * 100)}% Aufschlag</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Wire into admin mode**

```jsx
<CollapsibleSection id="pricing" title="Preiskalkulation" summary={`Marge ${pricing.margin}x (${Math.round((pricing.margin - 1) * 100)}%)`} icon="💰" open={adminSections.pricing} onToggle={toggleSection}>
  <AdminPricing pricing={pricing} setPricing={setPricing} />
</CollapsibleSection>
```

**Step 4: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminPricing section + computePrice helper"
```

---

### Task 11: AdminImportExport Section (updated with pricing + stepOrder)

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — update exportParams/importParams, add AdminImportExport component

**Step 1: Update exportParams to include pricing and stepOrder**

Change the existing `exportParams` function (line 162):

```jsx
const exportParams = () => {
  const data = { version: 2, constr, dimConfig, enabledHolzarten, enabledSteps, pricing, stepOrder };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "garderobe-parameter.json"; a.click();
  URL.revokeObjectURL(url);
};
```

**Step 2: Update importParams to load pricing and stepOrder**

Change the existing `importParams` function (line 168):

```jsx
const importParams = () => {
  const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.constr) setConstr(data.constr);
        if (data.dimConfig) setDimConfig(data.dimConfig);
        if (data.enabledHolzarten) setEnabledHolzarten(data.enabledHolzarten);
        if (data.enabledSteps) setEnabledSteps(data.enabledSteps);
        if (data.pricing) setPricing(data.pricing);
        if (data.stepOrder) setStepOrder(data.stepOrder);
      } catch { /* ignore bad files */ }
    };
    reader.readAsText(file);
  };
  input.click();
};
```

**Step 3: Add AdminImportExport component**

```jsx
function AdminImportExport({ onExport, onImport }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={onExport} style={{ ...S.navBtn, ...S.navBtnOutline, flex: 1, height: 36, fontSize: 11 }}>↓ Exportieren</button>
      <button onClick={onImport} style={{ ...S.navBtn, ...S.navBtnOutline, flex: 1, height: 36, fontSize: 11 }}>↑ Importieren</button>
    </div>
  );
}
```

**Step 4: Wire into admin mode**

```jsx
<CollapsibleSection id="importExport" title="Import / Export" summary="Parameter als JSON" icon="📦" open={adminSections.importExport} onToggle={toggleSection}>
  <AdminImportExport onExport={exportParams} onImport={importParams} />
</CollapsibleSection>
```

**Step 5: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add AdminImportExport, extend export with pricing + stepOrder"
```

---

### Task 12: StepPipeline Component (Drag-Reorderable)

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add StepPipeline with drag-to-reorder

**Step 1: Add StepPipeline component**

Uses HTML5 drag & drop (no external deps):

```jsx
function StepPipeline({ stepOrder, setStepOrder, enabledSteps, toggleStep }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const visibleSteps = stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id));

  const onDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
  const onDrop = (e, dropIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    setStepOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setOverIdx(null);
  };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
        Schritte anordnen (Drag & Drop)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {visibleSteps.map((id, i) => {
          const o = OPTIONAL_STEPS.find((x) => x.id === id);
          const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
          const ic = o?.icon || (id === "kontakt" ? "📋" : "✓");
          const isFixed = FIXED_STEP_IDS.includes(id);
          const isOptional = !isFixed && o && !o.required;
          return (
            <div key={id} style={{ display: "flex", alignItems: "center" }}>
              <div
                draggable={!isFixed}
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={(e) => onDrop(e, i)}
                onDragEnd={onDragEnd}
                style={{
                  ...S.pipeChip,
                  cursor: isFixed ? "default" : "grab",
                  opacity: dragIdx === i ? 0.4 : 1,
                  outline: overIdx === i ? `2px solid ${t.brand}` : "none",
                  outlineOffset: 2,
                  position: "relative",
                  paddingRight: isOptional ? 28 : undefined,
                }}
              >
                <span style={{ fontSize: 13 }}>{ic}</span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{lb}</span>
                {isOptional && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStep(id); }}
                    style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: t.muted, fontFamily: "inherit", padding: "0 2px" }}
                  >
                    x
                  </button>
                )}
              </div>
              {i < visibleSteps.length - 1 && <span style={{ color: t.border, margin: "0 3px", fontSize: 13 }}>›</span>}
            </div>
          );
        })}
      </div>
      {/* Disabled steps — click to re-enable */}
      {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 10, color: t.muted, alignSelf: "center" }}>Deaktiviert:</span>
          {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).map((s) => (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              style={{ ...S.pipeChip, opacity: 0.5, cursor: "pointer", border: `1px dashed ${t.border}`, background: "transparent" }}>
              <span style={{ fontSize: 11 }}>{s.icon}</span>
              <span style={{ fontSize: 10 }}>+ {s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add StepPipeline with drag-reorder and toggle"
```

---

### Task 13: FinancialSummary Component

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add FinancialSummary component

**Step 1: Add FinancialSummary component**

```jsx
function FinancialSummary({ form, pricing }) {
  const price = computePrice(form, pricing);
  const fmt = (n) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const wood = holzarten.find((h) => h.value === form.holzart);
  return (
    <div style={{ ...S.featureCard, borderColor: t.brand }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>💰</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Kalkulation</div>
          <div style={{ fontSize: 11, color: t.muted }}>Echtzeitberechnung auf Basis der Konfiguration</div>
        </div>
      </div>
      <div style={S.summarySection}>
        <SummaryRow label="Fläche" value={`${price.surfaceM2.toFixed(3)} m²`} />
        <SummaryRow label={`Material (${wood?.label || "–"} @ ${pricing.woodCosts[form.holzart] || 0} CHF/m²)`} value={`CHF ${fmt(price.materialCost)}`} />
        <SummaryRow label={`Arbeit (${price.estimatedHours.toFixed(1)}h @ ${pricing.labourRate} CHF/h)`} value={`CHF ${fmt(price.labourCost)}`} />
        {price.extrasCost > 0 && <SummaryRow label="Extras" value={`CHF ${fmt(price.extrasCost)}`} />}
        <div style={{ ...S.summaryRow, borderTop: `1px solid ${t.border}`, paddingTop: 10, marginTop: 4 }}>
          <span style={{ ...S.summaryLabel, color: t.text }}>Herstellkosten</span>
          <span style={{ ...S.summaryValue, fontWeight: 700 }}>CHF {fmt(price.productionCost)}</span>
        </div>
        <div style={S.summaryRow}>
          <span style={S.summaryLabel}>Marge ({pricing.margin}x)</span>
          <span style={S.summaryValue}>+{Math.round((pricing.margin - 1) * 100)}%</span>
        </div>
        <div style={{ ...S.summaryRow, background: "rgba(31,59,49,.06)", borderRadius: 3, padding: "12px 16px" }}>
          <span style={{ ...S.summaryLabel, fontSize: 13, color: t.brand }}>Kundenpreis</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: t.brand }}>CHF {fmt(price.customerPrice)}</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: add FinancialSummary component with cost breakdown"
```

---

### Task 14: Preview Mode — Wire It All Together

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — build preview mode render, add PhoneFrame component

**Step 1: Add PhoneFrame component**

```jsx
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 375, maxWidth: "100%", margin: "0 auto",
      border: `2px solid ${t.border}`, borderRadius: 24,
      padding: "8px 0", background: t.bg,
      boxShadow: "0 4px 24px rgba(0,0,0,.08)",
      overflow: "hidden",
    }}>
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
        <div style={{ width: 80, height: 4, borderRadius: 2, background: t.border }} />
      </div>
      <div style={{ maxHeight: 667, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Wire preview mode render**

Replace the preview mode placeholder with:

```jsx
if (isAdmin && mode === "preview") {
  return (
    <div style={S.shell}>
      <AdminHeader mode={mode} onModeChange={setMode} />
      <main style={{ ...S.main, flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ width: "100%", maxWidth: 520 }}>
          <StepPipeline stepOrder={stepOrder} setStepOrder={setStepOrder} enabledSteps={enabledSteps} toggleStep={toggleStep} />
        </div>
        <PhoneFrame>
          {/* Render the customer wizard phases inside the phone frame */}
          {/* This reuses the existing phase-based rendering */}
          <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textAlign: "center", padding: "8px 0", background: "rgba(31,59,49,.04)", letterSpacing: ".1em", textTransform: "uppercase" }}>
            Kunden-Ansicht
          </div>
          {/* Re-render the workflow inside the frame */}
          {phase === "typen" && (
            <div style={{ padding: "16px 12px" }}>
              {/* Simplified type selection preview — reuses same logic */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h1 style={{ ...S.configTitle, fontSize: 18 }}>Garderobe bestellen</h1>
                <p style={{ fontSize: 11, color: t.muted }}>Massanfertigung aus Schweizer Holz</p>
              </div>
              <div style={S.typGrid}>
                <button onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
                  style={{ ...S.typCard, borderColor: form.typ === "schriftzug" ? t.brand : t.border, background: form.typ === "schriftzug" ? "rgba(31,59,49,.06)" : t.fieldBg, fontSize: 11, padding: 10 }}>
                  <span style={{ ...S.typLabel, fontSize: 11 }}>Schriftzug</span>
                </button>
                <button onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
                  style={{ ...S.typCard, borderColor: form.typ === "bergmotiv" ? t.brand : t.border, background: form.typ === "bergmotiv" ? "rgba(31,59,49,.06)" : t.fieldBg, fontSize: 11, padding: 10 }}>
                  <span style={{ ...S.typLabel, fontSize: 11 }}>Bergmotiv</span>
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => {
                  const e = {};
                  if (!form.typ) e.typ = true;
                  if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
                  if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
                  if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
                  if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
                  setErrors(e);
                  if (Object.keys(e).length) return;
                  startWizard();
                }} style={{ ...S.navBtn, ...S.navBtnSolid, fontSize: 11, height: 36, padding: "0 20px" }}>
                  Weiter →
                </button>
              </div>
            </div>
          )}
          {phase === "wizard" && (
            <div style={{ padding: "12px" }}>
              <div style={{ marginBottom: 12 }}>
                {currentStepId === "holzart" && <StepHolzart form={form} set={set} errors={errors} holzarten={activeHolzarten} />}
                {currentStepId === "masse" && <StepMasse form={form} set={set} errors={errors} limits={limits} constr={constr} dimConfig={dimConfig} />}
                {currentStepId === "ausfuehrung" && <StepAusfuehrung form={form} set={set} limits={limits} constr={constr} />}
                {currentStepId === "extras" && <StepExtras form={form} toggleExtra={toggleExtra} set={set} />}
                {currentStepId === "kontakt" && <StepKontakt form={form} set={set} errors={errors} />}
                {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} />}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button onClick={wizardIndex === 0 ? () => { setPhase("typen"); } : prev} style={{ ...S.navBtn, ...S.navBtnOutline, fontSize: 10, height: 32 }}>← Zurück</button>
                {currentStepId !== "uebersicht"
                  ? <button onClick={next} style={{ ...S.navBtn, ...S.navBtnSolid, fontSize: 10, height: 32 }}>Weiter →</button>
                  : <button onClick={doSubmit} style={{ ...S.navBtn, ...S.navBtnSolid, fontSize: 10, height: 32 }}>Absenden ✓</button>}
              </div>
            </div>
          )}
          {phase === "done" && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 13, color: t.muted }}>Vielen Dank!</p>
              <button onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }} style={{ ...S.navBtn, ...S.navBtnOutline, fontSize: 10, height: 32, marginTop: 12 }}>Neu starten</button>
            </div>
          )}
        </PhoneFrame>
        <div style={{ width: "100%", maxWidth: 520 }}>
          <FinancialSummary form={form} pricing={pricing} />
        </div>
      </main>
      <Footer />
      <GlobalStyles flow={flow} />
    </div>
  );
}
```

**Step 3: Update activeSteps to use stepOrder**

Replace the existing `activeSteps` useMemo (line 195-198) with:

```jsx
const activeSteps = useMemo(() => {
  return stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id));
}, [stepOrder, enabledSteps]);
```

**Step 4: Verify all three modes work**

- `?mode=admin` → shows all admin sections, can switch to preview/workflow
- Preview → shows pipeline, phone frame with wizard, financial summary
- Workflow (no param) → clean customer wizard, no toggle

**Step 5: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: wire preview mode with PhoneFrame, StepPipeline, FinancialSummary"
```

---

### Task 15: Add Indicative Price to Customer Summary

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — extend StepUebersicht with indicative price

**Step 1: Update StepUebersicht to accept pricing prop**

Add `pricing` to the destructured props of `StepUebersicht`:

```jsx
function StepUebersicht({ form, set, errors, skippedSteps, pricing }) {
```

**Step 2: Add indicative price display**

Inside StepUebersicht, after the info box and before the Datenschutz checkbox, add:

```jsx
{pricing && (() => {
  const price = computePrice(form, pricing);
  const fmt = (n) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return (
    <div style={{ background: "rgba(31,59,49,.06)", border: `1px solid ${t.brand}`, borderRadius: 3, padding: "14px 16px", marginTop: 14, textAlign: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>Richtpreis</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: t.brand, letterSpacing: ".02em" }}>ab CHF {fmt(price.customerPrice)}.–</div>
      <div style={{ fontSize: 10, color: t.muted, marginTop: 4 }}>Unverbindlich · Endpreis gemäss Offerte</div>
    </div>
  );
})()}
```

**Step 3: Pass pricing prop where StepUebersicht is rendered**

In both the workflow wizard render (line ~736) and the preview render, update:

```jsx
{currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} pricing={pricing} />}
```

**Step 4: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: show indicative price in customer summary step"
```

---

### Task 16: Remove Old Config Phase

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — remove the `phase === "config"` block

**Step 1: Remove the config phase**

Delete the entire `if (phase === "config")` block (approximately lines 422-686). This was the old mixed admin/config screen that has been fully replaced by the admin mode.

**Step 2: Update the typen phase "Weiter" button**

In the typen phase (around line 404), change the button that currently transitions to `setPhase("config")`. Instead, it should now go directly to `startWizard()`:

```jsx
onClick={() => {
  const e = {};
  if (!form.typ) e.typ = true;
  if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
  if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
  if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
  if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
  setErrors(e);
  if (Object.keys(e).length) { triggerShake(); return; }
  startWizard();
}}
```

**Step 3: Update wizard "back" button**

In the wizard phase bottom bar (around line 742), change the `wizardIndex === 0` back button to go back to `typen` instead of `config`:

```jsx
<button onClick={wizardIndex === 0 ? () => setPhase("typen") : prev} ...>
  {wizardIndex === 0 ? "← Zurück" : "← Zurück"}
</button>
```

**Step 4: Verify**

- Customer flow: typen → wizard → done (no config phase)
- Admin mode still has all configuration
- Back button in wizard goes to typen phase

**Step 5: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "feat: remove old config phase, customer goes directly typen→wizard→done"
```

---

### Task 17: Final Cleanup + End-to-End Verification

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — cleanup dead code

**Step 1: Remove unused variables/functions**

Check for any references to the old config phase (e.g. `setPhase("config")`) and remove them. The `startWizard` function may need updating since it previously reset from the config phase.

**Step 2: End-to-end verification checklist**

Open each mode and verify:

- [ ] `?mode=admin` → Admin header with 3-mode switcher
- [ ] Admin → 7 collapsible sections all functional
- [ ] Admin → sections collapse/expand, summaries show
- [ ] Admin → pricing inputs work, change margin/costs
- [ ] Admin → import/export includes pricing + stepOrder
- [ ] Preview → pipeline shows all steps, can drag to reorder
- [ ] Preview → can toggle steps on/off from pipeline
- [ ] Preview → phone frame shows customer wizard, can click through
- [ ] Preview → financial summary updates in real-time
- [ ] Workflow (no param) → no mode switcher visible
- [ ] Workflow → customer sees typen → wizard → done
- [ ] Workflow → indicative price shows in summary step
- [ ] Workflow → back button from wizard step 1 goes to typen

**Step 3: Commit**

```bash
git add "app/garderobe-wizard (3).jsx"
git commit -m "chore: final cleanup, remove dead config phase references"
```
