import { useState } from 'react';
import ToggleSwitch from '../ui/ToggleSwitch';
import ImageCarousel from '../ui/ImageCarousel';
import { createPreset } from '../../data/showroom';
import PresetWizard from './PresetWizard';

export default function AdminShowroom({ showroom, setShowroom, products }) {
  const [expandedPreset, setExpandedPreset] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState({});
  const [configuringPresetId, setConfiguringPresetId] = useState(null);

  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

  const updateShowroom = (changes) => {
    setShowroom((prev) => ({ ...prev, ...changes }));
  };

  const updatePreset = (id, changes) => {
    setShowroom((prev) => ({
      ...prev,
      presets: prev.presets.map((p) => p.id === id ? { ...p, ...changes } : p),
    }));
  };

  const addPreset = () => {
    const maxOrder = showroom.presets.reduce((max, p) => Math.max(max, p.sortOrder), -1);
    const preset = createPreset({ sortOrder: maxOrder + 1 });
    setShowroom((prev) => ({ ...prev, presets: [...prev.presets, preset] }));
    setExpandedPreset(preset.id);
  };

  const removePreset = (id) => {
    setShowroom((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
    if (expandedPreset === id) setExpandedPreset(null);
  };

  const movePreset = (id, dir) => {
    setShowroom((prev) => {
      const sorted = [...prev.presets].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((p) => p.id === id);
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;
      [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
      const reordered = sorted.map((p, i) => ({ ...p, sortOrder: i }));
      return { ...prev, presets: reordered };
    });
  };

  const layouts = [
    { value: 'grid', label: 'Raster' },
    { value: 'hero', label: 'Hero' },
    { value: 'carousel', label: 'Karussell' },
  ];

  const clickBehaviors = [
    { value: 'wizard', label: 'Wizard' },
    { value: 'summary', label: 'Zusammenfassung' },
    { value: 'detail', label: 'Detailansicht' },
  ];

  const availableProducts = products.filter((p) => p.enabled && !p.comingSoon);
  const sortedPresets = [...showroom.presets].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-5">
      {/* Layout settings */}
      <div className="flex flex-col gap-3">
        <div className="text-[10px] font-bold text-muted tracking-widest uppercase">Layout</div>

        {/* Layout picker */}
        <div>
          <label className="block text-[11px] font-semibold text-muted mb-1">Darstellung</label>
          <div className="flex rounded-sm border border-border overflow-hidden bg-field">
            {layouts.map((l) => (
              <button
                key={l.value}
                onClick={() => updateShowroom({ layout: l.value })}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold font-body border-none cursor-pointer transition-colors ${
                  showroom.layout === l.value
                    ? 'bg-brand text-white'
                    : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Columns picker — grid only */}
        {showroom.layout === 'grid' && (
          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1">Spalten</label>
            <div className="flex gap-1.5">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => updateShowroom({ columns: n })}
                  className={`w-9 h-7 text-[12px] font-bold font-body rounded-sm border cursor-pointer transition-colors ${
                    showroom.columns === n
                      ? 'bg-brand text-white border-brand'
                      : 'bg-field text-muted border-border hover:border-brand'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Global toggles */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Preis anzeigen</span>
          <ToggleSwitch on={showroom.showPrice} onChange={() => updateShowroom({ showPrice: !showroom.showPrice })} size="sm" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Spezifikationen anzeigen</span>
          <ToggleSwitch on={showroom.showSpecs} onChange={() => updateShowroom({ showSpecs: !showroom.showSpecs })} size="sm" />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-muted tracking-widest uppercase">
            Presets ({showroom.presets.length})
          </div>
          <button
            onClick={addPreset}
            className="h-7 px-3 text-[11px] font-bold font-body rounded-sm border-none cursor-pointer bg-brand text-white hover:opacity-90 transition-colors"
          >
            + Neues Preset
          </button>
        </div>

        {sortedPresets.length === 0 && (
          <div className="text-center py-8 text-muted">
            <div className="text-2xl mb-2">{"\uD83C\uDFAD"}</div>
            <div className="text-[12px]">Noch keine Presets vorhanden.</div>
            <div className="text-[11px] text-muted mt-0.5">Erstelle ein Preset, um vorkonfigurierte Produkte im Showroom anzuzeigen.</div>
          </div>
        )}

        {sortedPresets.map((preset) => {
          const product = products.find((p) => p.id === preset.productId);
          const isExpanded = expandedPreset === preset.id;
          const displayTitle = preset.title || (preset.isBlank ? 'Blanko-Preset' : 'Unbenanntes Preset');

          return (
            <div
              key={preset.id}
              className={`border-[1.5px] rounded p-4 transition-all duration-200 ${
                preset.enabled ? 'border-brand bg-[rgba(31,59,49,0.03)]' : 'border-border bg-field'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => movePreset(preset.id, -1)}
                      className="text-[10px] text-muted bg-transparent border-none cursor-pointer p-0 leading-none hover:text-brand"
                      aria-label="Nach oben"
                    >
                      {"\u25B2"}
                    </button>
                    <button
                      onClick={() => movePreset(preset.id, 1)}
                      className="text-[10px] text-muted bg-transparent border-none cursor-pointer p-0 leading-none hover:text-brand"
                      aria-label="Nach unten"
                    >
                      {"\u25BC"}
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-text truncate">{displayTitle}</div>
                    <div className="text-[11px] text-muted truncate">
                      {product ? product.label : 'Kein Produkt'}
                    </div>
                    {!preset.isBlank && preset.productId && (() => {
                      const prod = products.find(p => p.id === preset.productId);
                      const needsSchriftzug = prod && (prod.motif === "schriftzug" || prod.id === "schriftzug" || prod.id === "garderobe");
                      const hasSchriftzug = preset.formSnapshot?.schriftzug?.trim();
                      if (needsSchriftzug && !hasSchriftzug) {
                        return (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-error font-semibold">{"\u26A0"} Schriftzug fehlt</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <ToggleSwitch
                  on={preset.enabled}
                  onChange={() => updatePreset(preset.id, { enabled: !preset.enabled })}
                  size="md"
                />
              </div>

              {/* Image preview */}
              {(preset.images || []).length > 0 && (
                <div className="mb-2">
                  <ImageCarousel images={preset.images} className="max-w-[280px]" />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setExpandedPreset(isExpanded ? null : preset.id)}
                  className="text-[11px] font-bold text-brand cursor-pointer bg-transparent border-none p-0 font-body hover:underline"
                >
                  Einstellungen {isExpanded ? '\u25B2' : '\u25BC'}
                </button>
                {preset.productId && (
                  <button
                    onClick={() => setConfiguringPresetId(preset.id)}
                    className="text-[11px] font-bold text-brand cursor-pointer bg-transparent border-none p-0 font-body hover:underline"
                  >
                    Konfigurieren
                  </button>
                )}
                <button
                  onClick={() => removePreset(preset.id)}
                  className="text-[11px] font-bold text-error cursor-pointer bg-transparent border-none p-0 font-body hover:underline ml-auto"
                >
                  L\u00F6schen
                </button>
              </div>

              {/* Expandable settings panel */}
              {isExpanded && (
                <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-border">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Titel</label>
                    <input
                      type="text"
                      value={preset.title}
                      onChange={(e) => updatePreset(preset.id, { title: e.target.value })}
                      placeholder="Preset-Titel..."
                      className={fieldCls}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Beschreibung</label>
                    <input
                      type="text"
                      value={preset.desc}
                      onChange={(e) => updatePreset(preset.id, { desc: e.target.value })}
                      placeholder="Kurze Beschreibung..."
                      className={fieldCls}
                    />
                  </div>

                  {/* Product type dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Produkttyp</label>
                    <select
                      value={preset.productId}
                      onChange={(e) => updatePreset(preset.id, { productId: e.target.value })}
                      className={fieldCls}
                    >
                      <option value="">Kein Produkt</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Click behavior */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">Klick-Verhalten</label>
                    <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                      {clickBehaviors.map((b) => (
                        <button
                          key={b.value}
                          onClick={() => updatePreset(preset.id, { clickBehavior: b.value })}
                          className={`flex-1 text-center py-1.5 text-[10px] font-bold font-body border-none cursor-pointer transition-colors ${
                            preset.clickBehavior === b.value
                              ? 'bg-brand text-white'
                              : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA text */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">CTA-Text</label>
                    <input
                      type="text"
                      value={preset.ctaText}
                      onChange={(e) => updatePreset(preset.id, { ctaText: e.target.value })}
                      placeholder="Jetzt gestalten"
                      className={fieldCls}
                    />
                  </div>

                  {/* isBlank toggle */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-text">Blanko-Preset</span>
                      <ToggleSwitch
                        on={preset.isBlank}
                        onChange={() => updatePreset(preset.id, { isBlank: !preset.isBlank })}
                        size="sm"
                      />
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">Blanko-Presets haben keine vorkonfigurierten Werte und starten den Wizard von Anfang an.</div>
                  </div>

                  {/* Visibility overrides */}
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">Sichtbarkeit</div>

                    <div className="flex flex-col gap-2">
                      {/* showTitle toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Titel anzeigen</span>
                        <ToggleSwitch
                          on={preset.showTitle}
                          onChange={() => updatePreset(preset.id, { showTitle: !preset.showTitle })}
                          size="sm"
                        />
                      </div>

                      {/* showDesc toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Beschreibung anzeigen</span>
                        <ToggleSwitch
                          on={preset.showDesc}
                          onChange={() => updatePreset(preset.id, { showDesc: !preset.showDesc })}
                          size="sm"
                        />
                      </div>

                      {/* showPrice tri-state */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Preis</span>
                        <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                          {[
                            { value: null, label: 'Auto' },
                            { value: true, label: 'An' },
                            { value: false, label: 'Aus' },
                          ].map((opt) => (
                            <button
                              key={String(opt.value)}
                              onClick={() => updatePreset(preset.id, { showPrice: opt.value })}
                              className={`px-2.5 py-1 text-[10px] font-bold font-body border-none cursor-pointer transition-colors ${
                                preset.showPrice === opt.value
                                  ? 'bg-brand text-white'
                                  : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* showSpecs tri-state */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Spezifikationen</span>
                        <div className="flex rounded-sm border border-border overflow-hidden bg-field">
                          {[
                            { value: null, label: 'Auto' },
                            { value: true, label: 'An' },
                            { value: false, label: 'Aus' },
                          ].map((opt) => (
                            <button
                              key={String(opt.value)}
                              onClick={() => updatePreset(preset.id, { showSpecs: opt.value })}
                              className={`px-2.5 py-1 text-[10px] font-bold font-body border-none cursor-pointer transition-colors ${
                                preset.showSpecs === opt.value
                                  ? 'bg-brand text-white'
                                  : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image URLs management */}
                  <div>
                    <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-1.5">Bilder</div>
                    <div className="flex flex-col gap-1.5 mb-2">
                      {(preset.images || []).map((url, i) => (
                        <div key={i} className="flex items-center gap-1.5 group">
                          <img src={url} alt="" className="w-10 h-7 object-cover rounded-sm border border-border shrink-0" />
                          <span className="text-[10px] text-muted truncate flex-1 min-w-0">{url}</span>
                          <button
                            onClick={() => updatePreset(preset.id, {
                              images: preset.images.filter((_, j) => j !== i),
                            })}
                            className="text-[10px] text-error bg-transparent border-none cursor-pointer p-0.5 opacity-50 hover:opacity-100 shrink-0"
                            aria-label="Bild entfernen"
                          >
                            {"\u2715"}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={newImageUrl[preset.id] || ""}
                        onChange={(e) => setNewImageUrl((prev) => ({ ...prev, [preset.id]: e.target.value }))}
                        placeholder="https://..."
                        className={`${fieldCls} flex-1`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newImageUrl[preset.id]?.trim()) {
                            updatePreset(preset.id, {
                              images: [...(preset.images || []), newImageUrl[preset.id].trim()],
                            });
                            setNewImageUrl((prev) => ({ ...prev, [preset.id]: "" }));
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!newImageUrl[preset.id]?.trim()) return;
                          updatePreset(preset.id, {
                            images: [...(preset.images || []), newImageUrl[preset.id].trim()],
                          });
                          setNewImageUrl((prev) => ({ ...prev, [preset.id]: "" }));
                        }}
                        disabled={!newImageUrl[preset.id]?.trim()}
                        className={`h-7 px-3 text-[10px] font-bold font-body rounded-sm border-none cursor-pointer transition-colors ${
                          newImageUrl[preset.id]?.trim()
                            ? 'bg-brand text-white hover:opacity-90'
                            : 'bg-border text-muted cursor-default'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {configuringPresetId && (
        <PresetWizard
          preset={showroom.presets.find((p) => p.id === configuringPresetId)}
          products={products}
          onSave={(formState) => {
            updatePreset(configuringPresetId, {
              formSnapshot: formState,
              isBlank: false,
            });
            setConfiguringPresetId(null);
          }}
          onCancel={() => setConfiguringPresetId(null)}
        />
      )}
    </div>
  );
}
