import { useState } from 'react';
import type { CarouselConfig, Product } from '../../types/config';
import PropertyTabs from '../ui/PropertyTabs';
import type { Tab } from '../ui/PropertyTabs';
import ImageManager from '../ui/ImageManager';
import ToggleSwitch from '../ui/ToggleSwitch';
import AdminBadge from '../ui/AdminBadge';

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

  // Group management
  const setGroup = (id: string, group: string) => updateProduct(id, { group: group || null });
  const setGroupPrimary = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod?.group) return;
    setProducts((prev) => prev.map((p) =>
      p.group === prod.group
        ? { ...p, groupPrimary: p.id === id }
        : p
    ));
  };

  // Get all unique group names
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

        // Build tabs only when product is enabled
        const tabs: Tab[] = [];
        if (product.enabled) {
          // Tab: Allgemein
          tabs.push({
            id: 'allgemein',
            label: 'Allgemein',
            content: (
              <div className="flex flex-col gap-3">
                {/* Icon visibility + size */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Icon anzeigen</span>
                  <ToggleSwitch on={product.showIcon !== false} onChange={() => updateProduct(product.id, { showIcon: product.showIcon === false })} size="sm" />
                </div>
                {product.showIcon !== false && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-text">Icon-Grösse</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={product.iconSize || 28}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProduct(product.id, { iconSize: parseInt(e.target.value, 10) })}
                        className="w-20 h-1 accent-brand cursor-pointer"
                      />
                      <span className="text-[11px] text-muted w-8 text-right">{product.iconSize || 28}px</span>
                    </div>
                  </div>
                )}

                {/* Description visibility toggle */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Beschreibung anzeigen</span>
                  <ToggleSwitch on={product.showDesc !== false} onChange={() => updateProduct(product.id, { showDesc: product.showDesc === false })} size="sm" />
                </div>

                {/* Coming soon toggle */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-text">Coming Soon</span>
                  <ToggleSwitch on={product.comingSoon} onChange={() => toggleComingSoon(product.id)} size="sm" />
                </div>

                {product.comingSoon && (
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">Teaser-Text</label>
                    <textarea
                      value={product.teaser}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTeaser(product.id, e.target.value)}
                      placeholder="Teaser-Text für Coming Soon..."
                      className="w-full h-16 px-3 py-2 text-[12px] font-body text-text bg-field border border-border rounded-sm resize-y"
                    />
                  </div>
                )}

                {/* Steps list */}
                {!product.comingSoon && product.steps.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Schritte</div>
                    <div className="flex flex-wrap gap-1">
                      {product.steps.map((step) => (
                        <span key={step} className="px-2 py-0.5 text-[10px] font-semibold bg-brand-light text-brand rounded-sm">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {!product.comingSoon && product.constraints && Object.keys(product.constraints).length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Grenzen</div>
                    <div className="text-[11px] text-muted">
                      Breite: {product.constraints.MIN_W}–{product.constraints.MAX_W} cm
                    </div>
                  </div>
                )}
              </div>
            ),
          });

          // Tab: Bilder
          tabs.push({
            id: 'bilder',
            label: 'Bilder',
            content: (
              <ImageManager
                images={product.previewImages || []}
                onChange={(images) => updateProduct(product.id, { previewImages: images })}
                carousel={carousel}
              />
            ),
          });

          // Tab: Gruppe (only for non-comingSoon)
          if (!product.comingSoon) {
            tabs.push({
              id: 'gruppe',
              label: 'Gruppe',
              content: (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand">
                    <span className="text-[13px]">{isGrouped ? "\u{1F517}" : "\u{1F4E6}"}</span>
                    {isGrouped
                      ? `Gruppe: "${product.group}" ${product.groupPrimary ? "(Hauptprodukt)" : "(Variante)"}`
                      : "Nicht gruppiert"
                    }
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Gruppen-ID</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={product.group || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(product.id, e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="z.B. schriftzug"
                        className={fieldCls}
                      />
                      {groupNames.length > 0 && (
                        <select
                          value={product.group || ""}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGroup(product.id, e.target.value)}
                          className="h-7 px-1 text-[11px] font-body text-text bg-field border border-border rounded-sm"
                        >
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
                              }`}>
                                {m.variantLabel || m.label}
                              </div>
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

          // Tab: Preise (only for products with fixedPrices and non-comingSoon)
          if (!product.comingSoon && priceKeys.length > 0) {
            tabs.push({
              id: 'preise',
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
                                <input
                                  type="number"
                                  min="0"
                                  value={product.fixedPrices[key] || 0}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFixedPrice(product.id, key, e.target.value)}
                                  className={inputCls}
                                />
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
            {/* Header row — click to expand/collapse */}
            <div
              className="flex items-center justify-between gap-3 cursor-pointer"
              onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{product.icon}</span>
                <div>
                  <div className="text-[13px] font-bold text-text">{product.label} <AdminBadge id={product.id} /></div>
                  <div className="text-[11px] text-muted">{product.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div onClick={(e) => e.stopPropagation()}>
                  <ToggleSwitch on={product.enabled} onChange={() => toggleEnabled(product.id)} size="md" />
                </div>
                <svg className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 4.5l3 3 3-3" />
                </svg>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-border">
                {product.enabled ? (
                  <PropertyTabs tabs={tabs} />
                ) : (
                  <div className="text-[12px] text-muted italic py-2">
                    Produkt aktivieren, um Einstellungen zu bearbeiten.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
