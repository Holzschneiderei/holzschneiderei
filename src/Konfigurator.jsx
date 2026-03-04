import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";

/* ── Brand tokens ── */
const t = {
  bg: "#f3f1ea", text: "#1f2a23", muted: "#5b615b", brand: "#1f3b31",
  border: "#c8c5bb", accent: "#3a6b54", error: "#a03030", fieldBg: "#faf9f6", white: "#ffffff",
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

  // Import / Export
  const exportParams = () => {
    const data = { version: 1, constr, dimConfig, enabledHolzarten, enabledSteps };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "garderobe-parameter.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.constr) setConstr(data.constr);
        if (data.dimConfig) setDimConfig(data.dimConfig);
        if (data.enabledHolzarten) setEnabledHolzarten(data.enabledHolzarten);
        if (data.enabledSteps) setEnabledSteps(data.enabledSteps);
      } catch { /* ignore bad files */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const importParams = () => fileInputRef.current?.click();
  const [shake, setShake] = useState(false);
  const [flow, setFlow] = useState("ltr");
  const [navDir, setNavDir] = useState(1); // 1=forward, -1=back
  const [animKey, setAnimKey] = useState(0);
  const shellRef = useRef(null);
  const fileInputRef = useRef(null);
  const presetInputRefs = useRef({});

  // Constraint engine – recomputes on every relevant form change
  const limits = useMemo(() => computeLimits(form, constr), [form, constr]);

  const activeSteps = useMemo(() => {
    const opt = OPTIONAL_STEPS.filter((s) => enabledSteps[s.id]).map((s) => s.id);
    return [...opt, ...FIXED_STEP_IDS];
  }, [enabledSteps]);
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
      if (!form.vorname.trim()) e.vorname = true;
      if (!form.nachname.trim()) e.nachname = true;
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = true;
      if (!form.plz.trim()) e.plz = true;
      if (!form.ort.trim()) e.ort = true;
    }
    if (currentStepId === "uebersicht" && !form.datenschutz) e.datenschutz = true;
    setErrors(e); if (Object.keys(e).length) triggerShake(); return Object.keys(e).length === 0;
  };

  const next = () => { if (!validate()) return; if (wizardIndex < totalSteps - 1) { setNavDir(1); setAnimKey((k) => k + 1); setWizardIndex((i) => i + 1); } };
  const prev = () => { if (wizardIndex > 0) { setNavDir(-1); setAnimKey((k) => k + 1); setWizardIndex((i) => i - 1); } };
  const doSubmit = () => { if (!validate()) return; setPhase("done"); };

  useEffect(() => { shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [wizardIndex, phase]);

  // Auto-correct haken count when width changes reduce max hooks
  useEffect(() => {
    const currentHaken = parseInt(form.haken) || 0;
    if (currentHaken > limits.maxHooks && limits.maxHooks > 0) {
      set("haken", String(limits.maxHooks));
    }
  }, [limits.maxHooks]);

  // Notify parent (Wix iframe host) of height changes for auto-resize
  useEffect(() => {
    if (window === window.parent) return;
    const notify = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "holzschneiderei:resize", height }, "*");
    };
    const observer = new ResizeObserver(notify);
    observer.observe(document.body);
    notify();
    return () => observer.disconnect();
  }, []);

  const skippedSteps = useMemo(() => OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id]), [enabledSteps]);

  // Build animation name based on flow + direction
  const getAnimName = useCallback(() => {
    if (flow === "ltr") return navDir > 0 ? "slideFromRight" : "slideFromLeft";
    if (flow === "ttb") return navDir > 0 ? "slideFromBottom" : "slideFromTop";
    if (flow === "btt") return navDir > 0 ? "slideFromTop" : "slideFromBottom";
    return "slideFromRight";
  }, [flow, navDir]);

  /* ═══════════ PHASE: TYP ═══════════ */
  if (phase === "typen") {
    return (
      <Shell r={shellRef}>
        <main style={S.main}><div style={S.card}><Fade>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={S.configTitle}>Garderobe bestellen</h1>
            <p style={S.configSub}>Massanfertigung aus Schweizer Holz</p>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              Welchen Garderoben-Typ möchten Sie? Wählen Sie Ihr Motiv – danach konfigurieren Sie Holz, Masse und Details.
            </p>
          </div>
          <div role="radiogroup" aria-label="Garderoben-Typ" style={S.typGrid}>
            <button role="radio" aria-checked={form.typ === "schriftzug"} onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
              style={{ ...S.typCard, borderColor: form.typ === "schriftzug" ? t.brand : t.border, background: form.typ === "schriftzug" ? "rgba(31,59,49,.06)" : t.fieldBg }}>
              {form.typ === "schriftzug" && <div style={S.typCheck}>✓</div>}
              <div style={S.typVisual}>
                <svg viewBox="0 0 160 80" style={{ width: "100%", height: 80 }}>
                  <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                  {[22,36,50,64,78].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                  <text x="112" y="48" textAnchor="middle" fontSize="8" fill={form.typ === "schriftzug" ? t.brand : t.muted} fontWeight="700" letterSpacing=".12em" fontFamily="system-ui">IHR TEXT</text>
                  {[122,136].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                </svg>
              </div>
              <span style={S.typLabel}>Schriftzug-Garderobe</span>
              <span style={S.typDesc}>Ihr persönlicher Text als Motiv – z.B. Familienname oder Willkommensgruss.</span>
            </button>
            <button role="radio" aria-checked={form.typ === "bergmotiv"} onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
              style={{ ...S.typCard, borderColor: form.typ === "bergmotiv" ? t.brand : t.border, background: form.typ === "bergmotiv" ? "rgba(31,59,49,.06)" : t.fieldBg }}>
              {form.typ === "bergmotiv" && <div style={S.typCheck}>✓</div>}
              <div style={S.typVisual}>
                <svg viewBox="0 0 160 80" style={{ width: "100%", height: 80 }}>
                  <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                  <path d={berge[0].path} fill="none" stroke={form.typ === "bergmotiv" ? t.brand : t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(18,8) scale(1.24,0.72)" opacity="0.7" />
                  {[30,50,110,130].map((x,i) => <line key={i} x1={x} y1="25" x2={x} y2="57" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                </svg>
              </div>
              <span style={S.typLabel}>Bergmotiv-Garderobe</span>
              <span style={S.typDesc}>Silhouette eines Schweizer Bergs – 7 ikonische Gipfel zur Auswahl.</span>
            </button>
          </div>
          {form.typ === "schriftzug" && (<Fade><div style={S.subSection}>
            <label style={S.label}>Ihr Schriftzug <span style={{ color: t.error }}>*</span></label>
            <input type="text" maxLength={30} placeholder="z.B. Willkommen, Familie Müller …" value={form.schriftzug} onChange={(e) => set("schriftzug", e.target.value)}
              style={{ ...S.input, fontSize: 16, height: 50, textAlign: "center", letterSpacing: ".06em", fontWeight: 600, borderColor: limits.textTooLong ? t.error : t.border }} />
            <div style={{ fontSize: 11, color: limits.textTooLong ? t.error : t.muted, marginTop: 6, textAlign: "center" }}>
              {limits.textTooLong
                ? `Zu lang für ${constr.MAX_W} cm Breite – max. ${limits.maxLetters} Buchstaben (ohne Leerzeichen)`
                : `${limits.letters} / ${limits.maxLetters} Buchstaben · Breite min. ${limits.minW} cm`}
            </div>

            {/* Schriftart-Auswahl */}
            <div style={{ marginTop: 20 }}>
              <label style={S.label}>Schriftart wählen <span style={{ color: t.error }}>*</span></label>
              <div style={S.fontList}>
                {schriftarten.map((f) => {
                  const on = form.schriftart === f.value;
                  return (
                    <button key={f.value} role="radio" aria-checked={on} aria-label={f.label} onClick={() => set("schriftart", f.value)}
                      style={{ ...S.fontRow, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg }}>
                      {on && <div style={S.fontCheck}>✓</div>}
                      <span style={{ fontSize: 24, fontFamily: f.family, fontWeight: f.weight, color: on ? t.brand : t.text, lineHeight: 1.1, letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
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
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>Live-Vorschau</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <svg viewBox="0 0 320 160" style={{ width: "100%", maxWidth: 380, height: "auto" }}>
                      {/* Garderobenkörper */}
                      <rect x="10" y="62" width="300" height="88" rx="2" fill={t.fieldBg} stroke={t.border} strokeWidth="1" />

                      {/* Haken */}
                      {[45, 95, 145, 195, 245, 275].map((x, i) => (
                        <g key={i}>
                          <line x1={x} y1="72" x2={x} y2="118" stroke={t.border} strokeWidth="2" strokeLinecap="round" />
                          <circle cx={x} cy="120" r="2.5" fill={t.border} />
                        </g>
                      ))}

                      {/* Hutablage-Linie */}
                      <line x1="16" y1="72" x2="304" y2="72" stroke={t.border} strokeWidth="1" />

                      {/* Schriftzug-Kontur als oberer Abschluss */}
                      <text x="160" y="52" textAnchor="middle"
                        fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                        fill="none" stroke={t.brand} strokeWidth="1.2"
                        letterSpacing=".06em" opacity="0.85">
                        {form.schriftzug.toUpperCase()}
                      </text>

                      {/* Feiner gefüllter Schriftzug als Schatten darunter */}
                      <text x="160" y="52" textAnchor="middle"
                        fontSize="32" fontFamily={font.family} fontWeight={font.weight}
                        fill={t.brand} opacity="0.08"
                        letterSpacing=".06em">
                        {form.schriftzug.toUpperCase()}
                      </text>

                      {/* Verbindungslinien links/rechts vom Text zum Körper */}
                      <line x1="10" y1="55" x2="10" y2="62" stroke={t.border} strokeWidth="1" />
                      <line x1="310" y1="55" x2="310" y2="62" stroke={t.border} strokeWidth="1" />
                      <line x1="10" y1="55" x2="30" y2="55" stroke={t.border} strokeWidth="1" />
                      <line x1="290" y1="55" x2="310" y2="55" stroke={t.border} strokeWidth="1" />

                      {/* Boden-Linie */}
                      <line x1="10" y1="150" x2="310" y2="150" stroke={t.border} strokeWidth="1" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: t.muted }}>
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
          {form.typ === "bergmotiv" && (<Fade><div style={S.subSection}>
            <label style={S.label}>Berg auswählen <span style={{ color: t.error }}>*</span></label>
            <div role="radiogroup" aria-label="Berg auswählen" style={S.bergGrid}>{berge.map((b) => { const on = form.berg === b.value; return (
              <button key={b.value} role="radio" aria-checked={on} onClick={() => set("berg", b.value)} style={{ ...S.bergCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.06)" : t.fieldBg }}>
                {on && <div style={S.bergCheckmark}>✓</div>}
                <svg viewBox="0 0 100 70" style={{ width: "100%", height: 44 }} preserveAspectRatio="none">
                  <path d={b.path} fill={on ? "rgba(31,59,49,.1)" : "rgba(200,197,187,.15)"} stroke={on ? t.brand : t.muted} strokeWidth={on ? "2" : "1.2"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: on ? t.brand : t.text }}>{b.label}</span>
                <span style={{ fontSize: 10, color: t.muted }}>{b.hoehe} · {b.region}</span>
              </button>);})}</div>
          </div></Fade>)}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <button onClick={() => {
              const e = {}; if (!form.typ) e.typ = true;
              if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
              if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
              if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
              if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
              setErrors(e); if (Object.keys(e).length) { triggerShake(); return; } setPhase("config");
            }} disabled={!form.typ} style={{ ...S.navBtn, ...S.navBtnSolid, height: 48, padding: "0 36px", fontSize: 13, opacity: form.typ ? 1 : .35, cursor: form.typ ? "pointer" : "default" }}>
              Weiter zur Konfiguration →
            </button>
          </div>
          {(errors.schriftzug || errors.schriftart || errors.berg) && <p style={{ ...S.errorText, textAlign: "center", marginTop: 8 }}>{errors.schriftzug ? "Bitte geben Sie einen Schriftzug ein." : errors.schriftart ? "Bitte wählen Sie eine Schriftart." : "Bitte wählen Sie einen Berg."}</p>}
        </Fade></div></main>
        <GlobalStyles flow={flow} />
      </Shell>
    );
  }

  /* ═══════════ PHASE: CONFIG ═══════════ */
  if (phase === "config") {
    const bergObj = berge.find((b) => b.value === form.berg);
    const fontObj = schriftarten.find((f) => f.value === form.schriftart);
    const typText = form.typ === "schriftzug" ? `✏️ „${form.schriftzug}" · ${fontObj?.label || ""}` : `⛰️ ${bergObj?.label || ""}`;
    return (
      <Shell r={shellRef}>
        <main style={S.main}><div style={S.card}><Fade>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ ...S.configTitle, fontSize: "clamp(18px,3vw,26px)" }}>Konfiguration</h1>
            <div style={S.typBadge}>{typText}<button onClick={() => setPhase("typen")} style={S.typChangeBtn}>Ändern</button></div>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, maxWidth: 420, margin: "12px auto 0" }}>
              Welche Schritte möchten Sie selbst bestimmen?
            </p>
          </div>
          {/* ── Buchstaben & Typesetting Karte (nur Schriftzug) ── */}
          {form.typ === "schriftzug" && (() => {
            const font = schriftarten.find((f) => f.value === form.schriftart);
            const chars = form.schriftzug.split("");
            return (
              <div style={S.featureCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>✏️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Buchstaben & Typesetting</div>
                    <div style={{ fontSize: 11, color: t.muted }}>Schriftzug-Analyse für CNC-Fräsung</div>
                  </div>
                </div>

                {/* Font preview full width */}
                <div style={{ background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 3, padding: "16px 12px", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 28, fontFamily: font?.family, fontWeight: font?.weight, color: t.brand, letterSpacing: ".06em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {form.schriftzug.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: t.muted, marginTop: 6 }}>{font?.label} · {font?.weight} weight</div>
                </div>

                {/* Character grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 12 }}>
                  {chars.map((ch, i) => (
                    <div key={i} style={{ width: 28, height: 34, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: ch === " " ? "rgba(200,197,187,.15)" : "rgba(31,59,49,.06)", border: `1px solid ${ch === " " ? t.border : "rgba(31,59,49,.2)"}`, borderRadius: 2 }}>
                      <span style={{ fontSize: 14, fontFamily: font?.family, fontWeight: font?.weight, color: ch === " " ? t.muted : t.text, lineHeight: 1 }}>{ch === " " ? "␣" : ch}</span>
                      <span style={{ fontSize: 7, color: t.muted, lineHeight: 1, marginTop: 2 }}>{constr.LETTER_W}cm</span>
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                <div style={S.constraintGrid}>
                  <div style={S.constraintItem}>
                    <span style={S.constraintLabel}>Zeichen</span>
                    <span style={S.constraintValue}>{form.schriftzug.length} ({limits.letters} ohne Leerzeichen)</span>
                  </div>
                  <div style={S.constraintItem}>
                    <span style={S.constraintLabel}>Fräsbreite</span>
                    <span style={S.constraintValue}>{limits.minWText > 0 ? `${limits.minWText} cm` : "–"}</span>
                  </div>
                  <div style={S.constraintItem}>
                    <span style={S.constraintLabel}>Pro Buchstabe</span>
                    <span style={S.constraintValue}>{constr.LETTER_W} cm + {constr.LETTER_MARGIN} cm Rand</span>
                  </div>
                  <div style={S.constraintItem}>
                    <span style={S.constraintLabel}>Max. Buchstaben</span>
                    <span style={{ ...S.constraintValue, color: limits.textTooLong ? t.error : t.text }}>{limits.maxLetters}</span>
                  </div>
                </div>

                {limits.textTooLong && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(160,48,48,.08)", border: `1px solid rgba(160,48,48,.2)`, borderRadius: 3, fontSize: 11, color: t.error, fontWeight: 600 }}>
                    Text zu lang – max. {limits.maxLetters} Buchstaben bei {constr.MAX_W} cm Breite
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Holzarten-Konfiguration ── */}
          <div style={S.featureCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>🪵</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Holzarten</div>
                <div style={{ fontSize: 11, color: t.muted }}>Verfügbare Hölzer für diese Bestellung ({activeHolzarten.length} von {holzarten.length})</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {holzarten.map((h) => {
                const on = enabledHolzarten[h.value];
                const isLast = activeHolzarten.length === 1 && on;
                return (
                  <button key={h.value} role="checkbox" aria-checked={on} aria-label={h.label} onClick={() => !isLast && toggleHolz(h.value)}
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
          </div>

          <div style={S.configList}>{OPTIONAL_STEPS.map((s) => {
            const on = enabledSteps[s.id]; const locked = s.required;

            /* ── Special: Abmessungen admin card ── */
            if (s.id === "masse") return (
              <div key={s.id} style={{ ...S.featureCard, borderColor: t.brand }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.label}</span>
                      <span style={S.pflichtBadge}>Pflicht</span>
                    </div>
                    <span style={{ fontSize: 11, color: t.muted }}>Durch Produktgrenzen gefiltert</span>
                  </div>
                </div>

                {/* Per-dimension config */}
                {DIM_FIELDS.map((dim) => {
                  const cfg = dimConfig[dim.key];
                  const min = constr[dim.constrMin]; const max = constr[dim.constrMax];
                  return (
                    <div key={dim.key} style={{ padding: "12px 0", borderTop: `1px solid ${t.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* enabled/disabled toggle */}
                          <button role="switch" aria-checked={cfg.enabled} aria-label={`${dim.label} aktivieren`} onClick={() => setDim(dim.key, "enabled", !cfg.enabled)}
                            style={{ ...S.miniToggle, background: cfg.enabled ? t.brand : t.border }}>
                            <div style={{ ...S.miniToggleThumb, transform: cfg.enabled ? "translateX(14px)" : "translateX(0)" }} />
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.enabled ? t.text : t.muted }}>{dim.label}</span>
                          <span style={{ fontSize: 10, color: t.muted }}>{min}–{max} {dim.unit}</span>
                        </div>
                        {/* Mode selector */}
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

                      {/* Presets (for pills & combo) */}
                      {cfg.enabled && cfg.mode !== "text" && (
                        <div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                            {cfg.presets.filter((v) => v >= min && v <= max).map((p) => (
                              <span key={p} style={S.presetPill}>
                                {p}
                                <button onClick={() => removePreset(dim.key, p)} style={S.presetRemove}>×</button>
                              </span>
                            ))}
                            {cfg.presets.filter((v) => v < min || v > max).map((p) => (
                              <span key={p} style={{ ...S.presetPill, opacity: 0.4, textDecoration: "line-through" }}>
                                {p}
                                <button onClick={() => removePreset(dim.key, p)} style={S.presetRemove}>×</button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <input type="number" placeholder="Wert hinzufügen"
                              ref={(el) => { presetInputRefs.current[dim.key] = el; }}
                              style={{ ...S.input, fontSize: 11, height: 28, flex: 1, padding: "0 8px" }}
                              onKeyDown={(e) => { if (e.key === "Enter") { addPreset(dim.key, e.target.value); e.target.value = ""; } }} />
                            <button onClick={() => { const el = presetInputRefs.current[dim.key]; if (el) { addPreset(dim.key, el.value); el.value = ""; } }}
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

                {/* Inline Produktgrenzen editor */}
                <div style={{ padding: "14px 0 0", borderTop: `1px solid ${t.border}`, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Produktgrenzen</div>
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
                          <span style={{ fontSize: 10, color: t.brand, fontWeight: 700, width: 24, flexShrink: 0 }}>{mh}×</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );

            /* ── Regular step toggle ── */
            return (
            <button key={s.id} role="switch" aria-checked={on} aria-label={s.label} onClick={() => toggleStep(s.id)} style={{ ...S.configCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.05)" : t.fieldBg }}>
              <div style={S.configCardLeft}><span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.label}</span>
                    {locked && <span style={S.pflichtBadge}>Pflicht</span>}
                  </div>
                  <span style={{ fontSize: 11, color: t.muted, lineHeight: 1.35 }}>{s.desc}</span>
                  {!on && !locked && <div style={S.defaultHint}>↳ Standard: {s.defaultLabel}</div>}
                </div>
              </div>
              <div style={{ ...S.toggle, background: locked ? t.brand : on ? t.brand : t.border, justifyContent: on || locked ? "flex-end" : "flex-start", opacity: locked ? .6 : 1 }}><div style={S.toggleThumb} /></div>
            </button>);})}</div>

          {/* ── Import / Export ── */}
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
            <button onClick={exportParams} style={{ ...S.navBtn, ...S.navBtnOutline, height: 32, fontSize: 10, padding: "0 14px" }}>↓ Parameter exportieren</button>
            <button onClick={importParams} style={{ ...S.navBtn, ...S.navBtnOutline, height: 32, fontSize: 10, padding: "0 14px" }}>↑ Parameter importieren</button>
          </div>
          <div style={S.pipelineBox}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>Ihr Ablauf — {activeSteps.length} Schritte</div>
            <div style={S.pipeline}>{activeSteps.map((id, i) => {
              const o = OPTIONAL_STEPS.find((x) => x.id === id); const lb = o ? o.label : id === "kontakt" ? "Kontakt" : "Absenden"; const ic = o?.icon || (id === "kontakt" ? "📋" : "✓");
              return (<div key={id} style={{ display: "flex", alignItems: "center" }}><div style={S.pipeChip}><span style={{ fontSize: 13 }}>{ic}</span><span style={{ fontSize: 10, fontWeight: 600 }}>{lb}</span></div>
                {i < activeSteps.length - 1 && <span style={{ color: t.border, margin: "0 3px", fontSize: 13 }}>›</span>}</div>);
            })}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <button onClick={() => setPhase("typen")} style={{ ...S.navBtn, ...S.navBtnOutline }}>← Zurück</button>
            <button onClick={startWizard} style={{ ...S.navBtn, ...S.navBtnSolid, height: 48, padding: "0 36px", fontSize: 13 }}>Los geht's →</button>
          </div>
        </Fade></div></main>
        <GlobalStyles flow={flow} />
      </Shell>
    );
  }

  /* ═══════════ PHASE: DONE ═══════════ */
  if (phase === "done") {
    return (
      <Shell r={shellRef}>
        <main style={S.main}><div style={S.card}><Fade>
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 18, opacity: .8 }}>✓</div>
            <h2 style={{ ...S.stepTitle, marginBottom: 12 }}>Vielen Dank!</h2>
            <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px" }}>Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 2 Werktagen.</p>
            <button onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }} style={{ ...S.navBtn, ...S.navBtnOutline, margin: "0 auto" }}>Neue Anfrage starten</button>
          </div>
        </Fade></div></main>
        <GlobalStyles flow={flow} />
      </Shell>
    );
  }

  /* ═══════════ PHASE: WIZARD ═══════════ */
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typChip = form.typ === "schriftzug" ? `✏️ „${form.schriftzug}" · ${fontObj?.label || ""}` : `⛰️ ${bergObj?.label || ""}`;
  const animName = getAnimName();

  return (
    <div style={S.shell} ref={shellRef}>
      <div style={S.progressTrack}><div style={{ ...S.progressBar, width: `${((wizardIndex + 1) / totalSteps) * 100}%` }} /></div>

      <main style={S.main}>
        <div style={{ ...S.card, animation: shake ? "shake .4s" : undefined }}>
          {/* Typ chip + flow direction toggle */}
          <div style={S.wizardTopBar}>
            <span style={{ fontSize: 12, color: t.muted }}>{typChip}</span>
            <FlowPicker flow={flow} onChange={setFlow} />
          </div>

          {/* Animated step content */}
          <div key={animKey} style={{ animation: `${animName} .38s cubic-bezier(.22,1,.36,1)` }}>
            {currentStepId === "holzart" && <StepHolzart form={form} set={set} errors={errors} holzarten={activeHolzarten} />}
            {currentStepId === "masse" && <StepMasse form={form} set={set} errors={errors} limits={limits} constr={constr} dimConfig={dimConfig} />}
            {currentStepId === "ausfuehrung" && <StepAusfuehrung form={form} set={set} limits={limits} constr={constr} />}
            {currentStepId === "extras" && <StepExtras form={form} toggleExtra={toggleExtra} set={set} />}
            {currentStepId === "kontakt" && <StepKontakt form={form} set={set} errors={errors} />}
            {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} />}
          </div>
        </div>
      </main>

      <nav style={S.bottomBar}>
        <button onClick={wizardIndex === 0 ? () => setPhase("config") : prev} style={{ ...S.navBtn, ...S.navBtnOutline }}>
          {wizardIndex === 0 ? "← Anpassen" : "← Zurück"}
        </button>
        <div style={S.dots}>{activeSteps.map((_, i) => <div key={i} style={{ ...S.dot, background: i <= wizardIndex ? t.brand : t.border }} />)}</div>
        {currentStepId !== "uebersicht"
          ? <button onClick={next} style={{ ...S.navBtn, ...S.navBtnSolid }}>Weiter →</button>
          : <button onClick={doSubmit} style={{ ...S.navBtn, ...S.navBtnSolid }}>Absenden ✓</button>}
      </nav>
      <GlobalStyles flow={flow} />
    </div>
  );
}

/* ════════════════════════════════════════
   FLOW DIRECTION PICKER
   ════════════════════════════════════════ */
function FlowPicker({ flow, onChange }) {
  return (
    <div style={S.flowPicker}>
      {FLOWS.map((f) => (
        <button
          key={f.id}
          onClick={(e) => { e.stopPropagation(); onChange(f.id); }}
          title={f.title}
          style={{
            ...S.flowBtn,
            background: flow === f.id ? t.brand : "transparent",
            color: flow === f.id ? t.white : t.muted,
            borderColor: flow === f.id ? t.brand : t.border,
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
    <div role="radiogroup" aria-label="Holzart" style={S.woodGrid}>{woods.map((h) => { const on = form.holzart === h.value; return (
      <button key={h.value} role="radio" aria-checked={on} onClick={() => set("holzart", h.value)} style={{ ...S.woodCard, borderColor: errors.holzart && !form.holzart ? t.error : on ? t.brand : t.border, background: on ? "rgba(31,59,49,.07)" : t.fieldBg }}>
        <span style={{ fontSize: 28 }}>{h.emoji}</span><span style={S.woodLabel}>{h.label}</span><span style={S.woodDesc}>{h.desc}</span>
        {on && <div style={S.checkBadge}>✓</div>}
      </button>);})}</div>
    {errors.holzart && <p style={S.errorText}>Bitte wählen Sie eine Holzart.</p>}
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
            <label style={S.label}>{dim.label} <span style={{ color: t.error }}>*</span></label>
            <span style={{ fontSize: 11, color: t.muted }}>{min}–{max} {dim.unit}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {filtered.map((p) => {
              const on = String(p) === String(val);
              return (
                <button key={p} onClick={() => set(dim.key, String(p))}
                  style={{ ...S.pillBtn, borderColor: on ? t.brand : t.border, background: on ? t.brand : t.fieldBg, color: on ? t.white : t.text, fontWeight: on ? 700 : 400 }}>
                  {p}
                </button>
              );
            })}
          </div>
          <input type="number" inputMode="numeric" min={min} max={max} placeholder={`oder Wunschmass (${dim.unit})`} value={filtered.some((p) => String(p) === String(val)) ? "" : val}
            onChange={(e) => set(dim.key, e.target.value)}
            style={{ ...S.input, fontSize: 13, height: 36, borderColor: err ? t.error : t.border }} />
        </div>
      );
    }

    if (cfg.mode === "combo") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={S.label}>{dim.label} <span style={{ color: t.error }}>*</span></label>
            <span style={{ fontSize: 11, color: t.muted }}>{min}–{max} {dim.unit}</span>
          </div>
          <select value={filtered.includes(parseInt(val)) ? val : "__custom"} onChange={(e) => { if (e.target.value !== "__custom") set(dim.key, e.target.value); }}
            style={{ ...S.select, borderColor: err ? t.error : t.border }}>
            {filtered.map((p) => <option key={p} value={String(p)}>{p} {dim.unit}</option>)}
            <option value="__custom">Anderes Mass…</option>
          </select>
          {(!filtered.includes(parseInt(val))) && (
            <input type="number" inputMode="numeric" min={min} max={max} placeholder={`Wunschmass (${dim.unit})`} value={val}
              onChange={(e) => set(dim.key, e.target.value)}
              style={{ ...S.input, fontSize: 13, height: 36, marginTop: 6, borderColor: err ? t.error : t.border }} />
          )}
        </div>
      );
    }

    // text (Freitext)
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={S.label}>{dim.label} <span style={{ color: t.error }}>*</span></label>
          <span style={{ fontSize: 11, color: t.muted }}>{min}–{max} {dim.unit}</span>
        </div>
        <input type="number" inputMode="numeric" min={min} max={max} placeholder={dim.unit} value={val}
          onChange={(e) => set(dim.key, e.target.value)}
          style={{ ...S.input, borderColor: err ? t.error : t.border, fontSize: 18, height: 48, textAlign: "center", letterSpacing: ".04em" }} />
      </div>
    );
  };

  const enabledDims = DIM_FIELDS.filter((d) => dimConfig[d.key].enabled);
  return (<div><StepHeader title="Abmessungen" sub="Breite, Höhe und Tiefe in cm." />
    <div style={S.dimVisual}><div style={S.dimBox}><span style={{ fontSize: 11, color: t.muted, letterSpacing: ".06em" }}>{enabledDims.map((d) => form[d.key] || d.label[0]).join(" × ")} cm</span></div></div>

    {form.typ === "schriftzug" && limits.minWText > constr.MIN_W && (
      <div style={{ ...S.constraintHint, marginBottom: 12 }}>
        Min. {limits.minWText} cm Breite wegen {limits.letters} Buchstaben · Max. {limits.maxHooks} Haken bei {limits.clampedW} cm
      </div>
    )}

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {enabledDims.map((dim) => (
        <div key={dim.key}>{renderDimInput(dim)}</div>
      ))}
    </div>
    {wWarn && <p style={S.errorText}>{w < limits.minW ? `Mindestbreite ${limits.minW} cm` + (limits.minWText > constr.MIN_W ? ` (${limits.letters} Buchstaben × ${constr.LETTER_W} cm)` : "") : `Maximalbreite ${limits.maxW} cm`}</p>}
  </div>);
}

function StepAusfuehrung({ form, set, limits, constr }) {
  const hookOpts = limits.hookOptions.map((n) => ({ value: String(n), label: String(n) }));
  return (<div><StepHeader title="Ausführung" sub="Oberfläche, Haken & Hutablage." />
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SelectField label="Oberfläche" value={form.oberflaeche} onChange={(v) => set("oberflaeche", v)} options={oberflaechen} />
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SelectField label={`Haken (max. ${limits.maxHooks})`} value={form.haken} onChange={(v) => set("haken", v)} options={hookOpts} />
          <SelectField label="Material" value={form.hakenmaterial} onChange={(v) => set("hakenmaterial", v)} options={hakenMaterialien} />
        </div>
        <div style={S.constraintHint}>
          Mindestabstand {constr.HOOK_SPACING} cm · {limits.clampedW} cm Breite → max. {limits.maxHooks} Haken
        </div>
      </div>
      <div><label style={S.label}>Hutablage</label><div style={{ display: "flex", gap: 10 }}>
        {[{ v: "ja", l: "Ja" }, { v: "nein", l: "Nein" }].map((o) => (
          <button key={o.v} role="radio" aria-checked={form.hutablage === o.v} onClick={() => set("hutablage", o.v)} style={{ ...S.toggleBtn, borderColor: form.hutablage === o.v ? t.brand : t.border, background: form.hutablage === o.v ? "rgba(31,59,49,.07)" : t.fieldBg, color: form.hutablage === o.v ? t.brand : t.muted, fontWeight: form.hutablage === o.v ? 700 : 400 }}>{o.l}</button>
        ))}</div></div>
    </div>
  </div>);
}

function StepExtras({ form, toggleExtra, set }) {
  return (<div><StepHeader title="Extras & Wünsche" sub="Zusätzliche Ausstattung und Bemerkungen." />
    <div style={S.extrasGrid}>{extrasOptions.map((ex) => { const on = form.extras.includes(ex.value); return (
      <button key={ex.value} role="checkbox" aria-checked={on} aria-label={ex.label} onClick={() => toggleExtra(ex.value)} style={{ ...S.extraCard, borderColor: on ? t.brand : t.border, background: on ? "rgba(31,59,49,.07)" : t.fieldBg }}>
        <span style={{ fontSize: 22 }}>{ex.icon}</span><span style={{ fontSize: 12, fontWeight: 600, color: on ? t.brand : t.text }}>{ex.label}</span>
        {on && <div style={S.miniCheck}>✓</div>}
      </button>);})}</div>
    <div style={{ marginTop: 20 }}><label style={S.label}>Bemerkungen (optional)</label>
      <textarea placeholder="Z.B. spezielle Farbe, Gravur …" value={form.bemerkungen} onChange={(e) => set("bemerkungen", e.target.value)} style={S.textarea} /></div>
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

function StepUebersicht({ form, set, errors, skippedSteps }) {
  const wood = holzarten.find((h) => h.value === form.holzart);
  const ofl = oberflaechen.find((o) => o.value === form.oberflaeche);
  const hm = hakenMaterialien.find((h) => h.value === form.hakenmaterial);
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typVal = form.typ === "schriftzug" ? `✏️ „${form.schriftzug}"` : `⛰️ ${bergObj?.label || "–"}`;
  return (<div><StepHeader title="Zusammenfassung" sub="Prüfen Sie Ihre Angaben." />
    <div style={S.summarySection}>
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
    {skippedSteps.length > 0 && (<div style={S.defaultsBar}>
      <span style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".06em", textTransform: "uppercase" }}>Standardwerte:</span>
      {skippedSteps.map((s) => <span key={s.id} style={S.defaultChip}>{s.icon} {s.defaultLabel}</span>)}
    </div>)}
    <div style={{ ...S.summarySection, marginTop: 14 }}>
      <SummaryRow label="Name" value={`${form.anrede ? form.anrede.charAt(0).toUpperCase() + form.anrede.slice(1) + " " : ""}${form.vorname} ${form.nachname}`} />
      <SummaryRow label="E-Mail" value={form.email} />
      {form.telefon && <SummaryRow label="Telefon" value={form.telefon} />}
      {form.strasse ? <SummaryRow label="Adresse" value={`${form.strasse}, ${form.plz} ${form.ort}`} /> : <SummaryRow label="Ort" value={`${form.plz} ${form.ort}`} />}
    </div>
    <div style={S.infoBox}><p style={{ fontSize: 12, color: t.muted, lineHeight: 1.55, margin: 0 }}>Unverbindliche Offerte inkl. Visualisierung. Lieferzeit: 4–8 Wochen. Montage schweizweit.</p></div>
    <label style={{ ...S.checkItem, marginTop: 16 }}>
      <input type="checkbox" checked={form.datenschutz} onChange={(e) => set("datenschutz", e.target.checked)} style={{ ...S.checkbox, accentColor: errors.datenschutz ? t.error : t.brand }} />
      <span style={{ fontSize: 13 }}>Ich akzeptiere die <a href="/datenschutz" target="_top" style={{ color: t.brand, textDecoration: "underline" }}>Datenschutzerklärung</a><span style={{ color: t.error, marginLeft: 3 }}>*</span></span>
    </label>
    {errors.datenschutz && <p style={S.errorText}>Bitte akzeptieren Sie die Datenschutzerklärung.</p>}
  </div>);
}

/* ════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════ */
function Shell({ r, children }) {
  return (<div style={S.shell} ref={r}>
    {children}
  </div>);
}
function Fade({ children }) { return <div style={{ animation: "fadeUp .35s ease" }}>{children}</div>; }
function StepHeader({ title, sub }) { return <div style={{ marginBottom: 24 }}><h2 style={S.stepTitle}>{title}</h2>{sub && <p style={S.stepSub}>{sub}</p>}</div>; }
function TextField({ label, req, error, value, onChange, placeholder, type = "text" }) {
  return (<div><label style={S.label}>{label}{req && <span style={{ color: t.error, marginLeft: 3 }}>*</span>}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...S.input, borderColor: error ? t.error : t.border }} /></div>);
}
function SelectField({ label, value, onChange, options }) {
  return (<div><label style={S.label}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={S.select}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);
}
function SummaryRow({ label, value }) { return <div style={S.summaryRow}><span style={S.summaryLabel}>{label}</span><span style={S.summaryValue}>{value}</span></div>; }

function GlobalStyles({ flow }) {
  return <style>{`
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideFromRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideFromLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideFromBottom{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideFromTop{from{opacity:0;transform:translateY(-40px)}to{opacity:1;transform:translateY(0)}}
    input:focus,select:focus,textarea:focus{outline:none;border-color:${t.brand} !important}
    input::placeholder,textarea::placeholder{color:${t.border}}
    button:focus-visible{outline:2px solid ${t.brand};outline-offset:2px}
  `}</style>;
}

/* ════════════════════════════════════════ STYLES ════════════════════════════════════════ */
const S = {
  shell:{minHeight:"100%",display:"flex",flexDirection:"column",background:t.bg,color:t.text,fontFamily:'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',WebkitFontSmoothing:"antialiased",overflowY:"auto"},
  progressTrack:{height:3,background:t.border},progressBar:{height:3,background:t.brand,transition:"width .4s cubic-bezier(.4,0,.2,1)",borderRadius:"0 2px 2px 0"},
  main:{flex:1,display:"flex",justifyContent:"center",padding:"24px 16px 24px"},card:{width:"100%",maxWidth:520},

  // Wizard top bar with typ chip + flow picker
  wizardTopBar:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0 16px",marginBottom:8,borderBottom:`1px solid ${t.border}`,gap:12},

  // Flow picker
  flowPicker:{display:"flex",gap:3,background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:3,padding:2},
  flowBtn:{width:28,height:24,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid",borderRadius:2,fontSize:12,fontFamily:"inherit",cursor:"pointer",fontWeight:600,transition:"all .2s",padding:0,lineHeight:1},

  // Typ
  typGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  typCard:{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"18px 14px 16px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"border-color .2s, background .2s"},
  typCheck:{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:999,background:t.brand,color:t.white,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},
  typVisual:{width:"100%",marginBottom:4},typLabel:{fontSize:13,fontWeight:800,letterSpacing:".04em",textTransform:"uppercase",color:t.text},typDesc:{fontSize:11,color:t.muted,lineHeight:1.4},
  subSection:{marginTop:24,padding:"20px 18px",background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:3},
  bergGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8},
  bergCard:{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px 10px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",transition:"border-color .2s, background .2s",textAlign:"center"},
  bergCheckmark:{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:999,background:t.brand,color:t.white,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},

  // Font picker
  fontList:{display:"flex",flexDirection:"column",gap:6,marginTop:8},
  fontRow:{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"14px 36px 14px 16px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",transition:"border-color .2s, background .2s",textAlign:"center",boxSizing:"border-box"},
  fontCheck:{position:"absolute",top:"50%",right:12,transform:"translateY(-50%)",width:18,height:18,borderRadius:999,background:t.brand,color:t.white,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},

  typBadge:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",background:"rgba(31,59,49,.06)",border:`1px solid ${t.border}`,borderRadius:3,fontSize:12,fontWeight:600,color:t.text},
  typChangeBtn:{background:"none",border:"none",color:t.brand,fontSize:11,fontWeight:700,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit",padding:0,marginLeft:4},

  // Config
  configTitle:{fontSize:"clamp(22px,3.5vw,32px)",fontWeight:800,letterSpacing:".06em",textTransform:"uppercase",margin:"0 0 6px"},
  configSub:{fontSize:"clamp(11px,1.4vw,13px)",fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",color:t.muted,margin:"0 0 16px"},
  configList:{display:"flex",flexDirection:"column",gap:10},
  configCard:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,padding:"14px 16px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"border-color .2s, background .2s",width:"100%"},
  configCardLeft:{display:"flex",alignItems:"flex-start",gap:12,flex:1,minWidth:0},
  pflichtBadge:{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.brand,background:"rgba(31,59,49,.1)",padding:"2px 6px",borderRadius:2},
  defaultHint:{fontSize:10,color:t.border,marginTop:3,fontStyle:"italic",lineHeight:1.3},

  // Constraints
  constraintBox:{marginTop:18,padding:"16px 16px 14px",background:"rgba(31,59,49,.04)",border:`1px solid ${t.border}`,borderRadius:3},
  constraintGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"},
  constraintItem:{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"4px 0",gap:8},
  constraintLabel:{fontSize:11,color:t.muted,fontWeight:600},
  constraintValue:{fontSize:11,color:t.text,fontWeight:700,textAlign:"right"},
  constraintHint:{fontSize:11,color:t.muted,marginTop:6,fontStyle:"italic",lineHeight:1.4},

  // Feature cards (config phase)
  featureCard:{padding:"18px 16px",background:"rgba(31,59,49,.03)",border:`1.5px solid ${t.border}`,borderRadius:3,marginBottom:14},

  // Pills & presets
  pillBtn:{height:36,minWidth:48,padding:"0 12px",fontSize:13,fontWeight:500,border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"},
  presetPill:{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",background:"rgba(31,59,49,.08)",border:`1px solid ${t.border}`,borderRadius:3,fontSize:11,fontWeight:600,color:t.text},
  presetRemove:{background:"none",border:"none",color:t.muted,cursor:"pointer",fontSize:13,fontWeight:700,padding:"0 2px",fontFamily:"inherit",lineHeight:1},
  miniToggle:{width:32,height:18,borderRadius:9,display:"flex",alignItems:"center",padding:"0 2px",cursor:"pointer",border:"none",transition:"background .25s",flexShrink:0},
  miniToggleThumb:{width:14,height:14,borderRadius:999,background:t.white,transition:"transform .2s"},
  toggle:{width:38,height:22,borderRadius:11,display:"flex",alignItems:"center",padding:"0 3px",transition:"background .25s",flexShrink:0},
  toggleThumb:{width:16,height:16,borderRadius:999,background:t.white},
  pipelineBox:{marginTop:24,padding:"16px 16px 14px",background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:3,textAlign:"center"},
  pipeline:{display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",gap:3},
  pipeChip:{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",background:"rgba(31,59,49,.06)",borderRadius:2},

  // Steps
  stepTitle:{fontSize:"clamp(20px,3vw,26px)",fontWeight:800,letterSpacing:".04em",textTransform:"uppercase",margin:0,lineHeight:1.2},
  stepSub:{fontSize:13,color:t.muted,marginTop:8,lineHeight:1.5},
  woodGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  woodCard:{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"20px 10px 16px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",transition:"border-color .2s, background .2s",textAlign:"center"},
  woodLabel:{fontSize:13,fontWeight:700,letterSpacing:".02em",color:t.text},woodDesc:{fontSize:11,color:t.muted},
  checkBadge:{position:"absolute",top:8,right:10,width:20,height:20,borderRadius:999,background:t.brand,color:t.white,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},
  dimVisual:{display:"flex",justifyContent:"center",marginBottom:22},
  dimBox:{width:120,height:80,border:`1.5px solid ${t.border}`,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",background:`repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(200,197,187,.12) 6px,rgba(200,197,187,.12) 7px)`},
  extrasGrid:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10},
  extraCard:{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 6px 12px",border:"1.5px solid",borderRadius:3,cursor:"pointer",fontFamily:"inherit",transition:"border-color .2s, background .2s"},
  miniCheck:{position:"absolute",top:5,right:5,width:16,height:16,borderRadius:999,background:t.brand,color:t.white,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},
  summarySection:{background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"6px 0",overflow:"hidden"},
  summaryRow:{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"9px 16px",gap:12},
  summaryLabel:{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:t.muted,flexShrink:0},
  summaryValue:{fontSize:13,textAlign:"right",color:t.text,wordBreak:"break-word"},
  defaultsBar:{marginTop:10,padding:"10px 14px",background:"rgba(200,197,187,.15)",borderRadius:3,display:"flex",flexWrap:"wrap",alignItems:"center",gap:6},
  defaultChip:{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:2,background:"rgba(31,59,49,.08)",color:t.brand,letterSpacing:".02em"},
  infoBox:{background:"rgba(31,59,49,.04)",border:`1px solid ${t.border}`,borderRadius:3,padding:"14px 16px",marginTop:14},
  label:{display:"block",fontSize:12,fontWeight:600,letterSpacing:".03em",marginBottom:6,color:t.text},
  input:{width:"100%",height:44,padding:"0 14px",fontSize:14,fontFamily:"inherit",color:t.text,background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:2,boxSizing:"border-box"},
  select:{width:"100%",height:44,padding:"0 36px 0 14px",fontSize:14,fontFamily:"inherit",color:t.text,background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:2,cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%235b615b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",boxSizing:"border-box"},
  textarea:{width:"100%",height:90,padding:"12px 14px",fontSize:14,fontFamily:"inherit",color:t.text,background:t.fieldBg,border:`1px solid ${t.border}`,borderRadius:2,resize:"vertical",lineHeight:1.5,boxSizing:"border-box"},
  toggleBtn:{flex:1,height:42,border:"1.5px solid",borderRadius:2,fontSize:13,fontFamily:"inherit",cursor:"pointer",transition:"all .2s"},
  checkItem:{display:"flex",alignItems:"center",gap:8,cursor:"pointer"},checkbox:{width:18,height:18,accentColor:t.brand,cursor:"pointer",flexShrink:0},
  errorText:{fontSize:12,color:t.error,marginTop:8},
  bottomBar:{position:"sticky",bottom:0,background:t.bg,borderTop:`1px solid ${t.border}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,zIndex:20},
  dots:{display:"flex",gap:6},dot:{width:7,height:7,borderRadius:999,transition:"background .3s"},
  navBtn:{display:"inline-flex",alignItems:"center",justifyContent:"center",height:40,padding:"0 18px",fontSize:12,fontFamily:"inherit",fontWeight:600,letterSpacing:".04em",textTransform:"uppercase",borderRadius:2,cursor:"pointer",userSelect:"none",border:"none",whiteSpace:"nowrap"},
  navBtnOutline:{color:t.text,background:"transparent",border:`1px solid ${t.border}`},navBtnSolid:{color:t.white,background:t.brand,border:`1px solid ${t.brand}`},
};