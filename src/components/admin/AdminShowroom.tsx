import { useState } from 'react';
import { createPreset } from '../../data/showroom';
import type { CarouselConfig, ClickBehavior, FormState, Preset, Product, Showroom } from '../../types/config';
import ImageCarousel from '../ui/ImageCarousel';
import ToggleSwitch from '../ui/ToggleSwitch';
import ToggleRow from '../ui/ToggleRow';
import AdminField from '../ui/AdminField';
import SegmentedControl from '../ui/SegmentedControl';
import ImageManager from '../ui/ImageManager';
import SectionHeading from '../ui/SectionHeading';
import PresetWizard from './PresetWizard';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface AdminShowroomProps {
  showroom: Showroom;
  setShowroom: Setter<Showroom>;
  products: Product[];
  carousel?: CarouselConfig;
}

export default function AdminShowroom({ showroom, setShowroom, products, carousel }: AdminShowroomProps) {
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [configuringPresetId, setConfiguringPresetId] = useState<string | null>(null);

  const fieldCls = "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

  const updateShowroom = (changes: Partial<Showroom>) => {
    setShowroom((prev) => ({ ...prev, ...changes }));
  };

  const updatePreset = (id: string, changes: Partial<Preset>) => {
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

  const removePreset = (id: string) => {
    setShowroom((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
    if (expandedPreset === id) setExpandedPreset(null);
  };

  const movePreset = (id: string, dir: number) => {
    setShowroom((prev) => {
      const sorted = [...prev.presets].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((p) => p.id === id);
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;
      [sorted[idx]!, sorted[targetIdx]!] = [sorted[targetIdx]!, sorted[idx]!];
      const reordered = sorted.map((p, i) => ({ ...p, sortOrder: i }));
      return { ...prev, presets: reordered };
    });
  };

  const layouts = [
    { value: 'grid' as const, label: 'Raster' },
    { value: 'hero' as const, label: 'Hero' },
    { value: 'carousel' as const, label: 'Karussell' },
  ];

  const clickBehaviors: { value: ClickBehavior; label: string }[] = [
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
        <SectionHeading>Layout</SectionHeading>

        <AdminField label="Darstellung">
          <SegmentedControl options={layouts} value={showroom.layout} onChange={(v) => updateShowroom({ layout: v })} />
        </AdminField>

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
        <ToggleRow label="Preis anzeigen" on={showroom.showPrice} onChange={() => updateShowroom({ showPrice: !showroom.showPrice })} />
        <ToggleRow label="Spezifikationen anzeigen" on={showroom.showSpecs} onChange={() => updateShowroom({ showSpecs: !showroom.showSpecs })} />
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
                  <ImageCarousel images={preset.images} className="max-w-[280px]" {...(carousel ? { interval: carousel.interval, driftDuration: carousel.driftDuration, fadeDuration: carousel.fadeDuration, zoom: carousel.zoom, aspectRatio: carousel.aspectRatio } : {})} />
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
                  <AdminField label="Titel">
                    <input
                      type="text"
                      value={preset.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreset(preset.id, { title: e.target.value })}
                      placeholder="Preset-Titel..."
                      className={fieldCls}
                    />
                  </AdminField>

                  <AdminField label="Beschreibung">
                    <input
                      type="text"
                      value={preset.desc}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreset(preset.id, { desc: e.target.value })}
                      placeholder="Kurze Beschreibung..."
                      className={fieldCls}
                    />
                  </AdminField>

                  <AdminField label="Produkttyp">
                    <select
                      value={preset.productId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updatePreset(preset.id, { productId: e.target.value })}
                      className={fieldCls}
                    >
                      <option value="">Kein Produkt</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </AdminField>

                  <AdminField label="Klick-Verhalten">
                    <SegmentedControl options={clickBehaviors} value={preset.clickBehavior} onChange={(v) => updatePreset(preset.id, { clickBehavior: v })} size="sm" />
                  </AdminField>

                  <AdminField label="CTA-Text">
                    <input
                      type="text"
                      value={preset.ctaText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePreset(preset.id, { ctaText: e.target.value })}
                      placeholder="Jetzt gestalten"
                      className={fieldCls}
                    />
                  </AdminField>

                  <ToggleRow
                    label="Blanko-Preset"
                    on={preset.isBlank}
                    onChange={() => updatePreset(preset.id, { isBlank: !preset.isBlank })}
                    hint="Blanko-Presets haben keine vorkonfigurierten Werte und starten den Wizard von Anfang an."
                  />

                  {/* Visibility overrides */}
                  <div>
                    <SectionHeading className="mb-2">Sichtbarkeit</SectionHeading>

                    <div className="flex flex-col gap-2">
                      <ToggleRow label="Titel anzeigen" on={preset.showTitle} onChange={() => updatePreset(preset.id, { showTitle: !preset.showTitle })} />
                      <ToggleRow label="Beschreibung anzeigen" on={preset.showDesc} onChange={() => updatePreset(preset.id, { showDesc: !preset.showDesc })} />

                      {/* showPrice tri-state */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Preis</span>
                        <SegmentedControl
                          options={[{ value: "auto", label: "Auto" }, { value: "on", label: "An" }, { value: "off", label: "Aus" }]}
                          value={preset.showPrice === null ? "auto" : preset.showPrice ? "on" : "off"}
                          onChange={(v) => updatePreset(preset.id, { showPrice: v === "auto" ? null : v === "on" })}
                          size="sm"
                        />
                      </div>

                      {/* showSpecs tri-state */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-text">Spezifikationen</span>
                        <SegmentedControl
                          options={[{ value: "auto", label: "Auto" }, { value: "on", label: "An" }, { value: "off", label: "Aus" }]}
                          value={preset.showSpecs === null ? "auto" : preset.showSpecs ? "on" : "off"}
                          onChange={(v) => updatePreset(preset.id, { showSpecs: v === "auto" ? null : v === "on" })}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image URLs management */}
                  <ImageManager
                    images={preset.images || []}
                    onChange={(images) => updatePreset(preset.id, { images })}
                    carousel={carousel}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {configuringPresetId && (() => {
        const configuringPreset = showroom.presets.find((p) => p.id === configuringPresetId);
        if (!configuringPreset) return null;
        return (
          <PresetWizard
            preset={configuringPreset}
            products={products}
            onSave={(formState: FormState) => {
              updatePreset(configuringPresetId, {
                formSnapshot: formState,
                isBlank: false,
              });
              setConfiguringPresetId(null);
            }}
            onCancel={() => setConfiguringPresetId(null)}
          />
        );
      })()}
    </div>
  );
}
