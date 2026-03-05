import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { send, listen, autoResize, saveProgress, loadProgress, clearProgress, submitConfig, requestCheckout } from "./bridge.js";

/* -- Data -- */
import { holzarten, oberflaechen, berge, schriftarten, OPTIONAL_STEPS, FIXED_STEP_IDS, DEFAULT_FORM, DIM_FIELDS, t } from "./data/constants";
import { DEFAULT_CONSTR, DEFAULT_PRICING, makeDefaultDimConfig, computeLimits, computePrice, hooksFor } from "./data/pricing";

/* -- Context -- */
import { WizardProvider } from "./context/WizardContext";

/* -- Hooks -- */
import useToggleSet from "./hooks/useToggleSet";
import useConfigManager from "./hooks/useConfigManager";

/* -- UI Components -- */
import Shell from "./components/ui/Shell";
import Fade from "./components/ui/Fade";
import CollapsibleSection from "./components/ui/CollapsibleSection";
import PhoneFrame from "./components/ui/PhoneFrame";

/* -- Phase Components -- */
import PhaseTypen from "./components/phases/PhaseTypen";
import PhaseDone from "./components/phases/PhaseDone";
import PhaseWizard from "./components/phases/PhaseWizard";

/* -- Step Components (used in preview mode) -- */
import StepHolzart from "./components/steps/StepHolzart";
import StepMasse from "./components/steps/StepMasse";
import StepAusfuehrung from "./components/steps/StepAusfuehrung";
import StepExtras from "./components/steps/StepExtras";
import StepKontakt from "./components/steps/StepKontakt";
import StepUebersicht from "./components/steps/StepUebersicht";

/* -- Admin Components -- */
import AdminHeader from "./components/admin/AdminHeader";
import AdminTypeDefaults from "./components/admin/AdminTypeDefaults";
import AdminBergDisplay from "./components/admin/AdminBergDisplay";
import AdminConstraints from "./components/admin/AdminConstraints";
import AdminWoodSelection from "./components/admin/AdminWoodSelection";
import AdminDimensions from "./components/admin/AdminDimensions";
import AdminSteps from "./components/admin/AdminSteps";
import AdminPricing from "./components/admin/AdminPricing";
import AdminImportExport from "./components/admin/AdminImportExport";
import StepPipeline from "./components/admin/StepPipeline";
import FinancialSummary from "./components/admin/FinancialSummary";

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

  /* -- Toggle sets (holzarten, schriftarten, berge) -- */
  const holzToggle = useToggleSet(holzarten, form.holzart, useCallback((v) => setForm((f) => ({ ...f, holzart: v })), []));
  const schriftToggle = useToggleSet(schriftarten, form.schriftart, useCallback((v) => setForm((f) => ({ ...f, schriftart: v })), []));
  const bergToggle = useToggleSet(berge, form.berg, useCallback((v) => setForm((f) => ({ ...f, berg: v })), []));

  const [bergDisplay, setBergDisplay] = useState({ mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" });
  const setBergDisp = (key, val) => setBergDisplay((p) => ({ ...p, [key]: val }));

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
  const setConstrVal = (key, val) => setConstr((p) => ({ ...p, [key]: Math.max(1, parseInt(val) || 0) }));

  /* -- Config manager -- */
  const configManager = useConfigManager({
    constr, setConstr, dimConfig, setDimConfig,
    enabledHolzarten: holzToggle.enabled, setEnabledHolzarten: holzToggle.setEnabled,
    enabledSchriftarten: schriftToggle.enabled, setEnabledSchriftarten: schriftToggle.setEnabled,
    enabledBerge: bergToggle.enabled, setEnabledBerge: bergToggle.setEnabled,
    bergDisplay, setBergDisplay, enabledSteps, setEnabledSteps, pricing, setPricing, stepOrder, setStepOrder,
  });

  const [shake, setShake] = useState(false);
  const [flow, setFlow] = useState("ltr");
  const [navDir, setNavDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const shellRef = useRef(null);

  /* -- Refs for stable access in message handlers (avoids stale closure in mount-only useEffect) -- */
  const formRef = useRef(form);
  formRef.current = form;
  const pricingRef = useRef(pricing);
  pricingRef.current = pricing;
  const progressLoadedRef = useRef(progressLoaded);
  progressLoadedRef.current = progressLoaded;
  const configManagerRef = useRef(configManager);
  configManagerRef.current = configManager;

  const [sessionId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);

  const limits = useMemo(() => computeLimits(form, constr), [form.typ, form.schriftzug, form.breite, constr]);
  const activeSteps = useMemo(() => stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)), [stepOrder, enabledSteps]);
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
    const maxH = hooksFor(parseInt(nf.breite), constr);
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
  const doSubmit = () => {
    if (!validate() || submitting) return;
    setSubmitting(true); setCheckoutError(null);
    const price = computePrice(form, pricing);
    const config = {
      holzart: form.holzart, oberflaeche: form.oberflaeche,
      breite: parseInt(form.breite), hoehe: parseInt(form.hoehe), tiefe: parseInt(form.tiefe),
      haken: parseInt(form.haken), hakenMaterial: form.hakenmaterial,
      extras: form.extras, berg: form.berg, schriftart: form.schriftart,
      namenszug: form.schriftzug, preis: Math.round(price.customerPrice),
      typ: form.typ, hutablage: form.hutablage, bemerkungen: form.bemerkungen,
      anrede: form.anrede, vorname: form.vorname, nachname: form.nachname,
      email: form.email, telefon: form.telefon, strasse: form.strasse, plz: form.plz, ort: form.ort,
    };
    submitConfig(config, sessionId);
    send("order-submit", { order: form });
  };

  useEffect(() => {
    if (phase === "wizard") send("step-change", { step: currentStepId, index: wizardIndex, total: totalSteps });
  }, [wizardIndex, phase, currentStepId, totalSteps]);

  useEffect(() => { shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [wizardIndex, phase]);

  useEffect(() => {
    const cleanupResize = autoResize();
    const cleanupListen = listen({
      "config-load": (msg) => { if (msg.config) configManagerRef.current.applyConfig(msg.config); },
      "set-mode": (msg) => { if (msg.mode) setMode(msg.mode); },
      "set-background": (msg) => { if (msg.color) document.documentElement.style.setProperty("--wz-bg", msg.color); },
      "progress-loaded": (msg) => {
        if (msg.state && !progressLoadedRef.current) {
          const s = msg.state;
          if (s.form) setForm(s.form);
          if (s.phase) setPhase(s.phase);
          if (s.wizardIndex != null) setWizardIndex(s.wizardIndex);
        }
        setProgressLoaded(true);
      },
      "admin-settings": (msg) => {
        if (msg.pricing) setPricing(msg.pricing);
        if (msg.constraints) setConstr(msg.constraints);
        setMode("admin");
      },
      "settings-saved": () => {},
      "config-saved": (msg) => {
        if (msg.success && msg.configId) {
          setConfigId(msg.configId);
          const f = formRef.current;
          const price = computePrice(f, pricingRef.current);
          const wood = holzarten.find((h) => h.value === f.holzart);
          const summary = `${wood?.label || f.holzart} ${f.breite}\u00D7${f.hoehe}\u00D7${f.tiefe}cm`;
          requestCheckout(msg.configId, Math.round(price.customerPrice), summary);
        } else {
          setSubmitting(false);
          setCheckoutError(msg.error || "Konfiguration konnte nicht gespeichert werden.");
        }
      },
      "checkout-ready": (msg) => {
        setSubmitting(false); clearProgress();
        if (msg.checkoutUrl) setPhase("done");
      },
      "checkout-error": (msg) => {
        setSubmitting(false);
        setCheckoutError(msg.error || "Checkout konnte nicht erstellt werden.");
      },
    });
    send("ready"); loadProgress();
    return () => { cleanupResize(); cleanupListen(); };
  }, []);

  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!progressLoaded || isAdmin || phase === "done") return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveProgress({ form, phase, wizardIndex }); }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [form, phase, wizardIndex, progressLoaded, isAdmin]);

  const skippedSteps = useMemo(() => OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id]), [enabledSteps]);

  /* -- Wizard context value (shared by all step/phase components) -- */
  const wizardCtx = useMemo(() => ({
    form, set, errors, limits, constr, dimConfig, pricing,
    toggleExtra, skippedSteps, activeHolzarten: holzToggle.active,
  }), [form, errors, limits, constr, dimConfig, pricing, skippedSteps, holzToggle.active]);

  /* ---- MODE: ADMIN ---- */
  if (isAdmin && mode === "admin") {
    return (
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
        <AdminHeader mode={mode} onModeChange={setMode} />
        <main className="flex-1 flex justify-center px-4 py-6 pb-24 cq-main-md cq-main-lg cq-main-xl">
          <div className="w-full max-w-[520px] cq-admin-card-md cq-admin-card-lg cq-admin-card-xl">
            <Fade>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-normal uppercase m-0 leading-tight mb-1.5" style={{ fontSize: "clamp(18px,3vw,26px)" }}>Admin-Konfiguration</h1>
                <p className="text-[13px] text-muted">Produktparameter, Schritte und Preise verwalten</p>
              </div>
              <div className="cq-admin-grid">
                <CollapsibleSection id="typeDefaults" title="Produkt-Typ Vorgaben" summary={form.typ ? (form.typ === "schriftzug" ? `\u270F\uFE0F "${form.schriftzug}"` : `\u26F0\uFE0F ${berge.find(b => b.value === form.berg)?.label || "\u2013"}`) : "Nicht gesetzt"} icon="\uD83C\uDFF7" open={adminSections.typeDefaults} onToggle={toggleSection}>
                  <AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} enabledSchriftarten={schriftToggle.enabled} toggleSchriftart={schriftToggle.toggle} enabledBerge={bergToggle.enabled} toggleBerg={bergToggle.toggle} bergDisplay={bergDisplay} />
                </CollapsibleSection>
                <CollapsibleSection id="bergDisplay" title="Bergmotiv-Darstellung" summary={`${bergDisplay.mode === "relief" ? "Relief" : "Clean"} \u00B7 ${[bergDisplay.showName && "Name", bergDisplay.showHeight && "Höhe", bergDisplay.showRegion && "Region"].filter(Boolean).join(", ") || "Keine Labels"}`} icon="\uD83C\uDFD4" open={adminSections.bergDisplay} onToggle={toggleSection}>
                  <AdminBergDisplay bergDisplay={bergDisplay} setBergDisp={setBergDisp} />
                </CollapsibleSection>
                <CollapsibleSection id="constraints" title="Produktgrenzen" summary={`${constr.MIN_W}\u2013${constr.MAX_W} cm B, ${constr.MIN_H}\u2013${constr.MAX_H} cm H`} icon="\uD83D\uDCCF" open={adminSections.constraints} onToggle={toggleSection}>
                  <AdminConstraints constr={constr} setConstrVal={setConstrVal} limits={limits} />
                </CollapsibleSection>
                <CollapsibleSection id="wood" title="Holzarten" summary={`${holzToggle.active.length} von ${holzarten.length} aktiv`} icon="\u{1FAB5}" open={adminSections.wood} onToggle={toggleSection}>
                  <AdminWoodSelection enabledHolzarten={holzToggle.enabled} toggleHolz={holzToggle.toggle} activeCount={holzToggle.active.length} />
                </CollapsibleSection>
                <CollapsibleSection id="dimensions" title="Abmessungen" summary={DIM_FIELDS.map(d => `${d.label}: ${dimConfig[d.key].mode}`).join(", ")} icon="\uD83D\uDCD0" open={adminSections.dimensions} onToggle={toggleSection}>
                  <AdminDimensions constr={constr} dimConfig={dimConfig} setDim={setDim} addPreset={addPreset} removePreset={removePreset} />
                </CollapsibleSection>
                <CollapsibleSection id="steps" title="Wizard-Schritte" summary={`${OPTIONAL_STEPS.filter(s => enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`} icon="\uD83D\uDD00" open={adminSections.steps} onToggle={toggleSection}>
                  <AdminSteps enabledSteps={enabledSteps} toggleStep={toggleStep} stepOrder={stepOrder} />
                </CollapsibleSection>
                <CollapsibleSection id="pricing" title="Preiskalkulation" summary={`Marge ${pricing.margin}x (${Math.round((pricing.margin - 1) * 100)}%)`} icon="\uD83D\uDCB0" open={adminSections.pricing} onToggle={toggleSection}>
                  <AdminPricing pricing={pricing} setPricing={setPricing} />
                </CollapsibleSection>
                <CollapsibleSection id="importExport" title="Import / Export" summary="Parameter als JSON" icon="\uD83D\uDCE6" open={adminSections.importExport} onToggle={toggleSection}>
                  <AdminImportExport onExport={configManager.exportParams} onImport={configManager.importParams} />
                </CollapsibleSection>
              </div>
            </Fade>
          </div>
        </main>
      </div>
    );
  }

  /* ---- MODE: PREVIEW ---- */
  if (isAdmin && mode === "preview") {
    return (
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
        <AdminHeader mode={mode} onModeChange={setMode} />
        <main className="flex-1 flex flex-col items-center gap-6 px-4 py-6 pb-24 cq-main-md cq-main-lg cq-main-xl">
          <div className="w-full max-w-[520px]">
            <StepPipeline stepOrder={stepOrder} setStepOrder={setStepOrder} enabledSteps={enabledSteps} toggleStep={toggleStep} />
          </div>
          <PhoneFrame>
            <div className="text-xs font-bold tracking-widest uppercase text-muted text-center py-2 bg-[rgba(31,59,49,0.04)]">Kunden-Ansicht</div>
            {phase === "typen" && (
              <div className="p-3">
                <div className="text-center mb-4">
                  <h1 className="text-lg font-bold tracking-normal uppercase m-0 leading-tight">Garderobe bestellen</h1>
                  <p className="text-[11px] text-muted">Massanfertigung aus Schweizer Holz</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
                    className={`flex flex-col items-center gap-2 p-2.5 border-[1.5px] rounded cursor-pointer font-body transition-all duration-200 text-center ${form.typ === "schriftzug" ? 'border-brand bg-brand-light' : 'border-border bg-field'}`}>
                    <span className="text-[11px] font-bold tracking-normal uppercase text-text">Schriftzug</span>
                  </button>
                  <button onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
                    className={`flex flex-col items-center gap-2 p-2.5 border-[1.5px] rounded cursor-pointer font-body transition-all duration-200 text-center ${form.typ === "bergmotiv" ? 'border-brand bg-brand-light' : 'border-border bg-field'}`}>
                    <span className="text-[11px] font-bold tracking-normal uppercase text-text">Bergmotiv</span>
                  </button>
                </div>
                <div className="flex justify-center mt-4">
                  <button className="inline-flex items-center justify-center h-9 px-5 text-[11px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-white bg-brand border border-brand" onClick={() => {
                    const e = {};
                    if (!form.typ) e.typ = true;
                    if (form.typ === "schriftzug" && !form.schriftzug.trim()) e.schriftzug = true;
                    if (form.typ === "schriftzug" && limits.textTooLong) e.schriftzug = true;
                    if (form.typ === "schriftzug" && !form.schriftart) e.schriftart = true;
                    if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
                    setErrors(e); if (Object.keys(e).length) return; startWizard();
                  }}>Weiter {"\u2192"}</button>
                </div>
              </div>
            )}
            {phase === "wizard" && (
              <div className="p-3">
                <div className="mb-3">
                  {currentStepId === "holzart" && <StepHolzart form={form} set={set} errors={errors} holzarten={holzToggle.active} />}
                  {currentStepId === "masse" && <StepMasse form={form} set={set} errors={errors} limits={limits} constr={constr} dimConfig={dimConfig} />}
                  {currentStepId === "ausfuehrung" && <StepAusfuehrung form={form} set={set} limits={limits} constr={constr} />}
                  {currentStepId === "extras" && <StepExtras form={form} toggleExtra={toggleExtra} set={set} />}
                  {currentStepId === "kontakt" && <StepKontakt form={form} set={set} errors={errors} />}
                  {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} pricing={pricing} />}
                </div>
                <div className="flex justify-between gap-2">
                  <button className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border" onClick={wizardIndex === 0 ? () => setPhase("typen") : prev}>{"\u2190"} Zur{"ü"}ck</button>
                  {currentStepId !== "uebersicht"
                    ? <button className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-white bg-brand border border-brand" onClick={next}>Weiter {"\u2192"}</button>
                    : <button className={`inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-white bg-brand border border-brand ${submitting ? 'opacity-60' : ''}`} onClick={doSubmit} disabled={submitting}>{submitting ? "Wird gesendet\u2026" : "Bestellen"}</button>}
                </div>
              </div>
            )}
            {phase === "done" && (
              <div className="text-center p-5">
                <div className="text-4xl mb-3">{"\u2713"}</div>
                <p className="text-[13px] text-muted">Vielen Dank!</p>
                <button className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border mt-3" onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }}>Neu starten</button>
              </div>
            )}
          </PhoneFrame>
          <div className="w-full max-w-[520px]">
            <FinancialSummary form={form} pricing={pricing} />
          </div>
        </main>
      </div>
    );
  }

  /* ---- WORKFLOW: TYPEN ---- */
  if (phase === "typen") {
    return (
      <WizardProvider value={wizardCtx}>
        <Shell r={shellRef}>
          <main className="flex-1 flex justify-center px-4 py-6 pb-24 cq-main-md cq-main-lg cq-main-xl">
            <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
              <PhaseTypen
                activeSchriftarten={schriftToggle.active} activeBerge={bergToggle.active}
                bergDisplay={bergDisplay} startWizard={startWizard} triggerShake={triggerShake} setErrors={setErrors}
              />
            </div>
          </main>
        </Shell>
      </WizardProvider>
    );
  }

  /* ---- WORKFLOW: DONE ---- */
  if (phase === "done") {
    return (
      <Shell r={shellRef}>
        <main className="flex-1 flex justify-center px-4 py-6 pb-24 cq-main-md cq-main-lg cq-main-xl">
          <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
            <PhaseDone
              checkoutError={checkoutError} setPhase={setPhase} setForm={setForm}
              setConfigId={setConfigId} setCheckoutError={setCheckoutError} setSubmitting={setSubmitting}
            />
          </div>
        </main>
      </Shell>
    );
  }

  /* ---- WORKFLOW: WIZARD ---- */
  return (
    <WizardProvider value={wizardCtx}>
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased" ref={shellRef}>
        <PhaseWizard
          activeSteps={activeSteps} wizardIndex={wizardIndex} currentStepId={currentStepId}
          setPhase={setPhase} prev={prev} next={next} doSubmit={doSubmit} submitting={submitting} checkoutError={checkoutError}
          flow={flow} setFlow={setFlow} navDir={navDir} animKey={animKey} shake={shake}
          setNavDir={setNavDir} setWizardIndex={setWizardIndex} setAnimKey={setAnimKey}
        />
      </div>
    </WizardProvider>
  );
}
