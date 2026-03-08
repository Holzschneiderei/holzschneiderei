import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { send, listen, autoResize, saveProgress, loadProgress, clearProgress, submitConfig, requestCheckout } from "./bridge.js";

/* -- Data -- */
import { holzarten, oberflaechen, berge, schriftarten, OPTIONAL_STEPS, FIXED_STEP_IDS, DEFAULT_FORM, DEFAULT_TEXTS, DIM_FIELDS, t } from "./data/constants";
import { DEFAULT_CONSTR, DEFAULT_PRICING, makeDefaultDimConfig, computeLimits, computePrice, hooksFor } from "./data/pricing";
import { DEFAULT_HOLZARTEN, DEFAULT_OBERFLAECHEN, DEFAULT_EXTRAS_OPTIONS, DEFAULT_HAKEN_MATERIALIEN, DEFAULT_BERGE, DEFAULT_SCHRIFTARTEN, DEFAULT_DARSTELLUNGEN, getActiveItems } from "./data/optionLists";
import { DEFAULT_PRODUCTS, computeFixedPrice } from "./data/products";
import { DEFAULT_SHOWROOM, hydrateForm } from "./data/showroom";
import { generateAndSendScript } from "./lib/fusion-script-generator";

/* -- Context -- */
import { WizardProvider } from "./context/WizardContext";

/* -- Hooks -- */
import useToggleSet from "./hooks/useToggleSet";
import useOptionList from "./hooks/useOptionList";
import useConfigManager from "./hooks/useConfigManager";

/* -- UI Components -- */
import Shell from "./components/ui/Shell";
import Fade from "./components/ui/Fade";
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
import StepDarstellung from "./components/steps/StepDarstellung";
import StepKontakt from "./components/steps/StepKontakt";
import StepUebersicht from "./components/steps/StepUebersicht";

/* -- Admin Components -- */
import AdminHeader from "./components/admin/AdminHeader";
import AdminLayout from "./components/admin/AdminLayout";
import AdminTypeDefaults from "./components/admin/AdminTypeDefaults";
import AdminBergDisplay from "./components/admin/AdminBergDisplay";
import AdminConstraints from "./components/admin/AdminConstraints";
import AdminWoodSelection from "./components/admin/AdminWoodSelection";
import AdminOptionList from "./components/admin/AdminOptionList";
import AdminDimensions from "./components/admin/AdminDimensions";
import AdminSteps from "./components/admin/AdminSteps";
import AdminPricing from "./components/admin/AdminPricing";
import AdminProducts from "./components/admin/AdminProducts";
import AdminImportExport from "./components/admin/AdminImportExport";
import AdminFusion from "./components/admin/AdminFusion";
import AdminWithPreview from "./components/admin/AdminWithPreview";
import AdminOptions from "./components/admin/AdminOptions";
import AdminProduktwahl from "./components/admin/AdminProduktwahl";
import AdminShowroom from "./components/admin/AdminShowroom";
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
  const [constr, setConstr] = useState({ ...DEFAULT_CONSTR });
  const [dimConfig, setDimConfig] = useState(() => makeDefaultDimConfig(DEFAULT_CONSTR));
  const [enabledSteps, setEnabledSteps] = useState(
    OPTIONAL_STEPS.reduce((acc, s) => ({ ...acc, [s.id]: s.defaultOn }), {})
  );
  const [wizardIndex, setWizardIndex] = useState(0);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});

  /* -- Category visibility (hides entire option categories from customer UI) -- */
  const [categoryVisibility, setCategoryVisibility] = useState({
    holzarten: true, oberflaechen: true, extras: true, hakenMaterialien: true, darstellungen: true,
  });
  const toggleCategory = (key) => setCategoryVisibility((p) => ({ ...p, [key]: !p[key] }));

  /* -- Toggle sets (holzarten, schriftarten, berge) -- */
  const holzToggle = useToggleSet(holzarten, form.holzart, useCallback((v) => setForm((f) => ({ ...f, holzart: v })), []));
  const schriftToggle = useToggleSet(schriftarten, form.schriftart, useCallback((v) => setForm((f) => ({ ...f, schriftart: v })), []));
  const bergToggle = useToggleSet(berge, form.berg, useCallback((v) => setForm((f) => ({ ...f, berg: v })), []));

  /* -- Option lists (CMS-driven, full CRUD) -- */
  const oberflaechenList = useOptionList(DEFAULT_OBERFLAECHEN, form.oberflaeche, useCallback((v) => setForm((f) => ({ ...f, oberflaeche: v })), []));
  const extrasList = useOptionList(DEFAULT_EXTRAS_OPTIONS, null, null);
  const hakenMatList = useOptionList(DEFAULT_HAKEN_MATERIALIEN, form.hakenmaterial, useCallback((v) => setForm((f) => ({ ...f, hakenmaterial: v })), []));
  const darstellungList = useOptionList(DEFAULT_DARSTELLUNGEN, form.darstellung, useCallback((v) => setForm((f) => ({ ...f, darstellung: v })), []));

  /* -- Products -- */
  const [products, setProducts] = useState(() => DEFAULT_PRODUCTS.map((p) => ({ ...p })));
  const [fusionEnabled, setFusionEnabled] = useState(false);
  const [texts, setTexts] = useState(() => JSON.parse(JSON.stringify(DEFAULT_TEXTS)));
  const [showroom, setShowroom] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SHOWROOM)));
  const activeProduct = useMemo(() => products.find((p) => p.id === form.product && p.enabled && !p.comingSoon), [products, form.product]);

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
    oberflaechenItems: oberflaechenList.items, setOberflaechenItems: oberflaechenList.setItems,
    extrasItems: extrasList.items, setExtrasItems: extrasList.setItems,
    hakenMatItems: hakenMatList.items, setHakenMatItems: hakenMatList.setItems,
    darstellungItems: darstellungList.items, setDarstellungItems: darstellungList.setItems,
    products, setProducts,
    categoryVisibility, setCategoryVisibility,
    fusionEnabled, setFusionEnabled,
    texts, setTexts,
    showroom, setShowroom,
  });

  const [shake, setShake] = useState(false);
  const [navDir, setNavDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const shellRef = useRef(null);

  const [sessionId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);

  /* -- Refs for stable access in message handlers (avoids stale closure in mount-only useEffect) -- */
  const formRef = useRef(form);
  formRef.current = form;
  const pricingRef = useRef(pricing);
  pricingRef.current = pricing;
  const progressLoadedRef = useRef(progressLoaded);
  progressLoadedRef.current = progressLoaded;
  const configManagerRef = useRef(configManager);
  configManagerRef.current = configManager;
  const productsRef = useRef(products);
  productsRef.current = products;
  const constrRef = useRef(constr);
  constrRef.current = constr;
  const fusionEnabledRef = useRef(fusionEnabled);
  fusionEnabledRef.current = fusionEnabled;

  const limits = useMemo(() => computeLimits(form, constr), [form.typ, form.schriftzug, form.breite, constr]);
  const activeSteps = useMemo(() => stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)), [stepOrder, enabledSteps]);
  const totalSteps = activeSteps.length;
  const currentStepId = activeSteps[wizardIndex];

  const toggleStep = (id) => { const s = OPTIONAL_STEPS.find((x) => x.id === id); if (s?.required) return; setEnabledSteps((p) => ({ ...p, [id]: !p[id] })); };
  const set = (key, val) => { setForm((p) => ({ ...p, [key]: val })); setErrors((p) => { const n = { ...p }; delete n[key]; return n; }); };
  const setFieldError = (key, msg) => setErrors((p) => msg ? { ...p, [key]: msg } : (() => { const n = { ...p }; delete n[key]; return n; })());
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

  const startPreset = (preset) => {
    const hydrated = hydrateForm(DEFAULT_FORM, preset);
    const prod = products.find(p => p.id === preset.productId);
    if (prod) {
      if (prod.motif === "schriftzug" || prod.id === "schriftzug") {
        hydrated.typ = "schriftzug";
      } else if (prod.id === "bergmotiv") {
        hydrated.typ = "bergmotiv";
      }
    }
    OPTIONAL_STEPS.forEach((s) => {
      if (!enabledSteps[s.id] && s.defaults) Object.assign(hydrated, s.defaults);
    });
    const lim = computeLimits(hydrated, constr);
    const w = parseInt(hydrated.breite) || lim.minW;
    hydrated.breite = String(Math.max(lim.minW, Math.min(lim.maxW, w)));
    const maxH = hooksFor(parseInt(hydrated.breite), constr);
    const h = parseInt(hydrated.haken) || maxH;
    hydrated.haken = String(Math.min(h, maxH));
    setForm(hydrated);
    setErrors({});
    setNavDir(1);
    setAnimKey(k => k + 1);
    if (preset.clickBehavior === "summary") {
      const prod2 = products.find(p => p.id === preset.productId);
      const steps = [...(prod2?.steps || []).filter(id => enabledSteps[id] || FIXED_STEP_IDS.includes(id))];
      setWizardIndex(Math.max(0, steps.length - 1));
      setPhase("wizard");
    } else {
      setWizardIndex(0);
      setPhase("wizard");
    }
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validate = () => {
    const e = {};
    if (currentStepId === "motiv") {
      if (form.typ === "schriftzug") {
        if (!form.schriftzug.trim()) e.schriftzug = true;
        if (limits.textTooLong) e.schriftzug = true;
        if (!form.schriftart) e.schriftart = true;
      }
      if (form.typ === "bergmotiv" && !form.berg) e.berg = true;
    }
    if (currentStepId === "holzart" && !form.holzart) e.holzart = true;
    if (currentStepId === "masse") {
      DIM_FIELDS.forEach((d) => {
        if (!dimConfig[d.key].enabled) return;
        if (!form[d.key]) { e[d.key] = `Bitte ${d.label} eingeben.`; return; }
        const v = parseInt(form[d.key]);
        const min = d.key === "breite" ? limits.minW : constr[d.constrMin];
        const max = d.key === "breite" ? limits.maxW : constr[d.constrMax];
        if (v < min || v > max) e[d.key] = `Wert muss zwischen ${min} und ${max} liegen.`;
      });
    }
    if (currentStepId === "kontakt") {
      if (!form.vorname.trim()) e.vorname = "Bitte Vorname eingeben.";
      if (!form.nachname.trim()) e.nachname = "Bitte Nachname eingeben.";
      if (!form.email.trim()) e.email = "Bitte E-Mail eingeben.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Bitte g\u00FCltige E-Mail eingeben.";
      if (!form.plz.trim()) e.plz = "Bitte PLZ eingeben.";
      if (!form.ort.trim()) e.ort = "Bitte Ort eingeben.";
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
      woodType: form.holzart, surfaceFinish: form.oberflaeche,
      width: parseInt(form.breite), height: parseInt(form.hoehe), depth: parseInt(form.tiefe),
      hooks: parseInt(form.haken), hookMaterial: form.hakenmaterial,
      extras: form.extras, mountainSilhouette: form.berg, font: form.schriftart,
      customName: form.schriftzug, price: Math.round(price.customerPrice),
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

          // Fire-and-forget: generate Fusion 360 script and email to workshop
          if (fusionEnabledRef.current) {
            generateAndSendScript(f, msg.configId, productsRef.current, constrRef.current, pricingRef.current)
              .catch(err => console.warn('Fusion script generation failed (non-blocking):', err));
          }
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
    form, set, setFieldError, errors, limits, constr, dimConfig, pricing,
    toggleExtra, skippedSteps, activeHolzarten: holzToggle.active,
    activeSchriftarten: schriftToggle.active,
    activeBerge: bergToggle.active,
    bergDisplay,
    activeOberflaechen: oberflaechenList.activeItems,
    activeExtras: extrasList.activeItems,
    activeHakenMat: hakenMatList.activeItems,
    activeDarstellungen: darstellungList.activeItems,
    activeProduct, products, categoryVisibility, fusionEnabled, isAdmin, texts, showroom,
  }), [form, errors, limits, constr, dimConfig, pricing, skippedSteps, holzToggle.active,
    schriftToggle.active, bergToggle.active, bergDisplay,
    oberflaechenList.activeItems, extrasList.activeItems, hakenMatList.activeItems, darstellungList.activeItems,
    activeProduct, products, categoryVisibility, fusionEnabled, isAdmin, texts, showroom]);

  /* ---- MODE: ADMIN ---- */
  const [activeAdminSection, setActiveAdminSection] = useState("products");
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved"
  const [previewStepOverride, setPreviewStepOverride] = useState(null);

  const PANEL_STEP_MAP = useMemo(() => ({
    holzarten: 'holzart',
    oberflaechen: 'ausfuehrung',
    extras: 'extras',
    hakenMaterialien: 'ausfuehrung',
    darstellungen: 'darstellung',
    bergDisplay: null,
  }), []);

  const handleOptionPanelChange = useCallback((panelId) => {
    setPreviewStepOverride(panelId ? PANEL_STEP_MAP[panelId] ?? null : null);
  }, [PANEL_STEP_MAP]);

  // Clear preview override when leaving the options section
  useEffect(() => {
    if (activeAdminSection !== 'options') setPreviewStepOverride(null);
  }, [activeAdminSection]);

  // Auto-save admin config to Wix parent on changes (debounced)
  const adminSaveRef = useRef(null);
  useEffect(() => {
    if (!isAdmin) return;
    clearTimeout(adminSaveRef.current);
    setSaveStatus("saving");
    adminSaveRef.current = setTimeout(() => {
      const config = configManagerRef.current.getConfig();
      send("config-save", { config });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
    return () => clearTimeout(adminSaveRef.current);
  }, [constr, dimConfig, enabledSteps, pricing, stepOrder, bergDisplay, products,
    holzToggle.enabled, schriftToggle.enabled, bergToggle.enabled,
    oberflaechenList.items, extrasList.items, hakenMatList.items, darstellungList.items, categoryVisibility, fusionEnabled, texts, showroom]);

  const adminSummaries = useMemo(() => ({
    products: `${products.filter(p => p.enabled).length} aktiv, ${products.filter(p => p.comingSoon).length} coming soon`,
    options: [
      `${holzToggle.active.length} Holz`,
      `${oberflaechenList.activeItems.length} Ofl.`,
      `${extrasList.activeItems.length} Extras`,
    ].join(", "),
    produktwahl: texts.produktwahl?.heading || "Dein Unikat gestalten",
    dimensions: `${constr.MIN_W}\u2013${constr.MAX_W} \u00D7 ${constr.MIN_H}\u2013${constr.MAX_H} cm`,
    steps: `${OPTIONAL_STEPS.filter(s => enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`,
    pricing: `Marge ${pricing.margin}x (${Math.round((pricing.margin - 1) * 100)}%)`,
    showroom: `${showroom.presets.filter(p => p.enabled).length} Presets`,
    fusion: fusionEnabled ? "Aktiviert" : "Deaktiviert",
    importExport: "JSON Import/Export",
  }), [products, holzToggle.active.length, oberflaechenList.activeItems.length, extrasList.activeItems.length,
    constr, enabledSteps, pricing, fusionEnabled, showroom]);

  const optionPanels = [
    { id: 'holzarten', icon: 'H', label: 'Holzarten', categoryKey: 'holzarten',
      summary: categoryVisibility.holzarten ? `${holzToggle.active.length} von ${holzarten.length} aktiv` : "Ausgeblendet",
      content: <AdminWoodSelection enabledHolzarten={holzToggle.enabled} toggleHolz={holzToggle.toggle} activeCount={holzToggle.active.length} /> },
    { id: 'oberflaechen', icon: 'O', label: 'Oberflächen', categoryKey: 'oberflaechen',
      summary: categoryVisibility.oberflaechen ? `${oberflaechenList.activeItems.length} von ${oberflaechenList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={oberflaechenList.items} onToggle={oberflaechenList.toggleItem} onAdd={oberflaechenList.addItem} onRemove={oberflaechenList.removeItem} onUpdate={oberflaechenList.updateItem} onReorder={oberflaechenList.reorderItems} addPlaceholder="Neue Oberfläche..." /> },
    { id: 'extras', icon: 'X', label: 'Extras', categoryKey: 'extras',
      summary: categoryVisibility.extras ? `${extrasList.activeItems.length} von ${extrasList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={extrasList.items} onToggle={extrasList.toggleItem} onAdd={extrasList.addItem} onRemove={extrasList.removeItem} onUpdate={extrasList.updateItem} onReorder={extrasList.reorderItems} addPlaceholder="Neues Extra..." renderMeta={(item) => item.meta?.icon && <span className="text-sm">{item.meta.icon}</span>} /> },
    { id: 'hakenMaterialien', icon: 'K', label: 'Hakenmaterial', categoryKey: 'hakenMaterialien',
      summary: categoryVisibility.hakenMaterialien ? `${hakenMatList.activeItems.length} von ${hakenMatList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={hakenMatList.items} onToggle={hakenMatList.toggleItem} onAdd={hakenMatList.addItem} onRemove={hakenMatList.removeItem} onUpdate={hakenMatList.updateItem} onReorder={hakenMatList.reorderItems} addPlaceholder="Neues Material..." /> },
    { id: 'darstellungen', icon: 'D', label: 'Darstellungen', categoryKey: 'darstellungen',
      summary: categoryVisibility.darstellungen ? `${darstellungList.activeItems.length} von ${darstellungList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={darstellungList.items} onToggle={darstellungList.toggleItem} onAdd={darstellungList.addItem} onRemove={darstellungList.removeItem} onUpdate={darstellungList.updateItem} onReorder={darstellungList.reorderItems} addPlaceholder="Neue Darstellung..." /> },
    { id: 'bergDisplay', icon: 'B', label: 'Bergmotiv',
      summary: `${bergDisplay.mode === "relief" ? "Relief" : "Clean"} \u00B7 ${[bergDisplay.showName && "Name", bergDisplay.showHeight && "H\u00F6he", bergDisplay.showRegion && "Region"].filter(Boolean).join(", ") || "Keine Labels"}`,
      content: <AdminBergDisplay bergDisplay={bergDisplay} setBergDisp={setBergDisp} /> },
  ];

  const adminSectionContent = {
    products: {
      title: "Produkte & Typen", desc: "Produkte verwalten, Typ-Vorgaben und Schriftzug/Berg konfigurieren",
      content: (
        <>
          <AdminProducts products={products} setProducts={setProducts} />
          <div className="border-t border-border my-5" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted mb-3">Produkt-Typ Vorgaben</h3>
          <AdminTypeDefaults form={form} set={set} constr={constr} limits={limits} enabledSchriftarten={schriftToggle.enabled} toggleSchriftart={schriftToggle.toggle} enabledBerge={bergToggle.enabled} toggleBerg={bergToggle.toggle} bergDisplay={bergDisplay} />
        </>
      ),
    },
    options: {
      title: "Optionen", desc: "Holzarten, Oberflächen, Extras und weitere Optionen verwalten",
      content: <AdminOptions panels={optionPanels} categoryVisibility={categoryVisibility} onToggleCategory={toggleCategory} onPanelChange={handleOptionPanelChange} />,
    },
    produktwahl: {
      title: "Produktwahl", desc: "Texte auf der Startseite des Konfigurators anpassen",
      content: <AdminProduktwahl texts={texts} setTexts={setTexts} />,
    },
    dimensions: {
      title: "Masse & Grenzen", desc: "Abmessungen, Eingabemodi und Produktgrenzen",
      content: (
        <>
          <AdminConstraints constr={constr} setConstrVal={setConstrVal} limits={limits} />
          <div className="border-t border-border my-5" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted mb-3">Eingabemodus & Presets</h3>
          <AdminDimensions constr={constr} dimConfig={dimConfig} setDim={setDim} addPreset={addPreset} removePreset={removePreset} />
        </>
      ),
    },
    steps: { title: "Wizard-Schritte", desc: "Schritte aktivieren/deaktivieren und Reihenfolge", content: <AdminSteps enabledSteps={enabledSteps} toggleStep={toggleStep} stepOrder={stepOrder} setStepOrder={setStepOrder} /> },
    pricing: { title: "Preiskalkulation", desc: "Material-, Arbeits- und Extras-Kosten, Marge", content: <AdminPricing pricing={pricing} setPricing={setPricing} oberflaechenList={oberflaechenList} extrasList={extrasList} hakenMatList={hakenMatList} />, after: <div className="mt-5"><FinancialSummary form={form} pricing={pricing} activeProduct={activeProduct} /></div> },
    showroom: {
      title: "Showroom",
      desc: "Vorkonfigurierte Produkte als CTA-Karten auf der Startseite",
      content: <AdminShowroom showroom={showroom} setShowroom={setShowroom} products={products} />,
    },
    fusion: { title: "Fusion 360", desc: "Automatische Script-Generierung für die Werkstatt", content: <AdminFusion enabled={fusionEnabled} onToggle={setFusionEnabled} /> },
    importExport: { title: "Import / Export", desc: "Konfiguration als JSON-Datei sichern oder laden", content: <AdminImportExport onExport={configManager.exportParams} onImport={configManager.importParams} /> },
  };

  /* -- Inline preview content (shared between admin modes) -- */
  const previewContent = (
    <WizardProvider value={wizardCtx}>
      <div className="text-xs font-bold tracking-widest uppercase text-muted text-center py-2 bg-[rgba(31,59,49,0.04)]">Kunden-Ansicht</div>
      {previewStepOverride && isAdmin ? (
        <div className="p-3">
          <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-muted text-center mb-3 pb-2 border-b border-border">
            {OPTIONAL_STEPS.find(s => s.id === previewStepOverride)?.icon}{" "}
            {OPTIONAL_STEPS.find(s => s.id === previewStepOverride)?.label || previewStepOverride}
          </div>
          {previewStepOverride === 'holzart' && <StepHolzart />}
          {previewStepOverride === 'ausfuehrung' && <StepAusfuehrung />}
          {previewStepOverride === 'extras' && <StepExtras />}
          {previewStepOverride === 'darstellung' && <StepDarstellung />}
        </div>
      ) : (
        <>
          {phase === "typen" && (
            <div className="p-3">
              <PhaseTypen startWizard={startWizard} startPreset={startPreset} triggerShake={triggerShake} setErrors={setErrors} />
            </div>
          )}
          {phase === "wizard" && (
            <div className="p-3">
              <PhaseWizard
                activeSteps={activeSteps} wizardIndex={wizardIndex} currentStepId={currentStepId}
                setPhase={setPhase} prev={prev} next={next} doSubmit={doSubmit} submitting={submitting} checkoutError={checkoutError}
                navDir={navDir} animKey={animKey} shake={shake}
                setNavDir={setNavDir} setWizardIndex={setWizardIndex} setAnimKey={setAnimKey}
                compact
              />
            </div>
          )}
          {phase === "done" && (
            <div className="text-center p-5">
              <div className="text-4xl mb-3">{"\u2713"}</div>
              <p className="text-[13px] text-muted">Vielen Dank!</p>
              <button className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border mt-3" onClick={() => { setPhase("typen"); setForm({ ...DEFAULT_FORM }); }}>Neu starten</button>
            </div>
          )}
        </>
      )}
    </WizardProvider>
  );

  if (isAdmin) {
    const section = adminSectionContent[activeAdminSection];
    const adminPanel = (
      <AdminLayout activeSection={activeAdminSection} onSectionChange={setActiveAdminSection} summaries={adminSummaries}>
        <div key={activeAdminSection} className="admin-section-animate">
          <div className="admin-section-header">
            <h2 className="admin-section-title">{section.title}</h2>
            <p className="admin-section-desc">{section.desc}</p>
          </div>
          <div className="admin-card">
            {section.content}
          </div>
          {section.after}
        </div>
      </AdminLayout>
    );

    return (
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
        <AdminHeader mode={mode} onModeChange={setMode} saveStatus={saveStatus} />
        <AdminWithPreview
          adminContent={adminPanel}
          previewContent={previewContent}
        />
      </div>
    );
  }

  /* ---- WORKFLOW: TYPEN ---- */
  if (phase === "typen") {
    return (
      <WizardProvider value={wizardCtx}>
        <Shell r={shellRef}>
          <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
            <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
              <PhaseTypen startWizard={startWizard} startPreset={startPreset} triggerShake={triggerShake} setErrors={setErrors} />
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
        <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
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
          navDir={navDir} animKey={animKey} shake={shake}
          setNavDir={setNavDir} setWizardIndex={setWizardIndex} setAnimKey={setAnimKey}
        />
      </div>
    </WizardProvider>
  );
}
