# Admin Card Primitives Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce vertical scrolling in AdminProducts and AdminShowroom by introducing tabbed content and extracting duplicated image management.

**Architecture:** Two new UI primitives (`PropertyTabs`, `ImageManager`) replace vertical content stacking inside entity cards. AdminProducts gains accordion behavior (one card expanded at a time). Both pages use `PropertyTabs` to split card content into tabs.

**Tech Stack:** React, TypeScript, Tailwind CSS (inline classes matching existing admin design system)

---

### Task 1: Create `PropertyTabs` primitive

**Files:**
- Create: `src/components/ui/PropertyTabs.tsx`

**Step 1: Create the component**

```tsx
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface PropertyTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export type { Tab };

export default function PropertyTabs({ tabs, defaultTab }: PropertyTabsProps) {
  const [activeId, setActiveId] = useState(defaultTab || tabs[0]?.id || '');
  const active = tabs.find((t) => t.id === activeId) || tabs[0];

  if (tabs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex rounded-sm border border-border overflow-hidden bg-field">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveId(tab.id)}
            className={`flex-1 text-center py-1.5 text-[10px] font-bold font-body border-none cursor-pointer transition-colors ${
              active?.id === tab.id
                ? 'bg-brand text-white'
                : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {active && <div>{active.content}</div>}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build --prefix /c/dev/holzschneiderei/holzschneiderei`
Expected: PASS

**Step 3: Commit**

```
feat(ui): add PropertyTabs primitive
```

---

### Task 2: Create `ImageManager` primitive

**Files:**
- Create: `src/components/ui/ImageManager.tsx`

**Step 1: Create the component**

Extract the duplicated image management pattern from AdminProducts (lines 124-206) and AdminShowroom (lines 411-488). The component renders: optional carousel preview, image list with drift-direction buttons, and an add-URL input row.

```tsx
import { useState } from 'react';
import type { CarouselConfig, CarouselImage } from '../../types/config';
import { normalizeImage } from '../../lib/carouselUtils';
import ImageCarousel from './ImageCarousel';

type ImageEntry = string | CarouselImage;

interface ImageManagerProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  carousel?: CarouselConfig;
  showPreview?: boolean;
}

export default function ImageManager({ images, onChange, carousel, showPreview = true }: ImageManagerProps) {
  const [newUrl, setNewUrl] = useState('');

  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

  const addImage = () => {
    if (!newUrl.trim()) return;
    onChange([...images, newUrl.trim()]);
    setNewUrl('');
  };

  return (
    <div>
      {showPreview && images.length > 0 && (
        <div className="mb-2">
          <ImageCarousel
            images={images}
            className="max-w-[280px]"
            {...(carousel ? {
              interval: carousel.interval,
              driftDuration: carousel.driftDuration,
              fadeDuration: carousel.fadeDuration,
              zoom: carousel.zoom,
              aspectRatio: carousel.aspectRatio,
            } : {})}
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5 mb-2">
        {images.map((img, i) => {
          const { src, drift } = normalizeImage(img);
          return (
            <div key={`${i}-${src}`} className="flex items-center gap-1.5 group">
              <img src={src} alt="" className="w-10 h-7 object-cover rounded-sm border border-border shrink-0" />
              <div className="flex gap-px shrink-0">
                {(["left", "right", "up", "down"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => {
                      const updated = [...images];
                      updated[i] = { src, drift: dir };
                      onChange(updated);
                    }}
                    className={`w-5 h-5 flex items-center justify-center text-[9px] border rounded-sm cursor-pointer ${
                      drift === dir
                        ? "bg-brand text-white border-brand"
                        : "bg-transparent text-muted border-border hover:border-brand"
                    }`}
                    title={dir}
                  >
                    {dir === "left" ? "\u2190" : dir === "right" ? "\u2192" : dir === "up" ? "\u2191" : "\u2193"}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted truncate flex-1 min-w-0">{src}</span>
              <button
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="text-[10px] text-error bg-transparent border-none cursor-pointer p-0.5 opacity-50 hover:opacity-100 shrink-0"
                aria-label="Bild entfernen"
              >
                {"\u2715"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <input
          type="url"
          value={newUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUrl(e.target.value)}
          placeholder="https://..."
          className={`${fieldCls} flex-1`}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') addImage();
          }}
        />
        <button
          onClick={addImage}
          disabled={!newUrl.trim()}
          className={`h-7 px-3 text-[10px] font-bold font-body rounded-sm border-none cursor-pointer transition-colors ${
            newUrl.trim()
              ? 'bg-brand text-white hover:opacity-90'
              : 'bg-border text-muted cursor-default'
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build --prefix /c/dev/holzschneiderei/holzschneiderei`
Expected: PASS

**Step 3: Commit**

```
feat(ui): add ImageManager primitive
```

---

### Task 3: Refactor `AdminProducts` to use PropertyTabs + ImageManager

**Files:**
- Modify: `src/components/admin/AdminProducts.tsx`

**Step 1: Refactor the component**

Key changes:
1. Add `expandedProduct` state — accordion behavior, only one card open at a time
2. Product cards collapse to just their header row when not expanded
3. When expanded, use `PropertyTabs` with these tabs:
   - **Allgemein**: icon toggles, description toggle, coming soon toggle + teaser, steps badges, constraints
   - **Bilder**: `ImageManager` component (replaces ~80 lines of inline code)
   - **Gruppe**: grouping editor (only for non-comingSoon products)
   - **Preise**: price table (only for products with fixedPrices)
4. Remove `editingPrices` and `editingGroup` state (no longer needed — tabs replace sub-toggles)
5. Remove `newImageUrl` state (moved into ImageManager)

The card header becomes clickable to expand/collapse. The `ToggleSwitch` for enabled/disabled stays in the header.

**Resulting structure:**

```
┌─────────────────────────────────────────┐
│ 🪵 Garderobe  ·  "Massgeschneidert..." │
│                             [on/off]    │  ← click header to expand
├─────────────────────────────────────────┤
│ [Allgemein] [Bilder] [Gruppe] [Preise]  │  ← PropertyTabs (only when expanded)
├─────────────────────────────────────────┤
│ (active tab content only)               │
└─────────────────────────────────────────┘
```

Full replacement code for `AdminProducts.tsx`:

```tsx
import { useState } from 'react';
import type { CarouselConfig, Product } from '../../types/config';
import ToggleSwitch from '../ui/ToggleSwitch';
import PropertyTabs from '../ui/PropertyTabs';
import type { Tab } from '../ui/PropertyTabs';
import ImageManager from '../ui/ImageManager';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface AdminProductsProps {
  products: Product[];
  setProducts: Setter<Product[]>;
  carousel?: CarouselConfig;
}

export default function AdminProducts({ products, setProducts, carousel }: AdminProductsProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const updateProduct = (id: string, changes: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...changes } : p));
  };

  const toggleEnabled = (id: string) => updateProduct(id, { enabled: !products.find((p) => p.id === id)?.enabled });
  const toggleComingSoon = (id: string) => updateProduct(id, { comingSoon: !products.find((p) => p.id === id)?.comingSoon });
  const setTeaser = (id: string, teaser: string) => updateProduct(id, { teaser });

  const setFixedPrice = (id: string, key: string, value: string) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, fixedPrices: { ...p.fixedPrices, [key]: Math.max(0, parseInt(value, 10) || 0) } } : p
    ));
  };

  const setGroup = (id: string, group: string) => updateProduct(id, { group: group || null });
  const setGroupPrimary = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod?.group) return;
    setProducts((prev) => prev.map((p) =>
      p.group === prod.group ? { ...p, groupPrimary: p.id === id } : p
    ));
  };

  const groupNames = [...new Set(products.filter((p) => p.group).map((p) => p.group))] as string[];
  const inputCls = "w-[70px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm shrink-0";
  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

  return (
    <div className="flex flex-col gap-4">
      {[...products].sort((a, b) => a.sortOrder - b.sortOrder).map((product) => {
        const isExpanded = expandedProduct === product.id;
        const priceKeys = Object.keys(product.fixedPrices || {});
        const widths = [...new Set(priceKeys.map((k) => parseInt(k.split("-")[0]!, 10)))].sort((a, b) => a - b);
        const woods = [...new Set(priceKeys.map((k) => k.split("-").slice(1).join("-")))];
        const isGrouped = !!product.group;
        const groupMembers = isGrouped ? products.filter((p) => p.group === product.group) : [];

        const tabs: Tab[] = [];

        if (product.enabled) {
          // Allgemein tab
          tabs.push({
            id: 'general',
            label: 'Allgemein',
            content: (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Icon anzeigen</span>
                  <ToggleSwitch on={product.showIcon !== false} onChange={() => updateProduct(product.id, { showIcon: product.showIcon === false })} size="sm" />
                </div>
                {product.showIcon !== false && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-text">Icon-Gr\u00F6sse</span>
                    <div className="flex items-center gap-1.5">
                      <input type="range" min="16" max="48" value={product.iconSize || 28}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { iconSize: parseInt(e.target.value, 10) })}
                        className="w-20 h-1 accent-brand cursor-pointer" />
                      <span className="text-[11px] text-muted w-8 text-right">{product.iconSize || 28}px</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Beschreibung anzeigen</span>
                  <ToggleSwitch on={product.showDesc !== false} onChange={() => updateProduct(product.id, { showDesc: product.showDesc === false })} size="sm" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Coming Soon</span>
                  <ToggleSwitch on={product.comingSoon} onChange={() => toggleComingSoon(product.id)} size="sm" />
                </div>
                {product.comingSoon && (
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">Teaser-Text</label>
                    <textarea value={product.teaser}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTeaser(product.id, e.target.value)}
                      placeholder="Teaser-Text f\u00FCr Coming Soon..."
                      className="w-full h-16 px-3 py-2 text-[12px] font-body text-text bg-field border border-border rounded-sm resize-y" />
                  </div>
                )}
                {!product.comingSoon && product.steps.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Schritte</div>
                    <div className="flex flex-wrap gap-1">
                      {product.steps.map((step) => (
                        <span key={step} className="px-2 py-0.5 text-[10px] font-semibold bg-brand-light text-brand rounded-sm">{step}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!product.comingSoon && product.constraints && Object.keys(product.constraints).length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Grenzen</div>
                    <div className="text-[11px] text-muted">Breite: {product.constraints.MIN_W}\u2013{product.constraints.MAX_W} cm</div>
                  </div>
                )}
              </div>
            ),
          });

          // Bilder tab
          tabs.push({
            id: 'images',
            label: 'Bilder',
            content: (
              <ImageManager
                images={product.previewImages || []}
                onChange={(imgs) => updateProduct(product.id, { previewImages: imgs })}
                carousel={carousel}
              />
            ),
          });

          // Gruppe tab (non-comingSoon only)
          if (!product.comingSoon) {
            tabs.push({
              id: 'group',
              label: 'Gruppe',
              content: (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[13px]">{isGrouped ? "\uD83D\uDD17" : "\uD83D\uDCE6"}</span>
                    <span className="text-[11px] font-bold text-text">
                      {isGrouped ? `Gruppe: "${product.group}" ${product.groupPrimary ? "(Hauptprodukt)" : "(Variante)"}` : "Nicht gruppiert"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Gruppen-ID</label>
                    <div className="flex gap-1.5">
                      <input type="text" value={product.group || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(product.id, e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="z.B. schriftzug" className={fieldCls} />
                      {groupNames.length > 0 && (
                        <select value={product.group || ""}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGroup(product.id, e.target.value)}
                          className="h-7 px-1 text-[11px] font-body text-text bg-field border border-border rounded-sm">
                          <option value="">Keine</option>
                          {groupNames.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">Produkte mit gleicher Gruppen-ID werden im Wizard zusammengefasst.</div>
                  </div>
                  {isGrouped && (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-text">Hauptprodukt dieser Gruppe</span>
                        <ToggleSwitch on={!!product.groupPrimary} onChange={() => setGroupPrimary(product.id)} size="sm" />
                      </div>
                      {product.groupPrimary && (
                        <div className="flex flex-col gap-1.5">
                          <div>
                            <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Gruppen-Label (Wizard-Karte)</label>
                            <input type="text" value={product.groupLabel || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { groupLabel: e.target.value })} placeholder={product.label} className={fieldCls} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Gruppen-Beschreibung</label>
                            <input type="text" value={product.groupDesc || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { groupDesc: e.target.value })} placeholder={product.desc} className={fieldCls} />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <div>
                          <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Varianten-Label (Toggle-Text)</label>
                          <input type="text" value={product.variantLabel || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { variantLabel: e.target.value })} placeholder={product.label} className={fieldCls} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Varianten-Beschreibung</label>
                          <input type="text" value={product.variantDesc || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { variantDesc: e.target.value })} placeholder={product.desc} className={fieldCls} />
                        </div>
                      </div>
                      {groupMembers.length > 1 && (
                        <div className="mt-1 px-2 py-1.5 bg-brand-light rounded-sm">
                          <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Vorschau: Toggle im Wizard</div>
                          <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                            {groupMembers.filter((m) => m.enabled && !m.comingSoon).map((m) => (
                              <div key={m.id} className={`flex-1 text-center py-1.5 text-[10px] font-bold ${
                                m.id === product.id ? 'bg-brand text-white' : 'text-muted'
                              }`}>{m.variantLabel || m.label}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            });
          }

          // Preise tab (only if fixedPrices exist)
          if (!product.comingSoon && priceKeys.length > 0) {
            tabs.push({
              id: 'prices',
              label: 'Preise',
              content: (
                <div className="overflow-x-auto">
                  <table className="text-[11px] border-collapse">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left text-muted font-bold">Breite</th>
                        {woods.map((w) => (
                          <th key={w} className="px-2 py-1 text-center text-muted font-bold capitalize">{w}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {widths.map((width) => (
                        <tr key={width}>
                          <td className="px-2 py-1 font-semibold">{width} cm</td>
                          {woods.map((wood) => {
                            const key = `${width}-${wood}`;
                            return (
                              <td key={key} className="px-1 py-1">
                                <input type="number" min="0" value={product.fixedPrices[key] || 0}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFixedPrice(product.id, key, e.target.value)}
                                  className={inputCls} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            });
          }
        }

        return (
          <div key={product.id} className={`border-[1.5px] rounded p-4 transition-all duration-200 ${
            product.enabled ? 'border-brand bg-[rgba(31,59,49,0.03)]' : 'border-border bg-field'
          }`}>
            <div
              className="flex items-center justify-between gap-3 cursor-pointer"
              onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-xl">{product.icon}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-text">{product.label}</div>
                  <div className="text-[11px] text-muted truncate">{product.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ToggleSwitch on={product.enabled} onChange={(e?: React.MouseEvent) => { e?.stopPropagation(); toggleEnabled(product.id); }} size="md" />
                <svg className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 4.5l3 3 3-3" />
                </svg>
              </div>
            </div>

            {isExpanded && product.enabled && tabs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <PropertyTabs tabs={tabs} />
              </div>
            )}

            {isExpanded && !product.enabled && (
              <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted italic">
                Produkt aktivieren, um Einstellungen zu bearbeiten.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Important implementation notes:**
- The `ToggleSwitch` `onChange` needs `stopPropagation` to prevent the card header click from also firing. Check the existing `ToggleSwitch` component API — if `onChange` doesn't accept an event parameter, wrap the toggle in a `<div onClick={stopPropagation}>` instead.
- The chevron SVG is the same one used in `AdminOptions.tsx` and `AdminLayout.tsx`.

**Step 2: Check ToggleSwitch API for stopPropagation**

Read `src/components/ui/ToggleSwitch.tsx` to verify the `onChange` signature. If it doesn't pass the event, wrap the toggle:

```tsx
<div onClick={(e) => e.stopPropagation()}>
  <ToggleSwitch on={product.enabled} onChange={() => toggleEnabled(product.id)} size="md" />
</div>
```

**Step 3: Verify build**

Run: `npm run build --prefix /c/dev/holzschneiderei/holzschneiderei`
Expected: PASS

**Step 4: Commit**

```
refactor(admin): use PropertyTabs + ImageManager in AdminProducts
```

---

### Task 4: Refactor `AdminShowroom` to use PropertyTabs + ImageManager

**Files:**
- Modify: `src/components/admin/AdminShowroom.tsx`

**Step 1: Refactor the component**

Key changes:
1. Replace the expanded settings section (lines 250-489) with `PropertyTabs` using 3 tabs:
   - **Allgemein**: title, description, product type, click behavior, CTA, blanko toggle
   - **Sichtbarkeit**: show title, show desc, price tri-state, specs tri-state
   - **Bilder**: `ImageManager` component (replaces ~75 lines of inline code)
2. Remove `newImageUrl` state (moved into ImageManager)
3. Keep existing `expandedPreset` accordion behavior (already correct)
4. Keep the "Einstellungen" / "Konfigurieren" / "L\u00F6schen" action buttons as-is

**Resulting structure per preset card:**

```
┌────────────────────────────────────────┐
│ ▲▼  Alpen-Garderobe  ·  Garderobe     │
│                             [on/off]   │
│ [carousel preview if images]           │
│ Einstellungen▼  Konfigurieren  L\u00F6schen │
├────────────────────────────────────────┤
│ [Allgemein] [Sichtbarkeit] [Bilder]   │  ← PropertyTabs (only when expanded)
├────────────────────────────────────────┤
│ (active tab content only)              │
└────────────────────────────────────────┘
```

The tri-state segmented controls for showPrice/showSpecs (Auto|An|Aus) stay as inline elements within the Sichtbarkeit tab.

**Step 2: Verify build**

Run: `npm run build --prefix /c/dev/holzschneiderei/holzschneiderei`
Expected: PASS

**Step 3: Commit**

```
refactor(admin): use PropertyTabs + ImageManager in AdminShowroom
```

---

### Task 5: Visual verification

**Step 1: Start dev server**

Run: `npm run dev --prefix /c/dev/holzschneiderei/holzschneiderei`

**Step 2: Verify in browser**

Navigate to the admin panel and check:
- [ ] AdminProducts: cards collapse to headers, click expands with tabs
- [ ] AdminProducts: only one card expanded at a time
- [ ] AdminProducts: all 4 tabs work (Allgemein, Bilder, Gruppe, Preise)
- [ ] AdminProducts: ToggleSwitch doesn't trigger card expand/collapse
- [ ] AdminShowroom: "Einstellungen" expands with tabs
- [ ] AdminShowroom: all 3 tabs work (Allgemein, Sichtbarkeit, Bilder)
- [ ] AdminShowroom: image management (add, remove, drift) works
- [ ] Both pages: vertical height dramatically reduced
