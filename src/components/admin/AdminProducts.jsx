import { useState } from 'react';
import ToggleSwitch from '../ui/ToggleSwitch';

export default function AdminProducts({ products, setProducts }) {
  const [editingPrices, setEditingPrices] = useState(null);

  const toggleEnabled = (id) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const toggleComingSoon = (id) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, comingSoon: !p.comingSoon } : p
    ));
  };

  const setTeaser = (id, teaser) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, teaser } : p
    ));
  };

  const setFixedPrice = (id, key, value) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, fixedPrices: { ...p.fixedPrices, [key]: Math.max(0, parseInt(value) || 0) } } : p
    ));
  };

  const inputCls = "w-[70px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm shrink-0";

  return (
    <div className="flex flex-col gap-4">
      {products.sort((a, b) => a.sortOrder - b.sortOrder).map((product) => {
        // Extract unique widths and woods from fixedPrices
        const priceKeys = Object.keys(product.fixedPrices || {});
        const widths = [...new Set(priceKeys.map((k) => parseInt(k.split("-")[0])))].sort((a, b) => a - b);
        const woods = [...new Set(priceKeys.map((k) => k.split("-").slice(1).join("-")))];

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
                      placeholder="Teaser-Text f\u00FCr Coming Soon..."
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
                      Breite: {product.constraints.MIN_W}\u2013{product.constraints.MAX_W} cm
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
