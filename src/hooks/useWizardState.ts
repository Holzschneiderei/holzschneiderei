import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { autoResize, clearProgress, listen, loadProgress, requestCheckout, saveProgress, send, submitConfig } from "../bridge";
import type { WizardContextValue } from "../context/WizardContext";
import { berge, DEFAULT_FORM, DEFAULT_TEXTS, DIM_FIELDS, FIXED_STEP_IDS, holzarten, OPTIONAL_STEPS, schriftarten } from "../data/constants";
import { DEFAULT_DARSTELLUNGEN, DEFAULT_EXTRAS_OPTIONS, DEFAULT_HAKEN_MATERIALIEN, DEFAULT_OBERFLAECHEN } from "../data/optionLists";
import { computeLimits, computePrice, DEFAULT_CONSTR, DEFAULT_PRICING, hooksFor, makeDefaultDimConfig } from "../data/pricing";
import { DEFAULT_PRODUCTS, getTypForProduct } from "../data/products";
import { DEFAULT_SHOWROOM, hydrateForm } from "../data/showroom";
import useConfigManager from "./useConfigManager";
import useOptionList from "./useOptionList";
import useToggleSet from "./useToggleSet";
import { generateAndSendScript } from "../lib/fusion-script-generator";
import type { AppConfig, BergDisplay, CategoryVisibility, Constraints, DimConfig, FormState, Limits, Preset, Pricing, Product, Showroom, Texts } from "../types/config";

export interface UseWizardStateReturn {
  phase: string;
  setPhase: React.Dispatch<React.SetStateAction<string>>;
  mode: string;
  isAdmin: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Partial<Record<keyof FormState, string | boolean>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof FormState, string | boolean>>>>;
  pricing: Pricing;
  setPricing: React.Dispatch<React.SetStateAction<Pricing>>;
  constr: Constraints;
  dimConfig: DimConfig;
  setDim: (key: string, field: string, val: unknown) => void;
  addPreset: (key: string, val: string) => void;
  removePreset: (key: string, val: number) => void;
  setConstrVal: (key: string, val: string) => void;
  enabledSteps: Record<string, boolean>;
  stepOrder: string[];
  setStepOrder: React.Dispatch<React.SetStateAction<string[]>>;
  categoryVisibility: CategoryVisibility;
  toggleCategory: (key: keyof CategoryVisibility) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  fusionEnabled: boolean;
  setFusionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  texts: Texts;
  setTexts: React.Dispatch<React.SetStateAction<Texts>>;
  showroom: Showroom;
  setShowroom: React.Dispatch<React.SetStateAction<Showroom>>;
  bergDisplay: BergDisplay;
  setBergDisp: (key: keyof BergDisplay, val: string | boolean) => void;
  limits: Limits;
  activeSteps: string[];
  totalSteps: number;
  wizardIndex: number;
  setWizardIndex: React.Dispatch<React.SetStateAction<number>>;
  currentStepId: string;
  skippedSteps: typeof OPTIONAL_STEPS;
  activeProduct: Product | null;
  holzToggle: ReturnType<typeof useToggleSet>;
  schriftToggle: ReturnType<typeof useToggleSet>;
  bergToggle: ReturnType<typeof useToggleSet>;
  oberflaechenList: ReturnType<typeof useOptionList>;
  extrasList: ReturnType<typeof useOptionList>;
  hakenMatList: ReturnType<typeof useOptionList>;
  darstellungList: ReturnType<typeof useOptionList>;
  configManager: ReturnType<typeof useConfigManager>;
  toggleStep: (id: string) => void;
  set: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  setFieldError: (key: keyof FormState, msg: string) => void;
  toggleExtra: (val: string) => void;
  startWizard: () => void;
  startPreset: (preset: Preset) => void;
  triggerShake: () => void;
  validate: () => boolean;
  next: () => void;
  prev: () => void;
  doSubmit: () => void;
  shake: boolean;
  navDir: number;
  setNavDir: React.Dispatch<React.SetStateAction<number>>;
  animKey: number;
  setAnimKey: React.Dispatch<React.SetStateAction<number>>;
  shellRef: React.RefObject<HTMLDivElement | null>;
  submitting: boolean;
  checkoutError: string | null;
  setConfigId: React.Dispatch<React.SetStateAction<string | null>>;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckoutError: React.Dispatch<React.SetStateAction<string | null>>;
  wizardCtx: WizardContextValue;
  progressLoaded: boolean;
  configManagerRef: React.RefObject<ReturnType<typeof useConfigManager>>;
}

export default function useWizardState(cachedConfig: Partial<AppConfig> | null): UseWizardStateReturn {
  const [phase, setPhase] = useState("typen");
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "admin" ? "admin" : "workflow";
    }
    return "workflow";
  });
  const isAdmin = mode !== "workflow";
  const [pricing, setPricing] = useState<Pricing>(() => cachedConfig?.pricing ?? { ...DEFAULT_PRICING });
  const [stepOrder, setStepOrder] = useState<string[]>(() =>
    cachedConfig?.stepOrder ?? [...OPTIONAL_STEPS.filter((s) => s.defaultOn).map((s) => s.id), ...FIXED_STEP_IDS]
  );
  const [constr, setConstr] = useState<Constraints>(() => cachedConfig?.constr ?? { ...DEFAULT_CONSTR });
  const [dimConfig, setDimConfig] = useState<DimConfig>(() => cachedConfig?.dimConfig ?? makeDefaultDimConfig(DEFAULT_CONSTR));
  const [enabledSteps, setEnabledSteps] = useState<Record<string, boolean>>(() =>
    cachedConfig?.enabledSteps ?? OPTIONAL_STEPS.reduce<Record<string, boolean>>((acc, s) => ({ ...acc, [s.id]: s.defaultOn }), {})
  );
  const [wizardIndex, setWizardIndex] = useState(0);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | boolean>>>({});

  const [categoryVisibility, setCategoryVisibility] = useState<CategoryVisibility>(() =>
    cachedConfig?.categoryVisibility ?? { holzarten: true, oberflaechen: true, extras: true, hakenMaterialien: true, darstellungen: true }
  );
  const toggleCategory = (key: keyof CategoryVisibility) => setCategoryVisibility((p) => ({ ...p, [key]: !p[key] }));

  const holzToggle = useToggleSet(holzarten, form.holzart, useCallback((v: string) => setForm((f) => ({ ...f, holzart: v })), []), cachedConfig?.enabledHolzarten);
  const schriftToggle = useToggleSet(schriftarten, form.schriftart, useCallback((v: string) => setForm((f) => ({ ...f, schriftart: v })), []), cachedConfig?.enabledSchriftarten);
  const bergToggle = useToggleSet(berge, form.berg, useCallback((v: string) => setForm((f) => ({ ...f, berg: v })), []), cachedConfig?.enabledBerge);

  const oberflaechenList = useOptionList(DEFAULT_OBERFLAECHEN, form.oberflaeche, useCallback((v: string) => setForm((f) => ({ ...f, oberflaeche: v })), []), cachedConfig?.oberflaechenItems);
  const extrasList = useOptionList(DEFAULT_EXTRAS_OPTIONS, "", undefined, cachedConfig?.extrasItems);
  const hakenMatList = useOptionList(DEFAULT_HAKEN_MATERIALIEN, form.hakenmaterial, useCallback((v: string) => setForm((f) => ({ ...f, hakenmaterial: v })), []), cachedConfig?.hakenMatItems);
  const darstellungList = useOptionList(DEFAULT_DARSTELLUNGEN, form.darstellung, useCallback((v: string) => setForm((f) => ({ ...f, darstellung: v })), []), cachedConfig?.darstellungItems);

  const [products, setProducts] = useState<Product[]>(() => cachedConfig?.products ?? DEFAULT_PRODUCTS.map((p) => ({ ...p })));
  const [fusionEnabled, setFusionEnabled] = useState(() => cachedConfig?.fusionEnabled ?? false);
  const [texts, setTexts] = useState<Texts>(() => cachedConfig?.texts ?? JSON.parse(JSON.stringify(DEFAULT_TEXTS)));
  const [showroom, setShowroom] = useState<Showroom>(() => cachedConfig?.showroom ?? JSON.parse(JSON.stringify(DEFAULT_SHOWROOM)));
  const activeProduct = useMemo(() => products.find((p) => p.id === form.product && p.enabled && !p.comingSoon) ?? null, [products, form.product]);

  const [bergDisplay, setBergDisplay] = useState<BergDisplay>(() => cachedConfig?.bergDisplay ?? { mode: "relief", showName: true, showHeight: true, showRegion: true, labelFont: "" });
  const setBergDisp = (key: keyof BergDisplay, val: string | boolean) => setBergDisplay((p) => ({ ...p, [key]: val }));

  const setDim = (key: string, field: string, val: unknown) => setDimConfig((p) => ({ ...p, [key]: { ...p[key]!, [field]: val } }));
  const addPreset = (key: string, val: string) => {
    const n = parseInt(val, 10); if (Number.isNaN(n)) return;
    setDimConfig((p) => {
      const cur = p[key]!.presets;
      if (cur.includes(n)) return p;
      return { ...p, [key]: { ...p[key]!, presets: [...cur, n].sort((a, b) => a - b) } };
    });
  };
  const removePreset = (key: string, val: number) => setDimConfig((p) => ({ ...p, [key]: { ...p[key]!, presets: p[key]!.presets.filter((v) => v !== val) } }));
  const setConstrVal = (key: string, val: string) => setConstr((p) => ({ ...p, [key]: Math.max(1, parseInt(val, 10) || 0) }));

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
  const shellRef = useRef<HTMLDivElement>(null);

  const [sessionId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [_configId, setConfigId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);

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

  const limits = useMemo(() => computeLimits(form, constr), [form.typ, form.schriftzug, form.breite, constr, form]);
  const activeSteps = useMemo(() => stepOrder.filter((id) => enabledSteps[id] || FIXED_STEP_IDS.includes(id)), [stepOrder, enabledSteps]);
  const totalSteps = activeSteps.length;
  const currentStepId = activeSteps[wizardIndex] ?? "";

  const toggleStep = (id: string) => { const s = OPTIONAL_STEPS.find((x) => x.id === id); if (s?.required) return; setEnabledSteps((p) => ({ ...p, [id]: !p[id] })); };
  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => { setForm((p) => ({ ...p, [key]: val })); setErrors((p) => { const n = { ...p }; delete n[key]; return n; }); }, []);
  const setFieldError = useCallback((key: keyof FormState, msg: string) => setErrors((p) => msg ? { ...p, [key]: msg } : (() => { const n = { ...p }; delete n[key]; return n; })()), []);
  const toggleExtra = useCallback((val: string) => setForm((p) => ({ ...p, extras: p.extras.includes(val) ? p.extras.filter((v) => v !== val) : [...p.extras, val] })), []);

  const startWizard = () => {
    const nf = { ...form };
    OPTIONAL_STEPS.forEach((s) => { if (!enabledSteps[s.id] && s.defaults) Object.assign(nf, s.defaults); });
    const lim = computeLimits(nf, constr);
    const w = parseInt(nf.breite, 10) || lim.minW;
    nf.breite = String(Math.max(lim.minW, Math.min(lim.maxW, w)));
    const maxH = hooksFor(parseInt(nf.breite, 10), constr);
    const h = parseInt(nf.haken, 10) || maxH;
    nf.haken = String(Math.min(h, maxH));
    setForm(nf); setWizardIndex(0); setErrors({}); setPhase("wizard"); setNavDir(1); setAnimKey((k) => k + 1);
  };

  const startPreset = (preset: Preset) => {
    const hydrated = hydrateForm(DEFAULT_FORM, preset);
    const prod = products.find(p => p.id === preset.productId);
    if (prod) {
      hydrated.typ = getTypForProduct(prod);
    }
    OPTIONAL_STEPS.forEach((s) => {
      if (!enabledSteps[s.id] && s.defaults) Object.assign(hydrated, s.defaults);
    });
    const lim = computeLimits(hydrated, constr);
    const w = parseInt(hydrated.breite, 10) || lim.minW;
    hydrated.breite = String(Math.max(lim.minW, Math.min(lim.maxW, w)));
    const maxH = hooksFor(parseInt(hydrated.breite, 10), constr);
    const h = parseInt(hydrated.haken, 10) || maxH;
    hydrated.haken = String(Math.min(h, maxH));
    setForm(hydrated);
    setErrors({});
    setNavDir(1);
    setAnimKey(k => k + 1);
    if (preset.clickBehavior === "summary") {
      const steps = [...(prod?.steps || []).filter(id => enabledSteps[id] || FIXED_STEP_IDS.includes(id))];
      setWizardIndex(Math.max(0, steps.length - 1));
      setPhase("wizard");
    } else {
      setWizardIndex(0);
      setPhase("wizard");
    }
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string | boolean>> = {};
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
        if (!dimConfig[d.key]?.enabled) return;
        const formVal = form[d.key];
        if (!formVal) { e[d.key] = `Bitte ${d.label} eingeben.`; return; }
        const v = parseInt(formVal, 10);
        const min = d.key === "breite" ? limits.minW : constr[d.constrMin];
        const max = d.key === "breite" ? limits.maxW : constr[d.constrMax];
        if (Number.isNaN(v) || v < min || v > max) e[d.key] = `Wert muss zwischen ${min} und ${max} liegen.`;
      });
    }
    if (currentStepId === "kontakt") {
      if (!form.vorname.trim()) e.vorname = "Bitte Vorname eingeben.";
      if (!form.nachname.trim()) e.nachname = "Bitte Nachname eingeben.";
      if (!form.email.trim()) e.email = "Bitte E-Mail eingeben.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Bitte gültige E-Mail eingeben.";
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
      width: parseInt(form.breite, 10), height: parseInt(form.hoehe, 10), depth: parseInt(form.tiefe, 10),
      hooks: parseInt(form.haken, 10), hookMaterial: form.hakenmaterial,
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

  useEffect(() => { shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  useEffect(() => {
    const cleanupResize = autoResize();
    const cleanupListen = listen({
      "config-load": (msg) => {
        if (msg.config) {
          const result = configManagerRef.current.applyConfig(msg.config);
          if (result.ok) {
            try { localStorage.setItem("hz:cms-config", JSON.stringify(msg.config)); } catch {}
          }
        }
      },
      "set-mode": (msg) => { if (msg.mode) setMode(msg.mode); },
      "set-background": (msg) => { if (msg.color) document.documentElement.style.setProperty("--wz-bg", msg.color); },
      "progress-loaded": (msg: Record<string, unknown>) => {
        if (msg.state && !progressLoadedRef.current) {
          const s = msg.state as Record<string, unknown>;
          if (s.form) setForm(s.form as FormState);
          if (s.phase) setPhase(s.phase as string);
          if (s.wizardIndex != null) setWizardIndex(s.wizardIndex as number);
        }
        setProgressLoaded(true);
      },
      "admin-settings": (msg: Record<string, unknown>) => {
        if (msg.pricing) setPricing(msg.pricing as Pricing);
        if (msg.constraints) setConstr(msg.constraints as Constraints);
        setMode("admin");
      },
      "settings-saved": () => {},
      "config-saved": (msg: Record<string, unknown>) => {
        if (msg.success && msg.configId) {
          setConfigId(msg.configId as string);
          const f = formRef.current;
          const price = computePrice(f, pricingRef.current);
          const wood = holzarten.find((h) => h.value === f.holzart);
          const summary = `${wood?.label || f.holzart} ${f.breite}×${f.hoehe}×${f.tiefe}cm`;
          requestCheckout(msg.configId as string, Math.round(price.customerPrice), summary);

          if (fusionEnabledRef.current) {
            generateAndSendScript(f, msg.configId as string, productsRef.current, constrRef.current, pricingRef.current)
              .catch(err => console.warn('Fusion script generation failed (non-blocking):', err));
          }
        } else {
          setSubmitting(false);
          setCheckoutError((msg.error as string) || "Konfiguration konnte nicht gespeichert werden.");
        }
      },
      "checkout-ready": (msg: Record<string, unknown>) => {
        setSubmitting(false); clearProgress();
        if (msg.checkoutUrl) setPhase("done");
      },
      "checkout-error": (msg: Record<string, unknown>) => {
        setSubmitting(false);
        setCheckoutError((msg.error as string) || "Checkout konnte nicht erstellt werden.");
      },
    });
    send("ready"); loadProgress();
    return () => { cleanupResize(); cleanupListen(); };
  }, []);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!progressLoaded || isAdmin || phase === "done") return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveProgress({ form, phase, wizardIndex } as unknown as Record<string, unknown>); }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [form, phase, wizardIndex, progressLoaded, isAdmin]);

  const skippedSteps = useMemo(() => OPTIONAL_STEPS.filter((s) => !enabledSteps[s.id]), [enabledSteps]);

  const wizardCtx: WizardContextValue = useMemo(() => ({
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
    activeProduct, products, categoryVisibility, fusionEnabled, isAdmin, texts, showroom, set, setFieldError, toggleExtra]);

  return {
    phase, setPhase, mode, isAdmin,
    form, setForm, errors, setErrors,
    pricing, setPricing, constr, dimConfig,
    setDim, addPreset, removePreset, setConstrVal,
    enabledSteps, stepOrder, setStepOrder,
    categoryVisibility, toggleCategory,
    products, setProducts,
    fusionEnabled, setFusionEnabled,
    texts, setTexts,
    showroom, setShowroom,
    bergDisplay, setBergDisp,
    limits, activeSteps, totalSteps, wizardIndex, setWizardIndex, currentStepId,
    skippedSteps, activeProduct,
    holzToggle, schriftToggle, bergToggle,
    oberflaechenList, extrasList, hakenMatList, darstellungList,
    configManager, configManagerRef,
    toggleStep, set, setFieldError, toggleExtra,
    startWizard, startPreset, triggerShake, validate, next, prev, doSubmit,
    shake, navDir, setNavDir, animKey, setAnimKey, shellRef,
    submitting, checkoutError, setConfigId, setSubmitting, setCheckoutError,
    wizardCtx, progressLoaded,
  };
}
