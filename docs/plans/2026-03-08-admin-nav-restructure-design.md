# Admin Nav Restructure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the admin sidebar from 15 items / 5 groups to 7 items / 3 groups using progressive disclosure.

**Architecture:** Merge related sections into composite pages (Produkte & Typen, Masse & Grenzen). Replace 6 individual option list pages with a single accordion component (AdminOptions). Move Fusion 360 into Konfiguration, eliminate singleton groups. Zero modifications to existing admin components — only re-composition.

**Tech Stack:** React 18, Tailwind CSS 4, Vite 6

---

### Task 1: Create AdminOptions accordion component

**Files:**
- Create: `src/components/admin/AdminOptions.jsx`

**Step 1: Create the accordion component**

This component wraps 6 existing admin components (AdminWoodSelection, AdminOptionList ×4, AdminBergDisplay) in collapsible accordion panels. Only one panel open at a time.

```jsx
import { useState, useRef, useEffect } from 'react';

const EYE_OPEN = (
  <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EYE_CLOSED = (
  <svg className="w-3.5 h-3.5 text-muted opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
    <line x1="2" y1="14" x2="14" y2="2" />
  </svg>
);

function AccordionPanel({ id, icon, label, summary, open, onToggle, categoryKey, categoryVisible, onToggleCategory, children }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open, children]);

  return (
    <div className={`border border-border rounded-lg overflow-hidden transition-shadow duration-200 ${open ? 'shadow-[0_2px_8px_rgba(31,59,49,0.08)]' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-field border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(31,59,49,0.06)]"
      >
        <div className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
          open ? 'bg-brand text-white shadow-[0_2px_8px_rgba(31,59,49,0.25)]' : 'bg-[rgba(31,59,49,0.06)] text-muted'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className={`text-[11px] font-bold tracking-[0.03em] ${open ? 'text-brand' : 'text-text'}`}>
            {label}
          </div>
          {!open && summary && (
            <div className="text-[10px] text-muted leading-tight mt-0.5 truncate">{summary}</div>
          )}
        </div>
        {categoryKey && onToggleCategory && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onToggleCategory(categoryKey); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onToggleCategory(categoryKey); } }}
            title={categoryVisible ? "Für Kunden sichtbar" : "Für Kunden ausgeblendet"}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded cursor-pointer transition-all duration-200 hover:bg-[rgba(31,59,49,0.08)]"
          >
            {categoryVisible ? EYE_OPEN : EYE_CLOSED}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: open ? height + 'px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef} className="px-4 py-3 border-t border-border">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminOptions({ panels, categoryVisibility, onToggleCategory }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="flex flex-col gap-2">
      {panels.map((p) => (
        <AccordionPanel
          key={p.id}
          id={p.id}
          icon={p.icon}
          label={p.label}
          summary={p.summary}
          open={openId === p.id}
          onToggle={() => setOpenId(openId === p.id ? null : p.id)}
          categoryKey={p.categoryKey}
          categoryVisible={p.categoryKey ? categoryVisibility?.[p.categoryKey] !== false : true}
          onToggleCategory={onToggleCategory}
        >
          {p.content}
        </AccordionPanel>
      ))}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build --prefix /c/dev/tweakch/holzschneiderei`
Expected: Build succeeds (component not yet imported anywhere)

**Step 3: Commit**

```bash
git add src/components/admin/AdminOptions.jsx
git commit -m "feat: add AdminOptions accordion component for option lists"
```

---

### Task 2: Update AdminLayout nav structure

**Files:**
- Modify: `src/components/admin/AdminLayout.jsx`

**Step 1: Replace NAV_GROUPS and remove SECTION_TO_CATEGORY**

In `AdminLayout.jsx`, replace the `SECTION_TO_CATEGORY` constant (lines 4-10) and `NAV_GROUPS` constant (lines 12-52) with the new 3-group / 7-item structure:

Remove `SECTION_TO_CATEGORY` entirely (lines 4-10).

Replace `NAV_GROUPS` (lines 12-52) with:

```js
const NAV_GROUPS = [
  {
    label: 'Produkte',
    sections: [
      { id: 'products', label: 'Produkte & Typen', short: 'Prod.', icon: 'P' },
      { id: 'options', label: 'Optionen', short: 'Opt.', icon: 'O' },
    ],
  },
  {
    label: 'Konfiguration',
    sections: [
      { id: 'dimensions', label: 'Masse & Grenzen', short: 'Masse', icon: 'M' },
      { id: 'steps', label: 'Wizard-Schritte', short: 'Schritte', icon: 'S' },
      { id: 'pricing', label: 'Preiskalkulation', short: 'Preise', icon: '$' },
      { id: 'fusion', label: 'Fusion 360', short: 'Fusion', icon: 'F' },
    ],
  },
  {
    label: 'System',
    sections: [
      { id: 'importExport', label: 'Import / Export', short: 'I/O', icon: 'E' },
    ],
  },
];
```

In the `NavItem` component, remove all `categoryKey` / `categoryVisible` / `onToggleCategory` props and the `CategoryToggle` rendering. The `CategoryToggle` component itself can be deleted. Category toggles now live inside the AdminOptions accordion panels.

In `NavItem`, remove:
- The `categoryKey`, `categoryVisible`, `onToggleCategory` props
- The `isHidden` check and its opacity class
- The `CategoryToggle` rendering block

In `NavGroup`, remove:
- The `categoryVisibility`, `onToggleCategory` props
- The `catKey` lookup and `CategoryToggle`-related props passed to `NavItem`

In `MobileTabBar`, remove:
- The `categoryVisibility`, `onToggleCategory` props
- The `catKey` / `isHidden` logic per section button

In `AdminLayout` export, remove:
- The `categoryVisibility`, `onToggleCategory` props from the component signature
- Remove passing them down to `NavGroup` and `MobileTabBar`

**Step 2: Verify build**

Run: `npm run build --prefix /c/dev/tweakch/holzschneiderei`
Expected: Build will fail because Konfigurator.jsx still references old section IDs — that's expected, we fix it in Task 3.

**Step 3: Commit**

```bash
git add src/components/admin/AdminLayout.jsx
git commit -m "refactor: restructure admin nav from 15 to 7 items"
```

---

### Task 3: Update Konfigurator.jsx section content and summaries

**Files:**
- Modify: `src/Konfigurator.jsx`

**Step 1: Add AdminOptions import**

Add to the admin component imports (around line 48):

```js
import AdminOptions from "./components/admin/AdminOptions";
```

**Step 2: Replace adminSummaries**

Replace the `adminSummaries` useMemo (lines 330-350) with the new 7-item version:

```js
const adminSummaries = useMemo(() => ({
  products: `${products.filter(p => p.enabled).length} aktiv, ${products.filter(p => p.comingSoon).length} coming soon`,
  options: [
    `${holzToggle.active.length} Holz`,
    `${oberflaechenList.activeItems.length} Ofl.`,
    `${extrasList.activeItems.length} Extras`,
  ].join(", "),
  dimensions: `${constr.MIN_W}\u2013${constr.MAX_W} \u00D7 ${constr.MIN_H}\u2013${constr.MAX_H} cm`,
  steps: `${OPTIONAL_STEPS.filter(s => enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`,
  pricing: `Marge ${pricing.margin}x (${Math.round((pricing.margin - 1) * 100)}%)`,
  fusion: fusionEnabled ? "Aktiviert" : "Deaktiviert",
  importExport: "JSON Import/Export",
}), [products, holzToggle.active.length, oberflaechenList.activeItems.length, extrasList.activeItems.length,
  constr, enabledSteps, pricing, fusionEnabled]);
```

**Step 3: Replace adminSectionContent**

Replace the `adminSectionContent` object (lines 352-367) with the new 7-section version. The `options` section passes all 6 option panels to AdminOptions. The `products` section stacks AdminProducts + AdminTypeDefaults. The `dimensions` section stacks AdminConstraints + AdminDimensions.

```js
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
    title: "Produkte & Typen",
    desc: "Produkte verwalten, Typ-Vorgaben und Schriftzug/Berg konfigurieren",
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
    title: "Optionen",
    desc: "Holzarten, Oberflächen, Extras und weitere Optionen verwalten",
    content: <AdminOptions panels={optionPanels} categoryVisibility={categoryVisibility} onToggleCategory={toggleCategory} />,
  },
  dimensions: {
    title: "Masse & Grenzen",
    desc: "Abmessungen, Eingabemodi und Produktgrenzen",
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
  fusion: { title: "Fusion 360", desc: "Automatische Script-Generierung für die Werkstatt", content: <AdminFusion enabled={fusionEnabled} onToggle={setFusionEnabled} /> },
  importExport: { title: "Import / Export", desc: "Konfiguration als JSON-Datei sichern oder laden", content: <AdminImportExport onExport={configManager.exportParams} onImport={configManager.importParams} /> },
};
```

**Step 4: Remove categoryVisibility/onToggleCategory from AdminLayout call**

In the admin rendering section (around line 409), remove the `categoryVisibility` and `onToggleCategory` props from `<AdminLayout>`:

```jsx
<AdminLayout activeSection={activeAdminSection} onSectionChange={setActiveAdminSection} summaries={adminSummaries}>
```

**Step 5: Verify build**

Run: `npm run build --prefix /c/dev/tweakch/holzschneiderei`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add src/Konfigurator.jsx
git commit -m "refactor: wire up new 7-item admin nav with accordion options"
```

---

### Task 4: Visual smoke test in harness

**Step 1: Start dev server and open harness**

Run: `npm run test --prefix /c/dev/tweakch/holzschneiderei`

**Step 2: Verify in browser**

Check these things:
1. Sidebar shows 3 groups (Produkte, Konfiguration, System) with 7 items total
2. Click "Produkte & Typen" — shows products list, then type defaults below a divider
3. Click "Optionen" — shows 6 accordion panels, all collapsed with summary lines
4. Expand "Holzarten" — shows 5 wood toggle checkboxes, other panels collapse
5. Expand "Extras" — Holzarten collapses, Extras opens
6. Eye toggles on accordion panels work (toggle category visibility)
7. Click "Masse & Grenzen" — shows constraints diagram at top, dimension presets below
8. Click "Fusion 360" — shows Fusion section (was previously under Werkstatt group)
9. Mobile: resize to <768px — tab bar shows 3 group pills instead of 5
10. Click "Kunde →" — workflow mode still works normally

**Step 3: Commit (if any fixes needed)**

---

## Verification Checklist

- [ ] Sidebar: 3 groups, 7 items, no scrolling needed
- [ ] "Produkte & Typen": AdminProducts + AdminTypeDefaults on one page
- [ ] "Optionen": 6 accordion panels with summaries, one-open-at-a-time
- [ ] Category eye toggles work inside accordion panels
- [ ] "Masse & Grenzen": AdminConstraints + AdminDimensions on one page
- [ ] "Fusion 360": works in Konfiguration group
- [ ] Mobile tab bar: 3 groups
- [ ] Build succeeds: `npm run build`
- [ ] No changes to any existing admin component files
