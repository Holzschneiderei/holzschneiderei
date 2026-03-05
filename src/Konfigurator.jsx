import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { send, listen, autoResize } from "./bridge.js";

/* ── Brand tokens (kept for SVG fill/stroke interpolation) ── */
const t = {
  text: "#1f2a23", muted: "#5b615b", brand: "#1f3b31",
  border: "#c8c5bb", error: "#a03030", fieldBg: "#faf9f6", white: "#ffffff",
};

/* ── Data ── */
const holzarten = [
  { value: "eiche", label: "Eiche", desc: "Robust & zeitlos", emoji: "🪵" },
  { value: "esche", label: "Esche", desc: "Hell & elegant", emoji: "🌿" },
  { value: "nussbaum", label: "Nussbaum", desc: "Warm & edel", emoji: "🌰" },
  { value: "ahorn", label: "Ahorn", desc: "Fein & hell", emoji: "🍁" },
  { value: "arve", label: "Arve / Zirbe", desc: "Duftend & alpin", emoji: "🌲" },
];
const oberflaechen = [
  { value: "natur-geoelt", label: "Natur geölt" }, { value: "weiss-geoelt", label: "Weiss geölt" },
  { value: "gewachst", label: "Gewachst" }, { value: "lackiert", label: "Lackiert (matt)" }, { value: "unbehandelt", label: "Unbehandelt" },
];
const hakenMaterialien = [
  { value: "holz", label: "Holz (passend)" }, { value: "edelstahl", label: "Edelstahl" },
  { value: "messing", label: "Messing" }, { value: "schwarz-metall", label: "Schwarz Metall" },
];
const extrasOptions = [
  { value: "spiegel", label: "Spiegel", icon: "🪞" }, { value: "schuhablage", label: "Schuhablage", icon: "👟" },
  { value: "schublade", label: "Schublade", icon: "🗄" }, { value: "schluesselleiste", label: "Schlüsselleiste", icon: "🔑" },
  { value: "sitzbank", label: "Sitzbank", icon: "🪑" },
];
const berge = [
  { value: "matterhorn", label: "Matterhorn", hoehe: "4'478 m", region: "Wallis", path: "M 0,70 L 18,72 28,55 38,28 42,15 46,10 50,8 52,10 55,18 58,28 62,38 70,50 78,58 88,65 100,70" },
  { value: "eiger", label: "Eiger", hoehe: "3'967 m", region: "Berner Oberland", path: "M 0,70 L 15,68 25,52 30,40 36,30 42,20 50,14 55,12 60,16 65,22 72,35 78,48 85,58 100,70" },
  { value: "jungfrau", label: "Jungfrau", hoehe: "4'158 m", region: "Berner Oberland", path: "M 0,70 L 12,65 22,50 30,38 38,25 44,16 50,11 56,14 60,20 66,30 74,42 82,55 92,64 100,70" },
  { value: "pilatus", label: "Pilatus", hoehe: "2'128 m", region: "Zentralschweiz", path: "M 0,70 L 10,66 20,55 28,42 35,32 40,25 48,18 55,15 62,18 68,28 72,22 78,16 82,20 88,35 94,52 100,70" },
  { value: "saentis", label: "Säntis", hoehe: "2'502 m", region: "Appenzell", path: "M 0,70 L 14,65 24,50 32,38 40,28 46,20 52,14 56,12 60,15 66,24 72,34 80,48 90,60 100,70" },
  { value: "titlis", label: "Titlis", hoehe: "3'238 m", region: "Obwalden", path: "M 0,70 L 12,66 20,55 26,44 34,34 40,24 46,18 52,13 58,12 64,15 70,24 76,36 84,50 92,62 100,70" },
  { value: "rigi", label: "Rigi", hoehe: "1'797 m", region: "Zentralschweiz", path: "M 0,70 L 10,62 20,50 30,40 40,32 48,26 56,22 62,20 68,22 74,28 80,38 88,50 94,60 100,70" },
];

const schriftarten = [
  { value: "sans",      label: "Modern",     desc: "Klar & zeitlos",      family: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', weight: 800, sample: "Ag" },
  { value: "serif",     label: "Klassisch",   desc: "Elegant & traditionell", family: 'Georgia, "Times New Roman", Times, serif', weight: 700, sample: "Ag" },
  { value: "slab",      label: "Slab",        desc: "Kräftig & industrial", family: '"Courier New", Courier, monospace', weight: 700, sample: "Ag" },
  { value: "condensed", label: "Schmal",      desc: "Kompakt & markant",   family: 'Impact, "Arial Narrow", sans-serif', weight: 400, sample: "Ag" },
  { value: "rounded",   label: "Rund",        desc: "Weich & freundlich",  family: 'Verdana, "Trebuchet MS", sans-serif', weight: 700, sample: "Ag" },
  { value: "script",    label: "Handschrift", desc: "Persönlich & warm",   family: '"Brush Script MT", "Segoe Script", cursive', weight: 400, sample: "Ag" },
];

/* ── Physikalische Grenzen (editierbar im Admin) ── */
const DEFAULT_CONSTR = {
  MIN_W: 30, MAX_W: 100,
  MIN_H: 80, MAX_H: 250,
  MIN_D: 20, MAX_D: 60,
  HOOK_SPACING: 10, EDGE_MARGIN: 5,
  LETTER_W: 5, LETTER_MARGIN: 4,
};

const DEFAULT_PRICING = {
  woodCosts: { eiche: 85, esche: 75, nussbaum: 120, ahorn: 70, arve: 95 },
  labourRate: 75,
  hoursBase: 4,
  hoursPerM2: 2,
  extrasCosts: { spiegel: 120, schuhablage: 180, schublade: 220, schluesselleiste: 45, sitzbank: 280 },
  margin: 1.8,
};

/* ── Dimension-Konfiguration ── */
const DIM_FIELDS = [
  { key: "breite", label: "Breite", unit: "cm", constrMin: "MIN_W", constrMax: "MAX_W" },
  { key: "hoehe",  label: "Höhe",   unit: "cm", constrMin: "MIN_H", constrMax: "MAX_H" },
  { key: "tiefe",  label: "Tiefe",  unit: "cm", constrMin: "MIN_D", constrMax: "MAX_D" },
];
const DIM_MODES = [
  { value: "text",  label: "Freitext" },
  { value: "combo", label: "Combobox" },
  { value: "pills", label: "Pills" },
];

function makeDefaultDimConfig(constr) {
  return {
    breite: { enabled: true, mode: "pills", presets: [30, 40, 50, 60, 70, 80, 90, 100].filter(v => v >= constr.MIN_W && v <= constr.MAX_W) },
    hoehe:  { enabled: true, mode: "pills", presets: [100, 120, 140, 160, 180, 200, 220, 250].filter(v => v >= constr.MIN_H && v <= constr.MAX_H) },
    tiefe:  { enabled: true, mode: "combo", presets: [20, 25, 30, 35, 40, 50, 60].filter(v => v >= constr.MIN_D && v <= constr.MAX_D) },
  };
}

function computeLimits(form, constr) {
  const letters = form.typ === "schriftzug" ? form.schriftzug.replace(/\s/g, "").length : 0;
  const minWText = letters > 0 ? letters * constr.LETTER_W + 2 * constr.LETTER_MARGIN : 0;
  const minW = Math.max(constr.MIN_W, minWText);
  const maxW = constr.MAX_W;
  const textTooLong = minW > maxW;
  const maxLetters = Math.floor((maxW - 2 * constr.LETTER_MARGIN) / constr.LETTER_W);
  const hooksFor = (w) => { const u = w - 2 * constr.EDGE_MARGIN; return u < 0 ? 0 : Math.floor(u / constr.HOOK_SPACING) + 1; };
  const w = Math.max(minW, Math.min(maxW, parseInt(form.breite) || minW));
  const maxHooks = hooksFor(w);
  const maxHooksMax = hooksFor(maxW);
  const maxHooksMin = hooksFor(minW);
  const hookOptions = []; for (let i = 1; i <= maxHooks; i++) hookOptions.push(i);
  const minWForHooks = (n) => n <= 1 ? constr.MIN_W : (n - 1) * constr.HOOK_SPACING + 2 * constr.EDGE_MARGIN;
  return { minW, maxW, minWText, textTooLong, maxLetters, letters, maxHooks, maxHooksMax, maxHooksMin, hookOptions, hooksFor, minWForHooks, clampedW: w };
}

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

const OPTIONAL_STEPS = [
  { id: "holzart", label: "Holzart", desc: "Eiche, Esche, Nussbaum, Ahorn oder Arve", icon: "🪵", defaultOn: true, required: false, defaults: { holzart: "eiche" }, defaultLabel: "Eiche" },
  { id: "masse", label: "Abmessungen", desc: "Breite, Höhe und Tiefe in cm", icon: "📐", defaultOn: true, required: true, defaults: { breite: "80", hoehe: "180", tiefe: "35" }, defaultLabel: "80 × 180 × 35 cm" },
  { id: "ausfuehrung", label: "Ausführung", desc: "Oberfläche, Haken & Hutablage", icon: "✨", defaultOn: true, required: false, defaults: { oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja" }, defaultLabel: "Natur geölt, 6 Holzhaken" },
  { id: "extras", label: "Extras & Wünsche", desc: "Spiegel, Schuhablage, Bemerkungen", icon: "🎛", defaultOn: false, required: false, defaults: { extras: [], bemerkungen: "" }, defaultLabel: "Keine Extras" },
];
const FIXED_STEP_IDS = ["kontakt", "uebersicht"];
const DEFAULT_FORM = {
  typ: "", schriftzug: "", schriftart: "", berg: "",
  holzart: "eiche", breite: "80", hoehe: "180", tiefe: "35",
  oberflaeche: "natur-geoelt", haken: "6", hakenmaterial: "holz", hutablage: "ja",
  extras: [], bemerkungen: "",
  anrede: "", vorname: "", nachname: "", email: "", telefon: "", strasse: "", plz: "", ort: "",
  datenschutz: false,
};

/* ── Flow directions ── */
const FLOWS = [
  { id: "ltr", label: "→", title: "Links → Rechts" },
  { id: "ttb", label: "↓", title: "Oben → Unten" },
  { id: "btt", label: "↑", title: "Unten → Oben" },
];

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export default function GarderobeWizard() {
  const [phase, setPhase] = useState("typen");
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "admin" ? "admin" : "workflow";
    }
    return "workflow";
  });
  const isAdmin = mode !== "workflow";
  const [pricing, setPricing] = useState({ ...DEFAULT_PRICING });
  const [stepOrder, setStepOrder] = useState(() =>
    [...OPTIONAL_STEPS.filter((s) => s.defaultOn).map((s) => s.id), ...FIXED_STEP_IDS]
  );
  const [adminSections, setAdminSections] = useState({
    typeDefaults: true, bergDisplay: false, constraints: false, wood: false, dimensions: false,
    steps: false, pricing: false, importExport: false,
  });
  const toggleSection = (key) => setAdminSections((p) => ({ ...p, [key]: !p[key] }));
  const [constr, setConstr] = useState({ ...DEFAULT_CONSTR });
  const [dimConfig, setDimConfig] = useState(() => makeDefaultDimConfig(DEFAULT_CONSTR));
  const [enabledSteps, setEnabledSteps] = useState(
    OPTIONAL_STEPS.reduce((acc, s) => ({ ...acc, [s.id]: s.defaultOn }), {})
  );
  const [wizardIndex, setWizardIndex] = useState(0);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});
  const [enabledHolzarten, setEnabledHolzarten] = useState(
    holzarten.reduce((acc, h) => ({ ...acc, [h.value]: true }), {})
  );
  const activeHolzarten = useMemo(() => holzarten.filter((h) => enabledHolzarten[h.value]), [enabledHolzarten]);
  const toggleHolz = (val) => {
    setEnabledHolzarten((p) => {
      const next = { ...p, [val]: !p[val] };
      if (Object.values(next).filter(Boolean).length === 0) return p;
      if (!next[form.holzart]) {
        const first = holzarten.find((h) => next[h.value]);
        if (first) setForm((f) => ({ ...f, holzart: first.value }));
      }
      return next;
    });
  };
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
  const [bergDisplay, setBergDisplay] = useState({ mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" });
  const setBergDisp = (key, val) => setBergDisplay((p) => ({ ...p, [key]: val }));

  // Dimension config helpers
  const setDim = (key, field, val) => setDimConfig((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));
  const addPreset = (key, val) => {
    const n = parseInt(val); if (isNaN(n)) return;
    setDimConfig((p) => {
      const cur = p[key].presets;
      if (cur.includes(n)) return p;
      return { ...p, [key]: { ...p[key], presets: [...cur, n].sort((a, b) => a - b) } };
    });
  };
  const removePreset = (key, val) => setDimConfig((p) => ({ ...p, [key]: { ...p[key], presets: p[key].presets.filter((v) => v !== val) } }));
  const setConstrVal = (key, val) => setConstr((p) => ({ ...p, [key]: parseInt(val) || 0 }));

  // Config helpers
  const getConfig = () => ({ version: 2, constr, dimConfig, enabledHolzarten, enabledSchriftarten, enabledBerge, bergDisplay, enabledSteps, pricing, stepOrder });

  const applyConfig = (data) => {
    if (data.constr) setConstr(data.constr);
    if (data.dimConfig) setDimConfig(data.dimConfig);
    if (data.enabledHolzarten) setEnabledHolzarten(data.enabledHolzarten);
    if (data.enabledSteps) setEnabledSteps(data.enabledSteps);
    if (data.pricing) setPricing(data.pricing);
    if (data.stepOrder) setStepOrder(data.stepOrder);
    if (data.enabledSchriftarten) setEnabledSchriftarten(data.enabledSchriftarten);
    if (data.enabledBerge) setEnabledBerge(data.enabledBerge);
    if (data.bergDisplay) setBergDisplay(data.bergDisplay);
  };

  // Save config: post to parent + file download as fallback
  const saveConfig = () => {
    const config = getConfig();
    send("config-save", { config });
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "garderobe-parameter.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const exportParams = saveConfig;
  const importParams = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { applyConfig(JSON.parse(ev.target.result)); } catch { /* ignore bad files */ }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  const [shake, setShake] = useState(false);
  const [flow, setFlow] = useState("ltr");
  const [navDir, setNavDir] = useState(1); // 1=forward, -1=back
  const [animKey, setAnimKey] = useState(0);
  const shellRef = useRef(null);

  // Constraint engine – recomputes on every relevant form change
  const limits = useMemo(() => computeLimits(form, constr), [form.typ, form.schriftzug, form.breite, constr]);

  const activeSteps = useMemo(() => {
    return stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id));
  }, [stepOrder, enabledSteps]);
  const totalSteps = activeSteps.length;
  const currentStepId = activeSteps[wizardIndex];

  const toggleStep = (id) => { const s = OPTIONAL_STEPS.find((x) => x.id === id); if (s?.required) return; setEnabledSteps((p) => ({ ...p, [id]: !p[id] })); };
  const set = (key, val) => { setForm((p) => ({ ...p, [key]: val })); setErrors((p) => { const n = { ...p }; delete n[key]; return n; }); };
  const toggleExtra = (val) => setForm((p) => ({ ...p, extras: p.extras.includes(val) ? p.extras.filter((v) => v !== val) : [...p.extras, val] }));

  const startWizard = () => {
    const nf = { ...form };
    OPTIONAL_STEPS.forEach((s) => { if (!enabledSteps[s.id] && s.defaults) Object.assign(nf, s.defaults); });
    const lim = computeLimits(nf, constr);
    const w = parseInt(nf.breite) || lim.minW;
    nf.breite = String(Math.max(lim.minW, Math.min(lim.maxW, w)));
    const maxH = lim.hooksFor(parseInt(nf.breite));
    const h = parseInt(nf.haken) || maxH;
    nf.haken = String(Math.min(h, maxH));
    setForm(nf); setWizardIndex(0); setErrors({}); setPhase("wizard"); setNavDir(1); setAnimKey((k) => k + 1);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validate = () => {
    const e = {};
    if (currentStepId === "holzart" && !form.holzart) e.holzart = true;
    if (currentStepId === "masse") {
      DIM_FIELDS.forEach((d) => {
        if (!dimConfig[d.key].enabled) return;
        if (!form[d.key]) { e[d.key] = true; return; }
        const v = parseInt(form[d.key]);
        const min = d.key === "breite" ? limits.minW : constr[d.constrMin];
        const max = d.key === "breite" ? limits.maxW : constr[d.constrMax];
        if (v < min || v > max) e[d.key] = true;
      });
    }
    if (currentStepId === "kontakt") {
      if (!form.vorname.trim()) e.vorname = true; if (!form.nachname.trim()) e.nachname = true;
      if (!form.email.trim()) e.email = true; if (!form.plz.trim()) e.plz = true; if (!form.ort.trim()) e.ort = true;
    }
    if (currentStepId === "uebersicht" && !form.datenschutz) e.datenschutz = true;
    setErrors(e); if (Object.keys(e).length) triggerShake(); return Object.keys(e).length === 0;
  };

  const next = () => { if (!validate()) return; if (wizardIndex < totalSteps - 1) { setNavDir(1); setAnimKey((k) => k + 1); setWizardIndex((i) => i + 1); } };
  const prev = () => { if (wizardIndex > 0) { setNavDir(-1); setAnimKey((k) => k + 1); setWizardIndex((i) => i - 1); } };
  const doSubmit = () => { if (!validate()) return; send("order-submit", { order: form }); setPhase("done"); };

  // Notify parent of step changes
  useEffect(() => {
    if (phase === "wizard") send("step-change", { step: currentStepId, index: wizardIndex, total: totalSteps });
  }, [wizardIndex, phase, currentStepId, totalSteps]);

  useEffect(() => { shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [wizardIndex, phase]);

  // Bridge: parent ↔ iframe communication
  useEffect(() => {
    const cleanupResize = autoResize();
    const cleanupListen = listen({
      "config-load": (msg) => { if (msg.config) applyConfig(msg.config); },
      "set-mode": (msg) => { if (msg.mode) setMode(msg.mode); },
      "set-background": (msg) => { if (msg.color) document.documentElement.style.setProperty("--wz-bg", msg.color); },
    });
    send("ready");
    return () => { cleanupResize(); cleanupListen(); };
  }, []);

  const skippedSteps = useMemo(() => OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id]), [enabledSteps]);

  // Build animation name based on flow + direction
  const getAnimName = useCallback(() => {
    if (flow === "ltr") return navDir > 0 ? "slideFromRight" : "slideFromLeft";
    if (flow === "ttb") return navDir > 0 ? "slideFromBottom" : "slideFromTop";
    if (flow === "btt") return navDir > 0 ? "slideFromTop" : "slideFromBottom";
    return "slideFromRight";
  }, [flow, navDir]);

  /* ═══════════ MODE: ADMIN ═══════════ */
  if (isAdmin && mode === "admin") {
    return (
      <div className="wz-shell">
        <AdminHeader mode={mode} onModeChange={setMode} />
        <main className="wz-main">
          <div className="wz-admin-card wz-card">
            <Fade>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h1 className="wz-config-title" style={{ fontSize: "clamp(18px,3vw,26px)" }}>Admin-Konfiguration</h1>
                <p style={{ fontSize: 13, color: "var(--wz-muted)" }}>Produktparameter, Schritte und Preise verwalten</p>
              </div>
              <div className="wz-admin-sections">
              <CollapsibleSection id="typeDefaults" title="Produkt-Typ Vorgaben" summary={form.typ ? (form.typ === "schriftzug" ? `✏️ "${form.schriftzug}"` : `⛰️ ${berge.find(b => b.value === form.berg)?.label || "–"}`) : "Nicht gesetzt"} icon="🏷" open={adminSections.typeDefaults} onToggle={toggleSection}>
                <AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} enabledSchriftarten={enabledSchriftarten} toggleSchriftart={toggleSchriftart} enabledBerge={enabledBerge} toggleBerg={toggleBerg} bergDisplay={bergDisplay} />
              </CollapsibleSection>

              <CollapsibleSection id="bergDisplay" title="Bergmotiv-Darstellung" summary={`${bergDisplay.mode === "relief" ? "Relief" : "Clean"} · ${[bergDisplay.showName && "Name", bergDisplay.showHeight && "Höhe", bergDisplay.showRegion && "Region"].filter(Boolean).join(", ") || "Keine Labels"}`} icon="🏔" open={adminSections.bergDisplay} onToggle={toggleSection}>
                <AdminBergDisplay bergDisplay={bergDisplay} setBergDisp={setBergDisp} />
              </CollapsibleSection>

              <CollapsibleSection id="constraints" title="Produktgrenzen" summary={`${constr.MIN_W}–${constr.MAX_W} cm B, ${constr.MIN_H}–${constr.MAX_H} cm H`} icon="📏" open={adminSections.constraints} onToggle={toggleSection}>
                <AdminConstraints constr={constr} setConstrVal={setConstrVal} limits={limits} />
              </CollapsibleSection>

              <CollapsibleSection id="wood" title="Holzarten" summary={`${activeHolzarten.length} von ${holzarten.length} aktiv`} icon="🪵" open={adminSections.wood} onToggle={toggleSection}>
                <AdminWoodSelection enabledHolzarten={enabledHolzarten} toggleHolz={toggleHolz} activeCount={activeHolzarten.length} />
              </CollapsibleSection>

              <CollapsibleSection id="dimensions" title="Abmessungen" summary={DIM_FIELDS.map(d => `${d.label}: ${dimConfig[d.key].mode}`).join(", ")} icon="📐" open={adminSections.dimensions} onToggle={toggleSection}>
                <AdminDimensions constr={constr} dimConfig={dimConfig} setDim={setDim} addPreset={addPreset} removePreset={removePreset} />
              </CollapsibleSection>

              <CollapsibleSection id="steps" title="Wizard-Schritte" summary={`${OPTIONAL_STEPS.filter(s => enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`} icon="🔀" open={adminSections.steps} onToggle={toggleSection}>
                <AdminSteps enabledSteps={enabledSteps} toggleStep={toggleStep} stepOrder={stepOrder} />
              </CollapsibleSection>

              <CollapsibleSection id="pricing" title="Preiskalkulation" summary={`Marge ${pricing.margin}x (${Math.round((pricing.margin - 1) * 100)}%)`} icon="💰" open={adminSections.pricing} onToggle={toggleSection}>
                <AdminPricing pricing={pricing} setPricing={setPricing} />
              </CollapsibleSection>

              <CollapsibleSection id="importExport" title="Import / Export" summary="Parameter als JSON" icon="📦" open={adminSections.importExport} onToggle={toggleSection}>
                <AdminImportExport onExport={exportParams} onImport={importParams} />
              </CollapsibleSection>
              </div>
            </Fade>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════ MODE: PREVIEW ═══════════ */
  if (isAdmin && mode === "preview") {
    return (
      <div className="wz-shell">
        <AdminHeader mode={mode} onModeChange={setMode} />
        <main className="wz-main" style={{ flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <StepPipeline stepOrder={stepOrder} setStepOrder={setStepOrder} enabledSteps={enabledSteps} toggleStep={toggleStep} />
          </div>
          <PhoneFrame>
            <div className="wz-section-label" style={{ textAlign: "center", padding: "8px 0", background: "var(--wz-brand-bg-subtle)" }}>
              Kunden-Ansicht
            </div>
            {phase === "typen" && (
              <div style={{ padding: "16px 12px" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <h1 className="wz-config-title" style={{ fontSize: 18 }}>Garderobe bestellen</h1>
                  <p style={{ fontSize: 11, color: "var(--wz-muted)" }}>Massanfertigung aus Schweizer Holz</p>
                </div>
                <div className="wz-typ-grid">
                  <button className="wz-typ-card" onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
                    style={{ borderColor: form.typ === "schriftzug" ? "var(--wz-brand)" : "var(--wz-border)", background: form.typ === "schriftzug" ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)", padding: 10 }}>
                    <span className="wz-typ-label" style={{ fontSize: 11 }}>Schriftzug</span>
                  </button>
                  <button className="wz-typ-card" onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
                    style={{ borderColor: form.typ === "bergmotiv" ? "var(--wz-brand)" : "var(--wz-border)", background: form.typ === "bergmotiv" ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)", padding: 10 }}>
                    <span className="wz-typ-label" style={{ fontSize: 11 }}>Bergmotiv</span>
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                  <button className="wz-nav-btn wz-nav-btn--solid" onClick={() => {
                    const e = {};
                    if (!form.typ) e.typ = true;
                    if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
                    if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
                    if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
                    if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
                    setErrors(e);
                    if (Object.keys(e).length) return;
                    startWizard();
                  }} style={{ fontSize: 11, height: 36, padding: "0 20px" }}>
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
                  {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} pricing={pricing} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <button className="wz-nav-btn wz-nav-btn--outline" onClick={wizardIndex === 0 ? () => { setPhase("typen"); } : prev} style={{ fontSize: 10, height: 32 }}>← Zurück</button>
                  {currentStepId !== "uebersicht"
                    ? <button className="wz-nav-btn wz-nav-btn--solid" onClick={next} style={{ fontSize: 10, height: 32 }}>Weiter →</button>
                    : <button className="wz-nav-btn wz-nav-btn--solid" onClick={doSubmit} style={{ fontSize: 10, height: 32 }}>Absenden ✓</button>}
                </div>
              </div>
            )}
            {phase === "done" && (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <p style={{ fontSize: 13, color: "var(--wz-muted)" }}>Vielen Dank!</p>
                <button className="wz-nav-btn wz-nav-btn--outline" onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }} style={{ fontSize: 10, height: 32, marginTop: 12 }}>Neu starten</button>
              </div>
            )}
          </PhoneFrame>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <FinancialSummary form={form} pricing={pricing} />
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════ MODE: WORKFLOW (customer) — existing logic below ═══════════ */

  /* ═══════════ PHASE: TYP ═══════════ */
  if (phase === "typen") {
    return (
      <Shell r={shellRef}>
        <main className="wz-main"><div className="wz-card"><Fade>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 className="wz-config-title">Garderobe bestellen</h1>
            <p className="wz-config-sub">Massanfertigung aus Schweizer Holz</p>
            <p style={{ fontSize: 13, color: "var(--wz-muted)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              Welchen Garderoben-Typ möchten Sie? Wählen Sie Ihr Motiv – danach konfigurieren Sie Holz, Masse und Details.
            </p>
          </div>
          <div className="wz-typ-grid">
            <button className="wz-typ-card" onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
              style={{ borderColor: form.typ === "schriftzug" ? "var(--wz-brand)" : "var(--wz-border)", background: form.typ === "schriftzug" ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)" }}>
              {form.typ === "schriftzug" && <div className="wz-typ-check">✓</div>}
              <div className="wz-typ-visual">
                <svg viewBox="0 0 160 80" style={{ width: "100%", height: 80 }}>
                  <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                  {[22,36,50,64,78].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                  <text x="112" y="48" textAnchor="middle" fontSize="8" fill={form.typ === "schriftzug" ? t.brand : t.muted} fontWeight="700" letterSpacing=".12em" fontFamily="system-ui">IHR TEXT</text>
                  {[122,136].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                </svg>
              </div>
              <span className="wz-typ-label">Schriftzug-Garderobe</span>
              <span className="wz-typ-desc">Ihr persönlicher Text als Motiv – z.B. Familienname oder Willkommensgruss.</span>
            </button>
            <button className="wz-typ-card" onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
              style={{ borderColor: form.typ === "bergmotiv" ? "var(--wz-brand)" : "var(--wz-border)", background: form.typ === "bergmotiv" ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)" }}>
              {form.typ === "bergmotiv" && <div className="wz-typ-check">✓</div>}
              <div className="wz-typ-visual">
                <svg viewBox="0 0 160 80" style={{ width: "100%", height: 80 }}>
                  <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                  <path d={berge[0].path} fill="none" stroke={form.typ === "bergmotiv" ? t.brand : t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(18,8) scale(1.24,0.72)" opacity="0.7" />
                  {[30,50,110,130].map((x,i) => <line key={i} x1={x} y1="25" x2={x} y2="57" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                </svg>
              </div>
              <span className="wz-typ-label">Bergmotiv-Garderobe</span>
              <span className="wz-typ-desc">Silhouette eines Schweizer Bergs – 7 ikonische Gipfel zur Auswahl.</span>
            </button>
          </div>
          {form.typ === "schriftzug" && (<Fade><div className="wz-sub-section">
            <label className="wz-label">Ihr Schriftzug <span style={{ color: "var(--wz-error)" }}>*</span></label>
            <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller …" value={form.schriftzug} onChange={(e) => set("schriftzug", e.target.value)}
              className="wz-input" style={{ fontSize: 16, height: 50, textAlign: "center", letterSpacing: ".06em", fontWeight: 600, borderColor: limits.textTooLong ? "var(--wz-error)" : "var(--wz-border)" }} />
            <div style={{ fontSize: 11, color: limits.textTooLong ? "var(--wz-error)" : "var(--wz-muted)", marginTop: 6, textAlign: "center" }}>
              {limits.textTooLong
                ? `Zu lang für ${constr.MAX_W} cm Breite – max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)`
                : `${limits.letters} / ${limits.maxLetters} Buchstaben · Breite min. ${limits.minW} cm`}
            </div>

            {/* Schriftart-Auswahl */}
            <div style={{ marginTop: 20 }}>
              <label className="wz-label">Schriftart wählen <span style={{ color: "var(--wz-error)" }}>*</span></label>
              <div className="wz-font-list">
                {activeSchriftarten.map((f) => {
                  const on = form.schriftart === f.value;
                  return (
                    <button key={f.value} onClick={() => set("schriftart", f.value)}
                      className="wz-font-row" style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)" }}>
                      {on && <div className="wz-font-check">✓</div>}
                      <span style={{ fontSize: 24, fontFamily: f.family, fontWeight: f.weight, color: on ? "var(--wz-brand)" : "var(--wz-text)", lineHeight: 1.1, letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {form.schriftzug || "Beispiel"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live-Vorschau: Garderobe mit Schriftzug-Kontur */}
            {form.schriftzug && form.schriftart && (() => {
              const font = schriftarten.find((f) => f.value === form.schriftart);
              return (
                <div style={{ marginTop: 20 }}>
                  <div className="wz-section-label" style={{ textAlign: "center", marginBottom: 8 }}>Live-Vorschau</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <svg viewBox="0 0 320 160" style={{ width: "100%", maxWidth: 380, height: "auto" }}>
                      <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                      {[45, 95, 145, 195, 245, 275].map((x, i) => (
                        <g key={i}>
                          <line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" />
                          <circle cx={x} cy="120" r="2.5" fill={t.border} />
                        </g>
                      ))}
                      <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                      <text x="160" y="52" textAnchor="middle"
                        fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                        fill="none" stroke={t.brand} strokeWidth="1.2"
                        letterSpacing=".06em" opacity="0.85">
                        {form.schriftzug.toUpperCase()}
                      </text>
                      <text x="160" y="52" textAnchor="middle"
                        fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                        fill={t.brand} opacity="0.08"
                        letterSpacing=".06em">
                        {form.schriftzug.toUpperCase()}
                      </text>
                      <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" />
                      <line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                      <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" />
                      <line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                      <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "var(--wz-muted)" }}>
                    Schrift: {font.label} · Die Kontur wird aus Holz gefräst
                  </div>
                </div>
              );
            })()}

            {/* Fallback-Preview ohne Schriftart */}
            {form.schriftzug && !form.schriftart && (<div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <svg viewBox="0 0 280 56" style={{ width: "100%", maxWidth: 340, height: 48 }}>
                <rect x="2" y="2" width="276" height="52" rx="2" fill="none" stroke={t.border} strokeWidth="1" />
                {[20,48,76,204,232,260].map((x,i) => <line key={i} x1={x} y1="12" x2={x} y2="44" stroke={t.border} strokeWidth="1.5" strokeLinecap="round" />)}
                <text x="140" y="34" textAnchor="middle" fontSize="12" fill={t.brand} fontWeight="800" letterSpacing=".1em" fontFamily="system-ui">{form.schriftzug.toUpperCase()}</text>
              </svg>
            </div>)}
          </div></Fade>)}
          {form.typ === "bergmotiv" && (<Fade><div className="wz-sub-section">
            <label className="wz-label">Berg auswählen <span style={{ color: "var(--wz-error)" }}>*</span></label>
            <div className="wz-berg-grid">{activeBerge.map((b) => { const on = form.berg === b.value; const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null; return (
              <button key={b.value} className="wz-berg-card" onClick={() => set("berg", b.value)} style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)" }}>
                {on && <div className="wz-berg-checkmark">✓</div>}
                <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
                  <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <span style={{ fontSize: 12, fontWeight: 700, color: on ? "var(--wz-brand)" : "var(--wz-text)", fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && <span style={{ fontSize: 10, color: "var(--wz-muted)" }}>{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" · ")}</span>}
              </button>);})}</div>
          </div></Fade>)}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <button className="wz-nav-btn wz-nav-btn--solid" onClick={() => {
              const e = {}; if (!form.typ) e.typ = true;
              if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
              if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
              if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
              if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
              setErrors(e); if (Object.keys(e).length) { triggerShake(); return; } startWizard();
            }} disabled={!form.typ} style={{ height: 48, padding: "0 36px", fontSize: 13, opacity: form.typ ? 1 : .35, cursor: form.typ ? "pointer" : "default" }}>
              Weiter zur Konfiguration →
            </button>
          </div>
          {(errors.schriftzug || errors.schriftart || errors.berg) && <p className="wz-error-text" style={{ textAlign: "center", marginTop: 8 }}>{errors.schriftzug ? "Bitte geben Sie einen Schriftzug ein." : errors.schriftart ? "Bitte wählen Sie eine Schriftart." : "Bitte wählen Sie einen Berg."}</p>}
        </Fade></div></main>
      </Shell>
    );
  }

  /* ═══════════ PHASE: DONE ═══════════ */
  if (phase === "done") {
    return (
      <Shell r={shellRef}>
        <main className="wz-main"><div className="wz-card"><Fade>
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 18, opacity: .8 }}>✓</div>
            <h2 className="wz-step-title" style={{ marginBottom: 12 }}>Vielen Dank!</h2>
            <p style={{ fontSize: 14, color: "var(--wz-muted)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px" }}>Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 2 Werktagen.</p>
            <button className="wz-nav-btn wz-nav-btn--outline" onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }} style={{ margin: "0 auto" }}>Neue Anfrage starten</button>
          </div>
        </Fade></div></main>
      </Shell>
    );
  }

  /* ═══════════ PHASE: WIZARD ═══════════ */
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typChip = form.typ === "schriftzug" ? `✏️ „${form.schriftzug}" · ${fontObj?.label || ""}` : `⛰️ ${bergObj?.label || ""}`;
  const animName = getAnimName();

  return (
    <div className="wz-shell" ref={shellRef}>
      <main className="wz-main">
        <div className="wz-wizard-body" style={{ width: "100%", maxWidth: 720, display: "flex" }}>
          <SideRail
            steps={activeSteps}
            stepData={OPTIONAL_STEPS}
            currentIndex={wizardIndex}
            onNavigate={(i) => { setNavDir(i > wizardIndex ? 1 : -1); setWizardIndex(i); setAnimKey((k) => k + 1); }}
            onBack={wizardIndex === 0 ? () => setPhase("typen") : prev}
            onSubmit={doSubmit}
            isFirst={wizardIndex === 0}
            isLast={currentStepId === "uebersicht"}
          />
          <div className="wz-wizard-content wz-card" style={shake ? { animation: "shake .4s" } : undefined}>
            <div className="wz-wizard-top-bar">
              <span style={{ fontSize: 12, color: "var(--wz-muted)" }}>{typChip}</span>
              <FlowPicker flow={flow} onChange={setFlow} />
            </div>

            <div key={animKey} style={{ animation: `${animName} .38s cubic-bezier(.22,1,.36,1)` }}>
              {currentStepId === "holzart" && <StepHolzart form={form} set={set} errors={errors} holzarten={activeHolzarten} />}
              {currentStepId === "masse" && <StepMasse form={form} set={set} errors={errors} limits={limits} constr={constr} dimConfig={dimConfig} />}
              {currentStepId === "ausfuehrung" && <StepAusfuehrung form={form} set={set} limits={limits} constr={constr} />}
              {currentStepId === "extras" && <StepExtras form={form} toggleExtra={toggleExtra} set={set} />}
              {currentStepId === "kontakt" && <StepKontakt form={form} set={set} errors={errors} />}
              {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} pricing={pricing} />}
            </div>
          </div>
        </div>
      </main>

      <nav className="wz-bottom-bar">
        <button className="wz-nav-btn wz-nav-btn--outline" onClick={wizardIndex === 0 ? () => setPhase("typen") : prev}>
          {wizardIndex === 0 ? "← Zurück" : "← Zurück"}
        </button>
        <div className="wz-dots">{activeSteps.map((_, i) => <div key={i} className="wz-dot" style={{ background: i <= wizardIndex ? "var(--wz-brand)" : "var(--wz-border)" }} />)}</div>
        {currentStepId !== "uebersicht"
          ? <button className="wz-nav-btn wz-nav-btn--solid" onClick={next}>Weiter →</button>
          : <button className="wz-nav-btn wz-nav-btn--solid" onClick={doSubmit}>Absenden ✓</button>}
      </nav>
    </div>
  );
}

/* ════════════════════════════════════════
   FLOW DIRECTION PICKER
   ════════════════════════════════════════ */
function FlowPicker({ flow, onChange }) {
  return (
    <div className="wz-flow-picker">
      {FLOWS.map((f) => (
        <button
          key={f.id}
          className="wz-flow-btn"
          onClick={(e) => { e.stopPropagation(); onChange(f.id); }}
          title={f.title}
          style={{
            background: flow === f.id ? "var(--wz-brand)" : "transparent",
            color: flow === f.id ? "var(--wz-white)" : "var(--wz-muted)",
            borderColor: flow === f.id ? "var(--wz-brand)" : "var(--wz-border)",
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   STEP COMPONENTS
   ════════════════════════════════════════ */
function StepHolzart({ form, set, errors, holzarten: woods }) {
  return (<div><StepHeader title="Welches Holz?" sub="Wählen Sie die Holzart für Ihre Garderobe." />
    <div className="wz-wood-grid">{woods.map((h) => { const on = form.holzart === h.value; return (
      <button key={h.value} className="wz-wood-card" onClick={() => set("holzart", h.value)} style={{ borderColor: errors.holzart && !form.holzart ? "var(--wz-error)" : on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-medium)" : "var(--wz-field-bg)" }}>
        <span style={{ fontSize: 28 }}>{h.emoji}</span><span className="wz-wood-label">{h.label}</span><span className="wz-wood-desc">{h.desc}</span>
        {on && <div className="wz-check-badge">✓</div>}
      </button>);})}</div>
    {errors.holzart && <p className="wz-error-text">Bitte wählen Sie eine Holzart.</p>}
  </div>);
}

function StepMasse({ form, set, errors, limits, constr, dimConfig }) {
  const w = parseInt(form.breite) || 0;
  const wValid = w >= limits.minW && w <= limits.maxW;
  const wWarn = w > 0 && !wValid;

  const renderDimInput = (dim) => {
    const cfg = dimConfig[dim.key];
    if (!cfg.enabled) return null;
    const min = dim.key === "breite" ? limits.minW : constr[dim.constrMin];
    const max = dim.key === "breite" ? limits.maxW : constr[dim.constrMax];
    const val = form[dim.key];
    const err = errors[dim.key];
    const filtered = cfg.presets.filter((v) => v >= min && v <= max);

    if (cfg.mode === "pills") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="wz-label">{dim.label} <span style={{ color: "var(--wz-error)" }}>*</span></label>
            <span style={{ fontSize: 11, color: "var(--wz-muted)" }}>{min}–{max} {dim.unit}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {filtered.map((p) => {
              const on = String(p) === String(val);
              return (
                <button key={p} className="wz-pill-btn" onClick={() => set(dim.key, String(p))}
                  style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand)" : "var(--wz-field-bg)", color: on ? "var(--wz-white)" : "var(--wz-text)", fontWeight: on ? 700 : 400 }}>
                  {p}
                </button>
              );
            })}
          </div>
          <input type="number" inputMode="numeric" min={min} max={max} placeholder={`oder Wunschmass (${dim.unit})`} value={filtered.some((p) => String(p) === String(val)) ? "" : val}
            onChange={(e) => set(dim.key, e.target.value)}
            className="wz-input" style={{ fontSize: 13, height: 36, borderColor: err ? "var(--wz-error)" : "var(--wz-border)" }} />
        </div>
      );
    }

    if (cfg.mode === "combo") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="wz-label">{dim.label} <span style={{ color: "var(--wz-error)" }}>*</span></label>
            <span style={{ fontSize: 11, color: "var(--wz-muted)" }}>{min}–{max} {dim.unit}</span>
          </div>
          <select className="wz-select" value={filtered.includes(parseInt(val)) ? val : "__custom"} onChange={(e) => { if (e.target.value !== "__custom") set(dim.key, e.target.value); }}
            style={{ borderColor: err ? "var(--wz-error)" : "var(--wz-border)" }}>
            {filtered.map((p) => <option key={p} value={String(p)}>{p} {dim.unit}</option>)}
            <option value="__custom">Anderes Mass…</option>
          </select>
          {(!filtered.includes(parseInt(val))) && (
            <input type="number" inputMode="numeric" min={min} max={max} placeholder={`Wunschmass (${dim.unit})`} value={val}
              onChange={(e) => set(dim.key, e.target.value)}
              className="wz-input" style={{ fontSize: 13, height: 36, marginTop: 6, borderColor: err ? "var(--wz-error)" : "var(--wz-border)" }} />
          )}
        </div>
      );
    }

    // text (Freitext)
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label className="wz-label">{dim.label} <span style={{ color: "var(--wz-error)" }}>*</span></label>
          <span style={{ fontSize: 11, color: "var(--wz-muted)" }}>{min}–{max} {dim.unit}</span>
        </div>
        <input type="number" inputMode="numeric" min={min} max={max} placeholder={dim.unit} value={val}
          onChange={(e) => set(dim.key, e.target.value)}
          className="wz-input" style={{ borderColor: err ? "var(--wz-error)" : "var(--wz-border)", fontSize: 18, height: 48, textAlign: "center", letterSpacing: ".04em" }} />
      </div>
    );
  };

  const enabledDims = DIM_FIELDS.filter((d) => dimConfig[d.key].enabled);
  return (<div><StepHeader title="Abmessungen" sub="Breite, Höhe und Tiefe in cm." />
    <div className="wz-dim-visual"><div className="wz-dim-box"><span style={{ fontSize: 11, color: "var(--wz-muted)", letterSpacing: ".06em" }}>{enabledDims.map((d) => form[d.key] || d.label[0]).join(" × ")} cm</span></div></div>

    {form.typ === "schriftzug" && limits.minWText > constr.MIN_W && (
      <div className="wz-constraint-hint" style={{ marginBottom: 12 }}>
        Min. {limits.minWText} cm Breite wegen {limits.letters} Buchstaben · Max. {limits.maxHooks} Haken bei {limits.clampedW} cm
      </div>
    )}

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {enabledDims.map((dim) => (
        <div key={dim.key}>{renderDimInput(dim)}</div>
      ))}
    </div>
    {wWarn && <p className="wz-error-text">{w < limits.minW ? `Mindestbreite ${limits.minW} cm` + (limits.minWText > constr.MIN_W ? ` (${limits.letters} Buchstaben × ${constr.LETTER_W} cm)` : "") : `Maximalbreite ${limits.maxW} cm`}</p>}
  </div>);
}

function StepAusfuehrung({ form, set, limits, constr }) {
  const hookOpts = limits.hookOptions.map((n) => ({ value: String(n), label: String(n) }));
  const currentHaken = parseInt(form.haken) || 0;
  if (currentHaken > limits.maxHooks && limits.maxHooks > 0) {
    setTimeout(() => set("haken", String(limits.maxHooks)), 0);
  }
  return (<div><StepHeader title="Ausführung" sub="Oberfläche, Haken & Hutablage." />
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SelectField label="Oberfläche" value={form.oberflaeche} onChange={(v) => set("oberflaeche", v)} options={oberflaechen} />
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SelectField label={`Haken (max. ${limits.maxHooks})`} value={form.haken} onChange={(v) => set("haken", v)} options={hookOpts} />
          <SelectField label="Material" value={form.hakenmaterial} onChange={(v) => set("hakenmaterial", v)} options={hakenMaterialien} />
        </div>
        <div className="wz-constraint-hint">
          Mindestabstand {constr.HOOK_SPACING} cm · {limits.clampedW} cm Breite → max. {limits.maxHooks} Haken
        </div>
      </div>
      <div><label className="wz-label">Hutablage</label><div style={{ display: "flex", gap: 10 }}>
        {[{ v: "ja", l: "Ja" }, { v: "nein", l: "Nein" }].map((o) => (
          <button key={o.v} className="wz-toggle-btn" onClick={() => set("hutablage", o.v)} style={{ borderColor: form.hutablage === o.v ? "var(--wz-brand)" : "var(--wz-border)", background: form.hutablage === o.v ? "var(--wz-brand-bg-medium)" : "var(--wz-field-bg)", color: form.hutablage === o.v ? "var(--wz-brand)" : "var(--wz-muted)", fontWeight: form.hutablage === o.v ? 700 : 400 }}>{o.l}</button>
        ))}</div></div>
    </div>
  </div>);
}

function StepExtras({ form, toggleExtra, set }) {
  return (<div><StepHeader title="Extras & Wünsche" sub="Zusätzliche Ausstattung und Bemerkungen." />
    <div className="wz-extras-grid">{extrasOptions.map((ex) => { const on = form.extras.includes(ex.value); return (
      <button key={ex.value} className="wz-extra-card" onClick={() => toggleExtra(ex.value)} style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-medium)" : "var(--wz-field-bg)" }}>
        <span style={{ fontSize: 22 }}>{ex.icon}</span><span style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--wz-brand)" : "var(--wz-text)" }}>{ex.label}</span>
        {on && <div className="wz-mini-check">✓</div>}
      </button>);})}</div>
    <div style={{ marginTop: 20 }}><label className="wz-label">Bemerkungen (optional)</label>
      <textarea className="wz-textarea" placeholder="Z.B. spezielle Farbe, Gravur …" value={form.bemerkungen} onChange={(e) => set("bemerkungen", e.target.value)} /></div>
  </div>);
}

function StepKontakt({ form, set, errors }) {
  return (<div><StepHeader title="Kontaktdaten" sub="Damit wir Ihnen die Offerte zusenden können." />
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SelectField label="Anrede" value={form.anrede} onChange={(v) => set("anrede", v)} options={[{ value: "", label: "Bitte wählen" }, { value: "herr", label: "Herr" }, { value: "frau", label: "Frau" }, { value: "divers", label: "Divers" }]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextField label="Vorname" req placeholder="Max" value={form.vorname} onChange={(v) => set("vorname", v)} error={errors.vorname} />
        <TextField label="Nachname" req placeholder="Muster" value={form.nachname} onChange={(v) => set("nachname", v)} error={errors.nachname} />
      </div>
      <TextField label="E-Mail" req placeholder="max@beispiel.ch" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
      <TextField label="Telefon" placeholder="+41 79 000 00 00" type="tel" value={form.telefon} onChange={(v) => set("telefon", v)} />
      <TextField label="Strasse & Nr." placeholder="Musterstrasse 12" value={form.strasse} onChange={(v) => set("strasse", v)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <TextField label="PLZ" req placeholder="8000" value={form.plz} onChange={(v) => set("plz", v)} error={errors.plz} />
        <TextField label="Ort" req placeholder="Zürich" value={form.ort} onChange={(v) => set("ort", v)} error={errors.ort} />
      </div>
    </div>
  </div>);
}

function StepUebersicht({ form, set, errors, skippedSteps, pricing }) {
  const wood = holzarten.find((h) => h.value === form.holzart);
  const ofl = oberflaechen.find((o) => o.value === form.oberflaeche);
  const hm = hakenMaterialien.find((h) => h.value === form.hakenmaterial);
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typVal = form.typ === "schriftzug" ? `✏️ „${form.schriftzug}"` : `⛰️ ${bergObj?.label || "–"}`;
  return (<div><StepHeader title="Zusammenfassung" sub="Prüfen Sie Ihre Angaben." />
    <div className="wz-summary-section">
      <SummaryRow label="Typ" value={typVal} />
      {form.typ === "schriftzug" && fontObj && <SummaryRow label="Schriftart" value={fontObj.label} />}
      <SummaryRow label="Holzart" value={wood ? `${wood.emoji} ${wood.label}` : "–"} />
      <SummaryRow label="Masse" value={`${form.breite} × ${form.hoehe} × ${form.tiefe} cm`} />
      <SummaryRow label="Oberfläche" value={ofl?.label || "–"} />
      <SummaryRow label="Haken" value={`${form.haken}× ${hm?.label || ""}`} />
      <SummaryRow label="Hutablage" value={form.hutablage === "ja" ? "Ja" : "Nein"} />
      {form.extras.length > 0 && <SummaryRow label="Extras" value={form.extras.map((v) => extrasOptions.find((e) => e.value === v)?.label).join(", ")} />}
      {form.bemerkungen && <SummaryRow label="Bemerkungen" value={form.bemerkungen} />}
    </div>
    {skippedSteps.length > 0 && (<div className="wz-defaults-bar">
      <span className="wz-section-label" style={{ letterSpacing: ".06em" }}>Standardwerte:</span>
      {skippedSteps.map((s) => <span key={s.id} className="wz-default-chip">{s.icon} {s.defaultLabel}</span>)}
    </div>)}
    <div className="wz-summary-section" style={{ marginTop: 14 }}>
      <SummaryRow label="Name" value={`${form.anrede ? form.anrede.charAt(0).toUpperCase() + form.anrede.slice(1) + " " : ""}${form.vorname} ${form.nachname}`} />
      <SummaryRow label="E-Mail" value={form.email} />
      {form.telefon && <SummaryRow label="Telefon" value={form.telefon} />}
      {form.strasse ? <SummaryRow label="Adresse" value={`${form.strasse}, ${form.plz} ${form.ort}`} /> : <SummaryRow label="Ort" value={`${form.plz} ${form.ort}`} />}
    </div>
    <div className="wz-info-box"><p style={{ fontSize: 12, color: "var(--wz-muted)", lineHeight: 1.55, margin: 0 }}>Unverbindliche Offerte inkl. Visualisierung. Lieferzeit: 4–8 Wochen. Montage schweizweit.</p></div>
    {pricing && (() => {
      const price = computePrice(form, pricing);
      const fmt = (n) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
      return (
        <div className="wz-price-box">
          <div className="wz-section-label" style={{ marginBottom: 6 }}>Richtpreis</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--wz-brand)", letterSpacing: ".02em" }}>ab CHF {fmt(price.customerPrice)}.–</div>
          <div style={{ fontSize: 10, color: "var(--wz-muted)", marginTop: 4 }}>Unverbindlich · Endpreis gemäss Offerte</div>
        </div>
      );
    })()}
    <label className="wz-check-item" style={{ marginTop: 16 }}>
      <input type="checkbox" checked={form.datenschutz} onChange={(e) => set("datenschutz", e.target.checked)} className="wz-checkbox" style={{ accentColor: errors.datenschutz ? "var(--wz-error)" : "var(--wz-brand)" }} />
      <span style={{ fontSize: 13 }}>Ich akzeptiere die <a href="/datenschutz" style={{ color: "var(--wz-brand)", textDecoration: "underline" }}>Datenschutzerklärung</a><span style={{ color: "var(--wz-error)", marginLeft: 3 }}>*</span></span>
    </label>
    {errors.datenschutz && <p className="wz-error-text">Bitte akzeptieren Sie die Datenschutzerklärung.</p>}
  </div>);
}

function AdminHeader({ mode, onModeChange }) {
  const modes = [
    { id: "admin", label: "Admin", icon: "\u2699\uFE0F" },
    { id: "preview", label: "Vorschau", icon: "\uD83D\uDC41" },
    { id: "workflow", label: "Kunde", icon: "\uD83D\uDED2" },
  ];
  return (
    <header className="wz-admin-header">
      <div className="wz-admin-header-inner">
        <div className="wz-brand-row">
          <div className="wz-brand-mark" />
          <span className="wz-brand-name">Holzschneiderei</span>
        </div>
        <div className="wz-mode-switcher">
          {modes.map((m) => (
            <button
              key={m.id}
              className="wz-mode-btn"
              onClick={() => onModeChange(m.id)}
              style={{
                background: mode === m.id ? "var(--wz-brand)" : "transparent",
                color: mode === m.id ? "var(--wz-white)" : "var(--wz-muted)",
                borderColor: mode === m.id ? "var(--wz-brand)" : "var(--wz-border)",
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

function AdminTypeDefaults({ form, set, constr, limits, enabledSchriftarten, toggleSchriftart, enabledBerge, toggleBerg, bergDisplay }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label className="wz-label">Standard-Typ</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["schriftzug", "bergmotiv"].map((typ) => (
            <button key={typ} onClick={() => set("typ", typ)}
              style={{ flex: 1, borderColor: form.typ === typ ? "var(--wz-brand)" : "var(--wz-border)", background: form.typ === typ ? "var(--wz-brand-bg-medium)" : "var(--wz-field-bg)", color: form.typ === typ ? "var(--wz-brand)" : "var(--wz-muted)", fontWeight: form.typ === typ ? 700 : 400 }}>
              {typ === "schriftzug" ? "✏️ Schriftzug" : "⛰️ Bergmotiv"}
            </button>
          ))}
        </div>
      </div>
      {form.typ === "schriftzug" && (
        <div className="wz-sub-section">
          <label className="wz-label">Standard-Schriftzug</label>
          <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller …" value={form.schriftzug} onChange={(e) => set("schriftzug", e.target.value)}
            className="wz-input" style={{ fontSize: 16, height: 50, textAlign: "center", letterSpacing: ".06em", fontWeight: 600, borderColor: limits.textTooLong ? "var(--wz-error)" : "var(--wz-border)" }} />
          <div style={{ fontSize: 11, color: limits.textTooLong ? "var(--wz-error)" : "var(--wz-muted)", marginTop: 6, textAlign: "center" }}>
            {limits.textTooLong
              ? `Zu lang für ${constr.MAX_W} cm Breite – max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)`
              : `${limits.letters} / ${limits.maxLetters} Buchstaben · Breite min. ${limits.minW} cm`}
          </div>

          <div style={{ marginTop: 20 }}>
            <label className="wz-label">Standard-Schriftart</label>
            <div style={{ fontSize: 11, color: "var(--wz-muted)", marginBottom: 8 }}>{Object.values(enabledSchriftarten).filter(Boolean).length} von {schriftarten.length} für Kunden sichtbar</div>
            <div className="wz-font-list">
              {schriftarten.map((f) => {
                const on = form.schriftart === f.value;
                const enabled = enabledSchriftarten[f.value];
                const isLastEnabled = Object.values(enabledSchriftarten).filter(Boolean).length === 1 && enabled;
                return (
                  <div key={f.value} style={{ position: "relative", opacity: enabled ? 1 : 0.4, transition: "opacity .2s" }}>
                    <button onClick={() => set("schriftart", f.value)}
                      className="wz-font-row" style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)", width: "100%" }}>
                      {on && <div className="wz-font-check">✓</div>}
                      <span style={{ fontSize: 24, fontFamily: f.family, fontWeight: f.weight, color: on ? "var(--wz-brand)" : "var(--wz-text)", lineHeight: 1.1, letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {form.schriftzug || "Beispiel"}
                      </span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleSchriftart(f.value); }}
                      title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
                      style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${enabled ? "var(--wz-brand)" : "var(--wz-border)"}`, background: enabled ? "var(--wz-brand-bg-strong)" : "var(--wz-muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLastEnabled ? "not-allowed" : "pointer", fontSize: 14, padding: 0, fontFamily: "inherit" }}>
                      {enabled ? "👁" : "🚫"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {form.schriftzug && form.schriftart && (() => {
            const font = schriftarten.find((f) => f.value === form.schriftart);
            return (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>Live-Vorschau</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg viewBox="0 0 320 160" style={{ width: "100%", maxWidth: 380, height: "auto" }}>
                    <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />
                    {[45, 95, 145, 195, 245, 275].map((x, i) => (
                      <g key={i}>
                        <line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" />
                        <circle cx={x} cy="120" r="2.5" fill={t.border} />
                      </g>
                    ))}
                    <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />
                    <text x="160" y="52" textAnchor="middle"
                      fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                      fill="none" stroke={t.brand} strokeWidth="1.2"
                      letterSpacing=".06em" opacity="0.85">
                      {form.schriftzug.toUpperCase()}
                    </text>
                    <text x="160" y="52" textAnchor="middle"
                      fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                      fill={t.brand} opacity="0.08"
                      letterSpacing=".06em">
                      {form.schriftzug.toUpperCase()}
                    </text>
                    <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" />
                    <line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" />
                    <line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />
                    <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
                  </svg>
                </div>
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "var(--wz-muted)" }}>
                  Schrift: {font.label} · Die Kontur wird aus Holz gefräst
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {form.typ === "bergmotiv" && (
        <div>
          <label className="wz-label">Standard-Berg</label>
          <div style={{ fontSize: 11, color: "var(--wz-muted)", marginBottom: 8 }}>{Object.values(enabledBerge).filter(Boolean).length} von {berge.length} für Kunden sichtbar</div>
          <div className="wz-berg-grid">{berge.map((b) => { const on = form.berg === b.value; const enabled = enabledBerge[b.value]; const isLastEnabled = Object.values(enabledBerge).filter(Boolean).length === 1 && enabled; const lf = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null; return (
            <div key={b.value} style={{ position: "relative", opacity: enabled ? 1 : 0.4, transition: "opacity .2s" }}>
              <button className="wz-berg-card" onClick={() => set("berg", b.value)} style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-light)" : "var(--wz-field-bg)", width: "100%" }}>
                {on && <div className="wz-berg-checkmark">✓</div>}
                <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
                  <path d={b.path} fill={bergDisplay.mode === "clean" ? "none" : (on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)")} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <span style={{ fontSize: 12, fontWeight: 700, color: on ? "var(--wz-brand)" : "var(--wz-text)", fontFamily: lf?.family || "inherit" }}>{b.label}</span>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && <span style={{ fontSize: 10, color: "var(--wz-muted)" }}>{[bergDisplay.showHeight && b.hoehe, bergDisplay.showRegion && b.region].filter(Boolean).join(" · ")}</span>}
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (!isLastEnabled) toggleBerg(b.value); }}
                title={enabled ? "Für Kunden ausblenden" : "Für Kunden einblenden"}
                style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, border: `1.5px solid ${enabled ? "var(--wz-brand)" : "var(--wz-border)"}`, background: enabled ? "var(--wz-brand-bg-strong)" : "var(--wz-muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLastEnabled ? "not-allowed" : "pointer", fontSize: 12, padding: 0, fontFamily: "inherit", zIndex: 2 }}>
                {enabled ? "👁" : "🚫"}
              </button>
            </div>
          );})}</div>
        </div>
      )}
    </div>
  );
}

function AdminBergDisplay({ bergDisplay, setBergDisp }) {
  const sampleBerg = berge[0];
  const labelFont = bergDisplay.labelFont ? schriftarten.find((f) => f.value === bergDisplay.labelFont) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label className="wz-label">Darstellungsmodus</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ value: "relief", label: "Relief (gefüllt)" }, { value: "clean", label: "Clean (Kontur)" }].map((m) => (
            <button key={m.value} onClick={() => setBergDisp("mode", m.value)}
              className="wz-toggle-btn" style={{ flex: 1, borderColor: bergDisplay.mode === m.value ? "var(--wz-brand)" : "var(--wz-border)", background: bergDisplay.mode === m.value ? "var(--wz-brand-bg-medium)" : "var(--wz-field-bg)", color: bergDisplay.mode === m.value ? "var(--wz-brand)" : "var(--wz-muted)", fontWeight: bergDisplay.mode === m.value ? 700 : 400 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Vorschau</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {["relief", "clean"].map((mode) => {
            const active = bergDisplay.mode === mode;
            return (
              <div key={mode} onClick={() => setBergDisp("mode", mode)} style={{ flex: 1, maxWidth: 160, padding: 10, border: `1.5px solid ${active ? "var(--wz-brand)" : "var(--wz-border)"}`, borderRadius: 3, background: active ? "var(--wz-brand-bg-subtle)" : "var(--wz-field-bg)", textAlign: "center", transition: "all .2s", cursor: "pointer" }}>
                <svg viewBox="0 0 100 70" style={{ width: "100%", height: 50 }} preserveAspectRatio="none">
                  <path d={sampleBerg.path}
                    fill={mode === "relief" ? (active ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)") : "none"}
                    stroke={active ? t.brand : t.muted}
                    strokeWidth={active ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {bergDisplay.showName && <div style={{ fontSize: 11, fontWeight: 700, color: active ? "var(--wz-brand)" : "var(--wz-text)", fontFamily: labelFont?.family || "inherit" }}>{sampleBerg.label}</div>}
                {(bergDisplay.showHeight || bergDisplay.showRegion) && (
                  <div style={{ fontSize: 9, color: "var(--wz-muted)" }}>
                    {[bergDisplay.showHeight && sampleBerg.hoehe, bergDisplay.showRegion && sampleBerg.region].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ fontSize: 9, color: "var(--wz-muted)", marginTop: 4, fontStyle: "italic" }}>{mode === "relief" ? "Relief" : "Clean"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="wz-label">Sichtbare Labels</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ key: "showName", label: "Bergname" }, { key: "showHeight", label: "Höhe" }, { key: "showRegion", label: "Region" }].map((item) => {
            const on = bergDisplay[item.key];
            return (
              <button key={item.key} onClick={() => setBergDisp(item.key, !on)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: `1.5px solid ${on ? "var(--wz-brand)" : "var(--wz-border)"}`, borderRadius: 3, background: on ? "var(--wz-brand-bg-accent)" : "var(--wz-field-bg)", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${on ? "var(--wz-brand)" : "var(--wz-border)"}`, background: on ? "var(--wz-brand)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                  {on && <span style={{ color: "var(--wz-white)", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--wz-text)" : "var(--wz-muted)" }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="wz-label">Label-Schriftart</label>
        <select value={bergDisplay.labelFont} onChange={(e) => setBergDisp("labelFont", e.target.value)} className="wz-select">
          <option value="">System (Standard)</option>
          {schriftarten.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        {bergDisplay.labelFont && labelFont && (
          <div style={{ marginTop: 8, padding: "8px 12px", border: "1px solid var(--wz-border)", borderRadius: 3, background: "var(--wz-field-bg)", textAlign: "center" }}>
            <span style={{ fontSize: 18, fontFamily: labelFont.family, fontWeight: labelFont.weight, color: "var(--wz-text)" }}>{sampleBerg.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminConstraints({ constr, setConstrVal, limits }) {
  return (
    <div>
      <div className="wz-constraint-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
        {[
          { k: "MIN_W", l: "Min. Breite (cm)" }, { k: "MAX_W", l: "Max. Breite (cm)" },
          { k: "MIN_H", l: "Min. Höhe (cm)" }, { k: "MAX_H", l: "Max. Höhe (cm)" },
          { k: "MIN_D", l: "Min. Tiefe (cm)" }, { k: "MAX_D", l: "Max. Tiefe (cm)" },
          { k: "HOOK_SPACING", l: "Haken-Abstand (cm)" }, { k: "EDGE_MARGIN", l: "Randabstand (cm)" },
          { k: "LETTER_W", l: "Breite/Buchstabe (cm)" }, { k: "LETTER_MARGIN", l: "Schrift-Rand (cm)" },
        ].map(({ k, l }) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--wz-muted)", flex: 1, minWidth: 0 }}>{l}</span>
            <input type="number" value={constr[k]} onChange={(e) => setConstrVal(k, e.target.value)}
              className="wz-input" style={{ width: 52, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "var(--wz-muted)", marginBottom: 4 }}>Haken-Verteilung:</div>
        {[limits.minW, Math.round((limits.minW + limits.maxW) / 2), limits.maxW].filter((w, i, a) => a.indexOf(w) === i).map((w) => {
          const mh = limits.hooksFor(w);
          const pct = (n) => constr.EDGE_MARGIN / w * 100 + (n * (constr.HOOK_SPACING / w * 100));
          return (
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--wz-muted)", width: 40, textAlign: "right", flexShrink: 0 }}>{w} cm</span>
              <div style={{ flex: 1, height: 16, background: "rgba(31,59,49,.05)", border: "1px solid var(--wz-border)", borderRadius: 2, position: "relative" }}>
                {Array.from({ length: mh }).map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: `${pct(i)}%`, top: 2, width: 2, height: 12, background: "var(--wz-brand)", borderRadius: 1, opacity: 0.7 }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: "var(--wz-brand)", fontWeight: 700, width: 24, flexShrink: 0 }}>{mh}x</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminWoodSelection({ enabledHolzarten, toggleHolz, activeCount }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {holzarten.map((h) => {
        const on = enabledHolzarten[h.value];
        const isLast = activeCount === 1 && on;
        return (
          <button key={h.value} onClick={() => !isLast && toggleHolz(h.value)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${on ? "var(--wz-brand)" : "var(--wz-border)"}`, borderRadius: 3, background: on ? "var(--wz-brand-bg-accent)" : "var(--wz-field-bg)", cursor: isLast ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s", opacity: isLast ? 0.7 : 1 }}>
            <div style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${on ? "var(--wz-brand)" : "var(--wz-border)"}`, background: on ? "var(--wz-brand)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
              {on && <span style={{ color: "var(--wz-white)", fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{h.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: on ? "var(--wz-text)" : "var(--wz-muted)" }}>{h.label}</span>
              <span style={{ fontSize: 11, color: "var(--wz-muted)", marginLeft: 6 }}>{h.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AdminDimensions({ constr, dimConfig, setDim, addPreset, removePreset }) {
  return (
    <div>
      {DIM_FIELDS.map((dim) => {
        const cfg = dimConfig[dim.key];
        const min = constr[dim.constrMin];
        const max = constr[dim.constrMax];
        return (
          <div key={dim.key} style={{ padding: "12px 0", borderTop: "1px solid var(--wz-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setDim(dim.key, "enabled", !cfg.enabled)}
                  className="wz-mini-toggle" style={{ background: cfg.enabled ? "var(--wz-brand)" : "var(--wz-border)" }}>
                  <div className="wz-mini-toggle-thumb" style={{ transform: cfg.enabled ? "translateX(14px)" : "translateX(0)" }} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 700, color: cfg.enabled ? "var(--wz-text)" : "var(--wz-muted)" }}>{dim.label}</span>
                <span style={{ fontSize: 10, color: "var(--wz-muted)" }}>{min}–{max} {dim.unit}</span>
              </div>
              {cfg.enabled && (
                <div style={{ display: "flex", gap: 2, background: "var(--wz-field-bg)", border: "1px solid var(--wz-border)", borderRadius: 3, padding: 2 }}>
                  {DIM_MODES.map((m) => (
                    <button key={m.value} onClick={() => setDim(dim.key, "mode", m.value)}
                      style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, border: "1px solid", borderColor: cfg.mode === m.value ? "var(--wz-brand)" : "transparent", borderRadius: 2, background: cfg.mode === m.value ? "var(--wz-brand)" : "transparent", color: cfg.mode === m.value ? "var(--wz-white)" : "var(--wz-muted)", cursor: "pointer", fontFamily: "inherit" }}>
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
                    <span key={p} className="wz-preset-pill">{p}<button onClick={() => removePreset(dim.key, p)} className="wz-preset-remove">×</button></span>
                  ))}
                  {cfg.presets.filter((v) => v < min || v > max).map((p) => (
                    <span key={p} className="wz-preset-pill" style={{ opacity: 0.4, textDecoration: "line-through" }}>{p}<button onClick={() => removePreset(dim.key, p)} className="wz-preset-remove">×</button></span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" placeholder="Wert hinzufügen" id={`add-${dim.key}`}
                    className="wz-input" style={{ fontSize: 11, height: 28, flex: 1, padding: "0 8px" }}
                    onKeyDown={(e) => { if (e.key === "Enter") { addPreset(dim.key, e.target.value); e.target.value = ""; } }} />
                  <button onClick={() => { const el = document.getElementById(`add-${dim.key}`); addPreset(dim.key, el.value); el.value = ""; }}
                    className="wz-nav-btn wz-nav-btn--outline" style={{ height: 28, padding: "0 10px", fontSize: 10 }}>+</button>
                </div>
              </div>
            )}
            {cfg.enabled && cfg.mode === "text" && (
              <div style={{ fontSize: 10, color: "var(--wz-muted)", fontStyle: "italic" }}>Freitext-Eingabe ({min}–{max} {dim.unit})</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdminSteps({ enabledSteps, toggleStep, stepOrder }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {OPTIONAL_STEPS.map((s) => {
          const on = enabledSteps[s.id];
          const locked = s.required;
          return (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              className="wz-config-card" style={{ borderColor: on ? "var(--wz-brand)" : "var(--wz-border)", background: on ? "var(--wz-brand-bg-accent)" : "var(--wz-field-bg)" }}>
              <div className="wz-config-card-left">
                <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wz-text)" }}>{s.label}</span>
                    {locked && <span className="wz-pflicht-badge">Pflicht</span>}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--wz-muted)", lineHeight: 1.35 }}>{s.desc}</span>
                  {!on && !locked && <div className="wz-default-hint">Standard: {s.defaultLabel}</div>}
                </div>
              </div>
              <div className="wz-toggle" style={{ background: locked ? "var(--wz-brand)" : on ? "var(--wz-brand)" : "var(--wz-border)", justifyContent: on || locked ? "flex-end" : "flex-start", opacity: locked ? .6 : 1 }}>
                <div className="wz-toggle-thumb" />
              </div>
            </button>
          );
        })}
      </div>
      <div className="wz-pipeline-box">
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
          Ablauf — {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).length} Schritte
        </div>
        <div className="wz-pipeline">
          {stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)).map((id, i, arr) => {
            const o = OPTIONAL_STEPS.find((x) => x.id === id);
            const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden";
            const ic = o?.icon || (id === "kontakt" ? "📋" : "✓");
            return (
              <div key={id} style={{ display: "flex", alignItems: "center" }}>
                <div className="wz-pipe-chip">
                  <span style={{ fontSize: 13 }}>{ic}</span>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{lb}</span>
                </div>
                {i < arr.length - 1 && <span style={{ color: "var(--wz-border)", margin: "0 3px", fontSize: 13 }}>›</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
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
                  display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "var(--wz-brand-bg-light)", borderRadius: 2,
                  cursor: isFixed ? "default" : "grab",
                  opacity: dragIdx === i ? 0.4 : 1,
                  outline: overIdx === i ? "2px solid var(--wz-brand)" : "none",
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
                    style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--wz-muted)", fontFamily: "inherit", padding: "0 2px" }}
                  >
                    ×
                  </button>
                )}
              </div>
              {i < visibleSteps.length - 1 && <span style={{ color: "var(--wz-border)", margin: "0 3px", fontSize: 13 }}>›</span>}
            </div>
          );
        })}
      </div>
      {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 10, color: "var(--wz-muted)", alignSelf: "center" }}>Deaktiviert:</span>
          {OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id] && !s.required).map((s) => (
            <button key={s.id} onClick={() => toggleStep(s.id)}
              className="wz-pipe-chip" style={{ opacity: 0.5, cursor: "pointer", border: "1px dashed var(--wz-border)", background: "transparent" }}>
              <span style={{ fontSize: 11 }}>{s.icon}</span>
              <span style={{ fontSize: 10 }}>+ {s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="wz-phone-frame">
      <div className="wz-phone-notch">
        <div className="wz-phone-notch-bar" />
      </div>
      <div className="wz-phone-content">
        {children}
      </div>
    </div>
  );
}

function FinancialSummary({ form, pricing }) {
  const price = computePrice(form, pricing);
  const fmt = (n) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const wood = holzarten.find((h) => h.value === form.holzart);
  return (
    <div className="wz-feature-card" style={{ borderColor: "var(--wz-brand)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>💰</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wz-text)" }}>Kalkulation</div>
          <div style={{ fontSize: 11, color: "var(--wz-muted)" }}>Echtzeitberechnung auf Basis der Konfiguration</div>
        </div>
      </div>
      <div className="wz-summary-section">
        <SummaryRow label="Fläche" value={`${price.surfaceM2.toFixed(3)} m²`} />
        <SummaryRow label={`Material (${wood?.label || "–"} @ ${pricing.woodCosts[form.holzart] || 0} CHF/m²)`} value={`CHF ${fmt(price.materialCost)}`} />
        <SummaryRow label={`Arbeit (${price.estimatedHours.toFixed(1)}h @ ${pricing.labourRate} CHF/h)`} value={`CHF ${fmt(price.labourCost)}`} />
        {price.extrasCost > 0 && <SummaryRow label="Extras" value={`CHF ${fmt(price.extrasCost)}`} />}
        <div className="wz-summary-row" style={{ borderTop: "1px solid var(--wz-border)", paddingTop: 10, marginTop: 4 }}>
          <span className="wz-summary-label" style={{ color: "var(--wz-text)" }}>Herstellkosten</span>
          <span className="wz-summary-value" style={{ fontWeight: 700 }}>CHF {fmt(price.productionCost)}</span>
        </div>
        <div className="wz-summary-row">
          <span className="wz-summary-label">Marge ({pricing.margin}x)</span>
          <span className="wz-summary-value">+{Math.round((pricing.margin - 1) * 100)}%</span>
        </div>
        <div className="wz-summary-row" style={{ background: "var(--wz-brand-bg-light)", borderRadius: 3, padding: "12px 16px" }}>
          <span className="wz-summary-label" style={{ fontSize: 13, color: "var(--wz-brand)" }}>Kundenpreis</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--wz-brand)" }}>CHF {fmt(price.customerPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function AdminPricing({ pricing, setPricing }) {
  const setField = (key, val) => setPricing((p) => ({ ...p, [key]: parseFloat(val) || 0 }));
  const setWoodCost = (wood, val) => setPricing((p) => ({ ...p, woodCosts: { ...p.woodCosts, [wood]: parseFloat(val) || 0 } }));
  const setExtraCost = (extra, val) => setPricing((p) => ({ ...p, extrasCosts: { ...p.extrasCosts, [extra]: parseFloat(val) || 0 } }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Materialkosten (CHF/m²)</div>
        <div className="wz-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {holzarten.map((h) => (
            <div key={h.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{h.emoji}</span>
              <span style={{ fontSize: 11, color: "var(--wz-muted)", flex: 1 }}>{h.label}</span>
              <input type="number" value={pricing.woodCosts[h.value] || 0} onChange={(e) => setWoodCost(h.value, e.target.value)}
                className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Arbeitskosten</div>
        <div className="wz-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--wz-muted)", flex: 1 }}>Stundenansatz (CHF)</span>
            <input type="number" value={pricing.labourRate} onChange={(e) => setField("labourRate", e.target.value)}
              className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--wz-muted)", flex: 1 }}>Basis-Stunden</span>
            <input type="number" value={pricing.hoursBase} onChange={(e) => setField("hoursBase", e.target.value)}
              className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--wz-muted)", flex: 1 }}>Std/m² (zusätzlich)</span>
            <input type="number" step="0.1" value={pricing.hoursPerM2} onChange={(e) => setField("hoursPerM2", e.target.value)}
              className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Extras-Preise (CHF)</div>
        <div className="wz-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {extrasOptions.map((ex) => (
            <div key={ex.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{ex.icon}</span>
              <span style={{ fontSize: 11, color: "var(--wz-muted)", flex: 1 }}>{ex.label}</span>
              <input type="number" value={pricing.extrasCosts[ex.value] || 0} onChange={(e) => setExtraCost(ex.value, e.target.value)}
                className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wz-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Marge</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--wz-muted)" }}>Faktor:</span>
          <input type="number" step="0.1" value={pricing.margin} onChange={(e) => setField("margin", e.target.value)}
            className="wz-input" style={{ width: 60, height: 26, fontSize: 11, textAlign: "center", padding: "0 4px" }} />
          <span style={{ fontSize: 11, color: "var(--wz-muted)" }}>= {Math.round((pricing.margin - 1) * 100)}% Aufschlag</span>
        </div>
      </div>
    </div>
  );
}

function AdminImportExport({ onExport, onImport }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button className="wz-nav-btn wz-nav-btn--outline" onClick={onExport} style={{ flex: 1, height: 36, fontSize: 11 }}>↓ Exportieren</button>
      <button className="wz-nav-btn wz-nav-btn--outline" onClick={onImport} style={{ flex: 1, height: 36, fontSize: 11 }}>↑ Importieren</button>
    </div>
  );
}

function CollapsibleSection({ id, title, summary, icon, open, onToggle, children }) {
  return (
    <div className="wz-feature-card" style={{ marginBottom: 10 }}>
      <button className="wz-collapse-header" onClick={() => onToggle(id)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wz-text)" }}>{title}</div>
            {!open && summary && <div style={{ fontSize: 11, color: "var(--wz-muted)", marginTop: 2 }}>{summary}</div>}
          </div>
        </div>
        <span style={{ fontSize: 14, color: "var(--wz-muted)", transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {open && <div style={{ padding: "12px 0 0" }}>{children}</div>}
    </div>
  );
}

/* ════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════ */
function Shell({ r, children }) {
  return (<div className="wz-shell" ref={r}>
    {children}
  </div>);
}
function Fade({ children }) { return <div style={{ animation: "fadeUp .35s ease" }}>{children}</div>; }
function StepHeader({ title, sub }) { return <div style={{ marginBottom: 24 }}><h2 className="wz-step-title">{title}</h2>{sub && <p className="wz-step-sub">{sub}</p>}</div>; }
function TextField({ label, req, error, value, onChange, placeholder, type = "text" }) {
  return (<div><label className="wz-label">{label}{req && <span style={{ color: "var(--wz-error)", marginLeft: 3 }}>*</span>}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="wz-input" style={{ borderColor: error ? "var(--wz-error)" : "var(--wz-border)" }} /></div>);
}
function NumField({ label, hint, value, onChange, error }) {
  return (<div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><label className="wz-label">{label} <span style={{ color: "var(--wz-error)" }}>*</span></label><span style={{ fontSize: 11, color: "var(--wz-muted)" }}>{hint}</span></div>
    <input type="number" inputMode="numeric" placeholder="cm" value={value} onChange={(e) => onChange(e.target.value)} className="wz-input" style={{ borderColor: error ? "var(--wz-error)" : "var(--wz-border)", fontSize: 18, height: 48, textAlign: "center", letterSpacing: ".04em" }} /></div>);
}
function SelectField({ label, value, onChange, options }) {
  return (<div><label className="wz-label">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="wz-select">{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);
}
function SummaryRow({ label, value }) { return <div className="wz-summary-row"><span className="wz-summary-label">{label}</span><span className="wz-summary-value">{value}</span></div>; }
function SideRail({ steps, stepData, currentIndex, onNavigate, onBack, onSubmit, isFirst, isLast }) {
  return (
    <nav className="wz-side-rail">
      <div className="wz-section-label" style={{ padding: "0 16px 12px", borderBottom: "1px solid var(--wz-border)" }}>Schritte</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "8px 0" }}>
        {steps.map((id, i) => {
          const step = stepData.find((s) => s.id === id);
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const label = step ? step.label : (id === "kontakt" ? "Kontakt" : "Übersicht");
          const icon = step ? step.icon : (id === "kontakt" ? "📇" : "📋");
          return (
            <button key={id} onClick={() => onNavigate(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: isCurrent ? "var(--wz-brand-bg-light)" : "transparent", border: "none", borderLeft: `3px solid ${isCurrent ? "var(--wz-brand)" : "transparent"}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s", width: "100%" }}>
              <span style={{ fontSize: 16, opacity: isPast ? 0.5 : 1 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "var(--wz-brand)" : isPast ? "var(--wz-muted)" : "var(--wz-text)", letterSpacing: ".02em" }}>{label}</div>
              </div>
              {isPast && <span style={{ fontSize: 11, color: "var(--wz-brand)" }}>✓</span>}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px 0", borderTop: "1px solid var(--wz-border)", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <button className="wz-nav-btn wz-nav-btn--outline" onClick={onBack} style={{ width: "100%", height: 36, fontSize: 11 }}>
          {isFirst ? "← Typ ändern" : "← Zurück"}
        </button>
        <button className="wz-nav-btn wz-nav-btn--solid" onClick={isLast ? onSubmit : () => onNavigate(currentIndex + 1)} style={{ width: "100%", height: 36, fontSize: 11 }}>
          {isLast ? "Absenden ✓" : "Weiter →"}
        </button>
      </div>
    </nav>
  );
}

