# Showroom Presets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a showroom layer to the configurator landing page where admins curate pre-configured product presets (with images, form snapshots, and display settings) that customers can browse and order or customize.

**Architecture:** New `showroom` config object at the top level of Konfigurator state, persisted alongside existing admin config. PhaseTypen renders preset cards from showroom config. Admin gets a new "Showroom" section. When a customer clicks a preset, the form is hydrated from the snapshot and the wizard starts.

**Tech Stack:** React (existing), Tailwind (existing), existing bridge/config persistence, existing ImageCarousel/SelectionCard components.

---

### Task 1: Add DEFAULT_SHOWROOM and Preset Helpers

**Files:**
- Create: `src/data/showroom.js`

**Step 1: Create the showroom data module**

```js
// src/data/showroom.js

/**
 * @typedef {Object} Preset
 * @property {string} id
 * @property {string} title
 * @property {string} desc
 * @property {string[]} images
 * @property {string} productId
 * @property {object} formSnapshot
 * @property {"summary"|"wizard"|"detail"} clickBehavior
 * @property {boolean} isBlank
 * @property {number} sortOrder
 * @property {boolean} enabled
 * @property {boolean|null} showPrice
 * @property {boolean|null} showSpecs
 * @property {boolean} showTitle
 * @property {boolean} showDesc
 * @property {string} ctaText
 */

export const DEFAULT_SHOWROOM = {
  layout: "grid",
  columns: 3,
  showPrice: true,
  showSpecs: true,
  presets: [],
};

let _counter = 0;
export function createPreset(overrides = {}) {
  return {
    id: `preset-${Date.now()}-${_counter++}`,
    title: "",
    desc: "",
    images: [],
    productId: "",
    formSnapshot: {},
    clickBehavior: "wizard",
    isBlank: true,
    sortOrder: 0,
    enabled: true,
    showPrice: null,
    showSpecs: null,
    showTitle: true,
    showDesc: true,
    ctaText: "Jetzt gestalten",
    ...overrides,
  };
}

/**
 * Hydrate DEFAULT_FORM with a preset's formSnapshot.
 * Missing keys in snapshot fall back to defaultForm values.
 */
export function hydrateForm(defaultForm, preset) {
  const base = { ...defaultForm };
  if (preset.productId) base.product = preset.productId;
  if (preset.formSnapshot) Object.assign(base, preset.formSnapshot);
  return base;
}

/**
 * Derive spec badges from a form snapshot for display on preset cards.
 * Returns array of strings like ["Eiche", "80 cm", "6 Haken"].
 */
export function deriveSpecs(formSnapshot, products) {
  const specs = [];
  if (!formSnapshot) return specs;
  const product = products?.find(p => p.id === formSnapshot.product);
  if (formSnapshot.holzart) {
    const label = formSnapshot.holzart.charAt(0).toUpperCase() + formSnapshot.holzart.slice(1);
    specs.push(label);
  }
  if (formSnapshot.breite) specs.push(`${formSnapshot.breite} cm`);
  if (formSnapshot.haken && product?.steps?.includes("ausfuehrung")) {
    specs.push(`${formSnapshot.haken} Haken`);
  }
  if (formSnapshot.schriftzug) specs.push(`"${formSnapshot.schriftzug}"`);
  return specs;
}
```

**Step 2: Commit**

```
git add src/data/showroom.js
git commit -m "feat(showroom): add DEFAULT_SHOWROOM, createPreset, hydrateForm helpers"
```

---

### Task 2: Wire Showroom State into Konfigurator

**Files:**
- Modify: `src/Konfigurator.jsx` — add showroom state, pass to context, wire into config manager

**Step 1: Add showroom state and imports**

In `Konfigurator.jsx`, add after the products import (line 8):

```js
import { DEFAULT_SHOWROOM, hydrateForm } from "./data/showroom";
```

Add state after the `texts` state (after line 101):

```js
const [showroom, setShowroom] = useState(() => JSON.parse(JSON.stringify(DEFAULT_SHOWROOM)));
```

**Step 2: Add showroom to WizardContext value**

In the `wizardCtx` useMemo (around line 310), add `showroom` to the object and the dependency array.

**Step 3: Add showroom to config manager**

Pass `showroom, setShowroom` into `useConfigManager` call (around line 120).

**Step 4: Add `startPreset` function**

After `startWizard` (around line 183), add:

```js
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
    const steps = [...(prod?.steps || []).filter(id => enabledSteps[id] || FIXED_STEP_IDS.includes(id))];
    const lastIdx = steps.length - 1;
    setWizardIndex(Math.max(0, lastIdx));
    setPhase("wizard");
  } else {
    setWizardIndex(0);
    setPhase("wizard");
  }
};
```

**Step 5: Pass startPreset to PhaseTypen**

Update PhaseTypen rendering (around lines 459, 520) to pass `startPreset`:

```jsx
<PhaseTypen startWizard={startWizard} startPreset={startPreset} triggerShake={triggerShake} setErrors={setErrors} />
```

**Step 6: Add showroom to admin auto-save dependency array**

In the auto-save useEffect (line 362), add `showroom` to the dependency array.

**Step 7: Add showroom to adminSummaries**

```js
showroom: `${showroom.presets.filter(p => p.enabled).length} Presets`,
```

**Step 8: Add showroom admin section**

Add `showroom` to `adminSectionContent` (around line 403):

```js
showroom: {
  title: "Showroom",
  desc: "Vorkonfigurierte Produkte als CTA-Karten auf der Startseite",
  content: <AdminShowroom showroom={showroom} setShowroom={setShowroom} products={products} />,
},
```

(Import AdminShowroom at top — we'll create it in Task 4.)

**Step 9: Commit**

```
git add src/Konfigurator.jsx
git commit -m "feat(showroom): wire showroom state into Konfigurator and context"
```

---

### Task 3: Update Config Manager for Showroom Persistence

**Files:**
- Modify: `src/hooks/useConfigManager.js`

**Step 1: Accept showroom params**

Add `showroom, setShowroom` to the function parameters.

**Step 2: Include in getConfig**

Add `showroom` to the config object in `getConfig`.

**Step 3: Include in applyConfig**

Add after the texts loading:

```js
if (data.showroom) setShowroom(data.showroom);
```

**Step 4: Update dependency arrays**

Add `showroom` to both `getConfig` and `applyConfig` dependency arrays.

**Step 5: Commit**

```
git add src/hooks/useConfigManager.js
git commit -m "feat(showroom): persist showroom config in import/export"
```

---

### Task 4: Add showroom to WizardContext

**Files:**
- Modify: `src/context/WizardContext.jsx` (if needed — check if it's generic enough to just pass through)

Since WizardContext is a generic pass-through (`WizardProvider` just passes the value object), no changes needed here — `showroom` is already included in `wizardCtx` from Task 2.

---

### Task 5: Add Showroom Nav Section to AdminLayout

**Files:**
- Modify: `src/components/admin/AdminLayout.jsx`

**Step 1: Add showroom to NAV_GROUPS**

In the "Produkte" group (line 6), add after the `options` entry:

```js
{ id: 'showroom', label: 'Showroom', short: 'Show', icon: 'W' },
```

**Step 2: Commit**

```
git add src/components/admin/AdminLayout.jsx
git commit -m "feat(showroom): add Showroom nav item to admin sidebar"
```

---

### Task 6: Create AdminShowroom Component

**Files:**
- Create: `src/components/admin/AdminShowroom.jsx`

This is the main admin UI for managing presets. It renders:
- Layout picker (grid/hero/carousel)
- Global visibility toggles
- Preset cards with inline controls
- Add new preset button

**Step 1: Create AdminShowroom**

```jsx
// src/components/admin/AdminShowroom.jsx
import { useState } from 'react';
import { createPreset } from '../../data/showroom';
import ToggleSwitch from '../ui/ToggleSwitch';
import ImageCarousel from '../ui/ImageCarousel';

export default function AdminShowroom({ showroom, setShowroom, products }) {
  const [expandedSettings, setExpandedSettings] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState({});

  const updateShowroom = (changes) => setShowroom(prev => ({ ...prev, ...changes }));

  const updatePreset = (id, changes) => {
    setShowroom(prev => ({
      ...prev,
      presets: prev.presets.map(p => p.id === id ? { ...p, ...changes } : p),
    }));
  };

  const addPreset = () => {
    const preset = createPreset({ sortOrder: showroom.presets.length });
    setShowroom(prev => ({ ...prev, presets: [...prev.presets, preset] }));
    setExpandedSettings(preset.id);
  };

  const removePreset = (id) => {
    setShowroom(prev => ({
      ...prev,
      presets: prev.presets.filter(p => p.id !== id),
    }));
  };

  const movePreset = (id, dir) => {
    setShowroom(prev => {
      const presets = [...prev.presets];
      const idx = presets.findIndex(p => p.id === id);
      const target = idx + dir;
      if (target < 0 || target >= presets.length) return prev;
      [presets[idx], presets[target]] = [presets[target], presets[idx]];
      return { ...prev, presets: presets.map((p, i) => ({ ...p, sortOrder: i })) };
    });
  };

  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";
  const enabledProducts = products.filter(p => p.enabled && !p.comingSoon);

  return (
    <div className="flex flex-col gap-5">
      {/* Layout settings */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-text">Layout</span>
          <div className="flex rounded-sm border border-border overflow-hidden bg-field">
            {["grid", "hero", "carousel"].map(l => (
              <button key={l} onClick={() => updateShowroom({ layout: l })}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] border-none cursor-pointer font-body transition-colors ${
                  showroom.layout === l ? 'bg-brand text-white' : 'bg-transparent text-muted hover:text-text'
                }`}>
                {l === "grid" ? "Raster" : l === "hero" ? "Hero" : "Karussell"}
              </button>
            ))}
          </div>
        </div>

        {showroom.layout === "grid" && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-text">Spalten</span>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => updateShowroom({ columns: n })}
                  className={`w-7 h-7 text-[11px] font-bold rounded border cursor-pointer font-body transition-colors ${
                    showroom.columns === n ? 'bg-brand text-white border-brand' : 'bg-field text-muted border-border hover:border-brand'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Preis anzeigen (Standard)</span>
          <ToggleSwitch on={showroom.showPrice} onChange={() => updateShowroom({ showPrice: !showroom.showPrice })} size="sm" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Specs anzeigen (Standard)</span>
          <ToggleSwitch on={showroom.showSpecs} onChange={() => updateShowroom({ showSpecs: !showroom.showSpecs })} size="sm" />
        </div>
      </div>

      {/* Presets */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted">
            Presets ({showroom.presets.length})
          </h3>
          <button onClick={addPreset}
            className="h-7 px-3 text-[10px] font-bold font-body rounded-sm border border-brand text-brand bg-transparent cursor-pointer hover:bg-brand hover:text-white transition-colors">
            + Neues Preset
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {showroom.presets.sort((a, b) => a.sortOrder - b.sortOrder).map((preset, idx) => (
            <div key={preset.id} className={`border-[1.5px] rounded p-3 transition-all duration-200 ${
              preset.enabled ? 'border-brand bg-[rgba(31,59,49,0.03)]' : 'border-border bg-field'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => movePreset(preset.id, -1)} disabled={idx === 0}
                      className="text-[10px] text-muted bg-transparent border-none cursor-pointer p-0 disabled:opacity-30 hover:text-brand">▲</button>
                    <button onClick={() => movePreset(preset.id, 1)} disabled={idx === showroom.presets.length - 1}
                      className="text-[10px] text-muted bg-transparent border-none cursor-pointer p-0 disabled:opacity-30 hover:text-brand">▼</button>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-text truncate">
                      {preset.title || (preset.isBlank ? "Blanko-Preset" : "Unbenanntes Preset")}
                    </div>
                    <div className="text-[11px] text-muted">
                      {preset.isBlank ? "Design your own" : (enabledProducts.find(p => p.id === preset.productId)?.label || "Kein Produkt")}
                      {preset.formSnapshot?.schriftzug ? ` · "${preset.formSnapshot.schriftzug}"` : ""}
                    </div>
                  </div>
                </div>
                <ToggleSwitch on={preset.enabled} onChange={() => updatePreset(preset.id, { enabled: !preset.enabled })} size="md" />
              </div>

              {/* Images preview */}
              {preset.images.length > 0 && (
                <div className="mb-2">
                  <ImageCarousel images={preset.images} className="max-w-[280px]" />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setExpandedSettings(expandedSettings === preset.id ? null : preset.id)}
                  className="text-[11px] font-bold text-brand cursor-pointer bg-transparent border-none p-0 font-body hover:underline">
                  {expandedSettings === preset.id ? "Einstellungen ▲" : "Einstellungen ▼"}
                </button>
                <button onClick={() => removePreset(preset.id)}
                  className="text-[11px] font-bold text-error cursor-pointer bg-transparent border-none p-0 font-body hover:underline ml-auto">
                  Löschen
                </button>
              </div>

              {/* Expanded settings */}
              {expandedSettings === preset.id && (
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Titel</label>
                    <input type="text" value={preset.title} onChange={e => updatePreset(preset.id, { title: e.target.value })}
                      placeholder="z.B. Garderobe Alpstein" className={fieldCls} />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Beschreibung</label>
                    <input type="text" value={preset.desc} onChange={e => updatePreset(preset.id, { desc: e.target.value })}
                      placeholder="Kurze Beschreibung..." className={fieldCls} />
                  </div>

                  {/* Product type */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Produkt-Typ</label>
                    <select value={preset.productId} onChange={e => updatePreset(preset.id, { productId: e.target.value })}
                      className="h-7 w-full px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm">
                      <option value="">-- Produkt wählen --</option>
                      {enabledProducts.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
                    </select>
                  </div>

                  {/* Click behavior */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Klick-Verhalten</label>
                    <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                      {[
                        { value: "wizard", label: "Wizard" },
                        { value: "summary", label: "Zusammenfassung" },
                        { value: "detail", label: "Detailansicht" },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => updatePreset(preset.id, { clickBehavior: opt.value })}
                          className={`flex-1 py-1.5 text-[10px] font-bold border-none cursor-pointer font-body transition-colors ${
                            preset.clickBehavior === opt.value ? 'bg-brand text-white' : 'bg-transparent text-muted hover:text-text'
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA text */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Button-Text</label>
                    <input type="text" value={preset.ctaText} onChange={e => updatePreset(preset.id, { ctaText: e.target.value })}
                      placeholder="Jetzt bestellen" className={fieldCls} />
                  </div>

                  {/* isBlank toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[12px] font-semibold text-text">Blanko-Preset</span>
                      <div className="text-[10px] text-muted">Blueprint-Stil, leere Konfiguration</div>
                    </div>
                    <ToggleSwitch on={preset.isBlank} onChange={() => updatePreset(preset.id, { isBlank: !preset.isBlank })} size="sm" />
                  </div>

                  {/* Visibility overrides */}
                  <div className="bg-[rgba(31,59,49,0.03)] border border-border rounded p-2.5">
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">Sichtbarkeit</div>
                    {[
                      { key: "showTitle", label: "Titel" },
                      { key: "showDesc", label: "Beschreibung" },
                      { key: "showPrice", label: "Preis", triState: true },
                      { key: "showSpecs", label: "Specs", triState: true },
                    ].map(({ key, label, triState }) => (
                      <div key={key} className="flex items-center justify-between gap-2 py-1">
                        <span className="text-[11px] text-text">{label}</span>
                        {triState ? (
                          <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                            {[
                              { value: null, label: "Auto" },
                              { value: true, label: "An" },
                              { value: false, label: "Aus" },
                            ].map(opt => (
                              <button key={String(opt.value)} onClick={() => updatePreset(preset.id, { [key]: opt.value })}
                                className={`px-2 py-0.5 text-[9px] font-bold border-none cursor-pointer font-body transition-colors ${
                                  preset[key] === opt.value ? 'bg-brand text-white' : 'bg-transparent text-muted'
                                }`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <ToggleSwitch on={preset[key]} onChange={() => updatePreset(preset.id, { [key]: !preset[key] })} size="sm" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Preview images */}
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Vorschau-Bilder</div>
                    <div className="flex flex-col gap-1.5 mb-2">
                      {preset.images.map((url, i) => (
                        <div key={i} className="flex items-center gap-1.5 group">
                          <img src={url} alt="" className="w-10 h-7 object-cover rounded-sm border border-border shrink-0" />
                          <span className="text-[10px] text-muted truncate flex-1 min-w-0">{url}</span>
                          <button
                            onClick={() => updatePreset(preset.id, { images: preset.images.filter((_, j) => j !== i) })}
                            className="text-[10px] text-error bg-transparent border-none cursor-pointer p-0.5 opacity-50 hover:opacity-100 shrink-0">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input type="url" value={newImageUrl[preset.id] || ""}
                        onChange={e => setNewImageUrl(prev => ({ ...prev, [preset.id]: e.target.value }))}
                        placeholder="https://..."
                        className={`${fieldCls} flex-1`}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newImageUrl[preset.id]?.trim()) {
                            updatePreset(preset.id, { images: [...preset.images, newImageUrl[preset.id].trim()] });
                            setNewImageUrl(prev => ({ ...prev, [preset.id]: "" }));
                          }
                        }} />
                      <button
                        onClick={() => {
                          if (!newImageUrl[preset.id]?.trim()) return;
                          updatePreset(preset.id, { images: [...preset.images, newImageUrl[preset.id].trim()] });
                          setNewImageUrl(prev => ({ ...prev, [preset.id]: "" }));
                        }}
                        disabled={!newImageUrl[preset.id]?.trim()}
                        className={`h-7 px-3 text-[10px] font-bold font-body rounded-sm border-none cursor-pointer transition-colors ${
                          newImageUrl[preset.id]?.trim() ? 'bg-brand text-white hover:opacity-90' : 'bg-border text-muted cursor-default'
                        }`}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showroom.presets.length === 0 && (
            <div className="text-center py-8 text-muted">
              <div className="text-2xl mb-2">🏪</div>
              <p className="text-[12px]">Noch keine Presets. Erstelle dein erstes Showroom-Preset.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```
git add src/components/admin/AdminShowroom.jsx
git commit -m "feat(showroom): add AdminShowroom component for preset management"
```

---

### Task 7: Create ShowroomGrid Customer Component

**Files:**
- Create: `src/components/showroom/ShowroomGrid.jsx`

This renders the customer-facing preset cards in the chosen layout.

**Step 1: Create ShowroomGrid**

```jsx
// src/components/showroom/ShowroomGrid.jsx
import { useMemo } from "react";
import ImageCarousel from "../ui/ImageCarousel";
import { deriveSpecs } from "../../data/showroom";
import { computeFixedPrice } from "../../data/products";
import { computePrice } from "../../data/pricing";
import { DEFAULT_FORM } from "../../data/constants";

function PresetCard({ preset, products, pricing, onSelect }) {
  const product = products.find(p => p.id === preset.productId);
  const form = { ...DEFAULT_FORM, ...preset.formSnapshot, product: preset.productId };

  const price = useMemo(() => {
    if (!product || preset.isBlank) return null;
    const fixed = computeFixedPrice(form, product);
    if (fixed != null) return fixed;
    const calc = computePrice(form, pricing);
    return Math.round(calc.customerPrice);
  }, [form, product, pricing, preset.isBlank]);

  const specs = useMemo(() => deriveSpecs(form, products), [form, products]);

  const shouldShow = (key, globalDefault) => {
    if (preset[key] != null) return preset[key];
    return globalDefault;
  };

  const isBlank = preset.isBlank;

  return (
    <button
      type="button"
      onClick={() => onSelect(preset)}
      className={`group relative flex flex-col text-left rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-[1.5px] bg-white hover:shadow-md ${
        isBlank
          ? 'border-dashed border-[rgba(31,59,49,0.3)] hover:border-brand'
          : 'border-border hover:border-brand'
      }`}
    >
      {/* Images */}
      {preset.images.length > 0 ? (
        <div className={isBlank ? 'opacity-60 sepia-[0.3]' : ''}>
          <ImageCarousel images={preset.images} />
        </div>
      ) : (
        <div className={`w-full flex items-center justify-center bg-[rgba(31,59,49,0.04)] ${
          isBlank ? 'border-b border-dashed border-[rgba(31,59,49,0.15)]' : 'border-b border-border'
        }`} style={{ paddingBottom: "66.67%", position: "relative" }}>
          <span className="absolute inset-0 flex items-center justify-center text-3xl text-muted opacity-40">
            {isBlank ? "✏️" : "📷"}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        {preset.showTitle && preset.title && (
          <h3 className="text-[14px] font-bold tracking-[0.02em] uppercase text-text m-0 leading-tight">
            {preset.title}
          </h3>
        )}
        {preset.showDesc && preset.desc && (
          <p className="text-[12px] text-muted leading-relaxed m-0">
            {preset.desc}
          </p>
        )}
        {shouldShow("showSpecs", true) && specs.length > 0 && !isBlank && (
          <div className="flex flex-wrap gap-1 mt-1">
            {specs.map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] font-semibold bg-[rgba(31,59,49,0.06)] text-brand rounded-sm">
                {s}
              </span>
            ))}
          </div>
        )}
        {shouldShow("showPrice", true) && price != null && (
          <div className="text-[16px] font-bold text-brand mt-auto pt-2">
            CHF {price}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <span className={`block w-full text-center py-2.5 rounded text-[12px] font-bold tracking-[0.04em] uppercase transition-colors ${
          isBlank
            ? 'bg-transparent border-[1.5px] border-brand text-brand group-hover:bg-brand group-hover:text-white'
            : 'bg-brand text-white group-hover:opacity-90'
        }`}>
          {isBlank && <span className="mr-1">✏️</span>}
          {preset.ctaText || (isBlank ? "Jetzt gestalten" : "Jetzt bestellen")}
        </span>
      </div>
    </button>
  );
}

export default function ShowroomGrid({ showroom, products, pricing, onSelectPreset }) {
  const presets = showroom.presets
    .filter(p => p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (presets.length === 0) return null;

  const { layout, columns } = showroom;

  if (layout === "hero") {
    const [hero, ...rest] = presets;
    return (
      <div className="flex flex-col gap-4">
        {hero && (
          <PresetCard preset={hero} products={products} pricing={pricing} onSelect={onSelectPreset} />
        )}
        {rest.length > 0 && (
          <div className="grid gap-4 grid-cols-1 cq-products-3">
            {rest.map(p => (
              <PresetCard key={p.id} preset={p} products={products} pricing={pricing} onSelect={onSelectPreset} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === "carousel") {
    return (
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
        {presets.map(p => (
          <div key={p.id} className="shrink-0 w-[280px] snap-start cq-carousel-item">
            <PresetCard preset={p} products={products} pricing={pricing} onSelect={onSelectPreset} />
          </div>
        ))}
      </div>
    );
  }

  // Default: grid
  return (
    <div className={`grid gap-4 grid-cols-1 ${
      columns === 2 ? 'cq-grid-2' : columns === 4 ? 'cq-grid-4' : 'cq-products-3'
    }`}>
      {presets.map(p => (
        <PresetCard key={p.id} preset={p} products={products} pricing={pricing} onSelect={onSelectPreset} />
      ))}
    </div>
  );
}
```

**Step 2: Add container query classes if needed**

Check `konfigurator.css` for existing `cq-grid-*` classes. If `cq-grid-2` and `cq-grid-4` don't exist, add them:

```css
@container wizard (min-width: 520px) { .cq-grid-2 { grid-template-columns: repeat(2, 1fr); } }
@container wizard (min-width: 520px) { .cq-grid-4 { grid-template-columns: repeat(2, 1fr); } }
@container wizard (min-width: 780px) { .cq-grid-4 { grid-template-columns: repeat(4, 1fr); } }
```

**Step 3: Commit**

```
git add src/components/showroom/ShowroomGrid.jsx src/konfigurator.css
git commit -m "feat(showroom): add ShowroomGrid customer-facing component"
```

---

### Task 8: Update PhaseTypen to Render Showroom

**Files:**
- Modify: `src/components/phases/PhaseTypen.jsx`

**Step 1: Import ShowroomGrid**

```js
import ShowroomGrid from "../showroom/ShowroomGrid";
```

**Step 2: Accept startPreset prop and read showroom from context**

Update the function signature and add context reads:

```jsx
export default function PhaseTypen({ startWizard, startPreset, triggerShake, setErrors }) {
  const { form, set, errors, products, texts, showroom, pricing } = useWizard();
```

**Step 3: Add showroom rendering**

After the heading section and before the existing product selector, add conditional showroom rendering:

```jsx
const hasPresets = showroom?.presets?.some(p => p.enabled);
```

If `hasPresets` is true, render `ShowroomGrid` instead of the existing product group cards. Keep the existing product selector as fallback when there are no presets.

The detail click behavior shows an expanded card inline — for the MVP, we can treat "detail" same as "wizard" and add the detail panel in a follow-up.

**Step 4: Handle preset selection**

When `onSelectPreset` fires, call `startPreset(preset)`.

**Step 5: Keep the "Weiter" button for the old flow**

When showroom is active, hide the bottom "Weiter" button (users click CTA on cards directly).

**Step 6: Commit**

```
git add src/components/phases/PhaseTypen.jsx
git commit -m "feat(showroom): render preset cards on landing page"
```

---

### Task 9: Add Preset Wizard Configuration Mode

**Files:**
- Modify: `src/components/admin/AdminShowroom.jsx` — add "Konfigurieren" button that opens a mini wizard
- Create: `src/components/admin/PresetWizard.jsx` — modal/overlay that walks admin through wizard steps

**Step 1: Create PresetWizard**

A modal component that renders the existing step components in sequence, with "Speichern" at the end instead of "Bestellen". When saved, it writes the form state back as `formSnapshot`.

```jsx
// src/components/admin/PresetWizard.jsx
import { useState, useMemo } from "react";
import { DEFAULT_FORM, OPTIONAL_STEPS, FIXED_STEP_IDS } from "../../data/constants";
import { DEFAULT_CONSTR, computeLimits, hooksFor } from "../../data/pricing";
import { useWizard } from "../../context/WizardContext";
import StepMotiv from "../steps/StepMotiv";
import StepHolzart from "../steps/StepHolzart";
import StepMasse from "../steps/StepMasse";
import StepAusfuehrung from "../steps/StepAusfuehrung";
import StepExtras from "../steps/StepExtras";
import StepDarstellung from "../steps/StepDarstellung";

const STEP_COMPONENTS = {
  motiv: StepMotiv,
  holzart: StepHolzart,
  masse: StepMasse,
  ausfuehrung: StepAusfuehrung,
  extras: StepExtras,
  darstellung: StepDarstellung,
};

export default function PresetWizard({ preset, products, onSave, onCancel }) {
  const product = products.find(p => p.id === preset.productId);
  const allSteps = product?.steps?.filter(s => !FIXED_STEP_IDS.includes(s)) || [];
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = allSteps[stepIdx];
  const StepComponent = STEP_COMPONENTS[currentStep];

  const isLast = stepIdx === allSteps.length - 1;
  const isFirst = stepIdx === 0;

  const handleSave = () => {
    // Collect current form from context and save as snapshot
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[520px] max-h-[80vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h3 className="text-[14px] font-bold text-text m-0">Preset konfigurieren</h3>
            <p className="text-[11px] text-muted m-0">
              Schritt {stepIdx + 1} von {allSteps.length}: {OPTIONAL_STEPS.find(s => s.id === currentStep)?.label || currentStep}
            </p>
          </div>
          <button onClick={onCancel} className="text-[18px] text-muted bg-transparent border-none cursor-pointer hover:text-text p-1">✕</button>
        </div>

        {/* Step content */}
        <div className="p-5">
          {StepComponent ? <StepComponent /> : (
            <p className="text-muted text-[12px]">Kein Konfigurationsschritt für "{currentStep}".</p>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-[rgba(31,59,49,0.02)]">
          <button onClick={() => isFirst ? onCancel() : setStepIdx(i => i - 1)}
            className="h-9 px-4 text-[12px] font-bold font-body rounded border border-border text-text bg-transparent cursor-pointer hover:border-brand transition-colors">
            {isFirst ? "Abbrechen" : "← Zurück"}
          </button>
          {/* Progress dots */}
          <div className="flex gap-1">
            {allSteps.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === stepIdx ? 'bg-brand' : i < stepIdx ? 'bg-brand opacity-40' : 'bg-border'
              }`} />
            ))}
          </div>
          <button onClick={() => isLast ? handleSave() : setStepIdx(i => i + 1)}
            className={`h-9 px-4 text-[12px] font-bold font-body rounded border-none cursor-pointer transition-colors ${
              isLast ? 'bg-brand text-white hover:opacity-90' : 'bg-brand text-white hover:opacity-90'
            }`}>
            {isLast ? "Speichern ✓" : "Weiter →"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Wire into AdminShowroom**

Add a "Konfigurieren" button to each preset card. When clicked, it opens PresetWizard as a modal. The wizard reads/writes to a temporary form state. On save, the form state is written back to `preset.formSnapshot`.

This requires the AdminShowroom to temporarily set up a WizardProvider with a local form state for the preset wizard modal. The implementation should:

1. Track `configuringPresetId` state
2. When set, render PresetWizard inside a temporary WizardProvider with local form/set/errors
3. On save, copy form state to preset.formSnapshot

**Step 3: Commit**

```
git add src/components/admin/PresetWizard.jsx src/components/admin/AdminShowroom.jsx
git commit -m "feat(showroom): add PresetWizard for admin preset configuration"
```

---

### Task 10: Add Detail View for "detail" Click Behavior

**Files:**
- Modify: `src/components/phases/PhaseTypen.jsx` or `src/components/showroom/ShowroomGrid.jsx`

**Step 1: Add expandable detail panel**

When a preset with `clickBehavior: "detail"` is clicked, instead of immediately starting the wizard, expand an inline panel below the card showing:
- All images in a larger carousel
- Full specs list
- Price breakdown
- Two buttons: "Bestellen" (→ summary) and "Anpassen" (→ wizard)

**Step 2: Commit**

```
git add src/components/showroom/ShowroomGrid.jsx
git commit -m "feat(showroom): add detail view for preset cards"
```

---

### Task 11: Schriftzug Validation in Admin

**Files:**
- Modify: `src/components/admin/AdminShowroom.jsx`

**Step 1: Add validation warning**

When saving a non-blank preset where the linked product has `motif: "schriftzug"`, show a warning badge if `formSnapshot.schriftzug` is empty.

**Step 2: Commit**

```
git add src/components/admin/AdminShowroom.jsx
git commit -m "feat(showroom): add Schriftzug validation warning for presets"
```

---

### Task 12: Integration Test — Manual Verification

**Steps:**
1. Run `npm run dev` and open `?mode=admin`
2. Navigate to "Showroom" in admin sidebar
3. Create 3 presets + 1 blank preset
4. For each non-blank preset: pick a product, click "Konfigurieren", walk through wizard, save
5. Add images and configure display settings
6. Switch to customer view — verify cards render in chosen layout
7. Click each preset — verify form hydration and wizard entry
8. Test "summary" click behavior — verify jump to last step
9. Test layout switching (grid/hero/carousel)
10. Verify config persistence — reload, check presets survive

---

### Task 13: Final Cleanup and Polish

**Files:**
- All modified files

**Steps:**
1. Remove any console.log or debug output
2. Verify no TypeScript/lint errors (even though no linter configured, check for obvious issues)
3. Run `npm run build` to verify production build succeeds
4. Test responsive behavior at phone/tablet/desktop widths
5. Final commit

```
git commit -m "chore(showroom): cleanup and polish"
```
