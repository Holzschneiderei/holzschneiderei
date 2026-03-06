import { useState } from 'react';
import ToggleSwitch from '../ui/ToggleSwitch';

export default function AdminProducts({ products, setProducts }) {
  const [editingPrices, setEditingPrices] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  const updateProduct = (id, changes) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...changes } : p));
  };

  const toggleEnabled = (id) => updateProduct(id, { enabled: !products.find((p) => p.id === id).enabled });
  const toggleComingSoon = (id) => updateProduct(id, { comingSoon: !products.find((p) => p.id === id).comingSoon });
  const setTeaser = (id, teaser) => updateProduct(id, { teaser });

  const setFixedPrice = (id, key, value) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, fixedPrices: { ...p.fixedPrices, [key]: Math.max(0, parseInt(value) || 0) } } : p
    ));
  };

  // Group management
  const setGroup = (id, group) => updateProduct(id, { group: group || null });
  const setGroupPrimary = (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod?.group) return;
    setProducts((prev) => prev.map((p) =>
      p.group === prod.group
        ? { ...p, groupPrimary: p.id === id }
        : p
    ));
  };

  // Get all unique group names
  const groupNames = [...new Set(products.filter((p) => p.group).map((p) => p.group))];

  const inputCls = "w-[70px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm shrink-0";
  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

  return (
    <div className="flex flex-col gap-4">
      {products.sort((a, b) => a.sortOrder - b.sortOrder).map((product) => {
        const priceKeys = Object.keys(product.fixedPrices || {});
        const widths = [...new Set(priceKeys.map((k) => parseInt(k.split("-")[0])))].sort((a, b) => a - b);
        const woods = [...new Set(priceKeys.map((k) => k.split("-").slice(1).join("-")))];
        const isGrouped = !!product.group;
        const groupMembers = isGrouped ? products.filter((p) => p.group === product.group) : [];

        return (
          <div key={product.id} className={`border-[1.5px] rounded p-4 transition-all duration-200 ${
            product.enabled ? 'border-brand bg-[rgba(31,59,49,0.03)]' : 'border-border bg-field'
          }`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{product.icon}</span>
                <div>
                  <div className="text-[13px] font-bold text-text">{product.label}</div>
                  <div className="text-[11px] text-muted">{product.desc}</div>
                </div>
              </div>
              <ToggleSwitch on={product.enabled} onChange={() => toggleEnabled(product.id)} size="md" />
            </div>

            {product.enabled && (
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-border">
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
                      onChange={(e) => setTeaser(product.id, e.target.value)}
                      placeholder="Teaser-Text für Coming Soon..."
                      className="w-full h-16 px-3 py-2 text-[12px] font-body text-text bg-field border border-border rounded-sm resize-y"
                    />
                  </div>
                )}

                {/* Grouping section */}
                {!product.comingSoon && (
                  <div className="bg-[rgba(31,59,49,0.03)] border border-border rounded p-3">
                    <button
                      onClick={() => setEditingGroup(editingGroup === product.id ? null : product.id)}
                      className="text-[11px] font-bold text-brand cursor-pointer bg-transparent border-none p-0 font-body hover:underline flex items-center gap-1"
                    >
                      <span className="text-[13px]">{isGrouped ? "\u{1F517}" : "\u{1F4E6}"}</span>
                      {isGrouped
                        ? `Gruppe: "${product.group}" ${product.groupPrimary ? "(Hauptprodukt)" : "(Variante)"}`
                        : "Nicht gruppiert"
                      }
                      <span className="text-[9px] ml-1">{editingGroup === product.id ? "\u25B2" : "\u25BC"}</span>
                    </button>

                    {editingGroup === product.id && (
                      <div className="mt-2.5 flex flex-col gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Gruppen-ID</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={product.group || ""}
                              onChange={(e) => setGroup(product.id, e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                              placeholder="z.B. schriftzug"
                              className={fieldCls}
                            />
                            {groupNames.length > 0 && (
                              <select
                                value={product.group || ""}
                                onChange={(e) => setGroup(product.id, e.target.value)}
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
                                  <input type="text" value={product.groupLabel || ""} onChange={(e) => updateProduct(product.id, { groupLabel: e.target.value })} placeholder={product.label} className={fieldCls} />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Gruppen-Beschreibung</label>
                                  <input type="text" value={product.groupDesc || ""} onChange={(e) => updateProduct(product.id, { groupDesc: e.target.value })} placeholder={product.desc} className={fieldCls} />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                              <div>
                                <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Varianten-Label (Toggle-Text)</label>
                                <input type="text" value={product.variantLabel || ""} onChange={(e) => updateProduct(product.id, { variantLabel: e.target.value })} placeholder={product.label} className={fieldCls} />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-0.5">Varianten-Beschreibung</label>
                                <input type="text" value={product.variantDesc || ""} onChange={(e) => updateProduct(product.id, { variantDesc: e.target.value })} placeholder={product.desc} className={fieldCls} />
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
                    )}
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

                {/* Fixed prices toggle */}
                {!product.comingSoon && priceKeys.length > 0 && (
                  <div>
                    <button
                      onClick={() => setEditingPrices(editingPrices === product.id ? null : product.id)}
                      className="text-[11px] font-bold text-brand cursor-pointer bg-transparent border-none p-0 font-body hover:underline"
                    >
                      {editingPrices === product.id ? "Preistabelle ausblenden \u25B2" : "Preistabelle bearbeiten \u25BC"}
                    </button>

                    {editingPrices === product.id && (
                      <div className="mt-2 overflow-x-auto">
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
                                        onChange={(e) => setFixedPrice(product.id, key, e.target.value)}
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
                    )}
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
