import { type KeyboardEvent, useState } from "react";
import { DEFAULT_FORM } from "../../data/constants";
import { computePrice } from "../../data/pricing";
import { computeFixedPrice } from "../../data/products";
import { deriveSpecs } from "../../data/showroom";
import type { CarouselConfig, FormState, Preset, Pricing, Product, Showroom } from "../../types/config";
import ImageCarousel from "../ui/ImageCarousel";

function resolveVisibility(presetVal: boolean | null, globalVal: boolean): boolean {
  return presetVal !== null ? presetVal : globalVal;
}

interface PresetCardProps {
  preset: Preset;
  showroom: Showroom;
  products: Product[];
  pricing: Pricing;
  carousel?: CarouselConfig;
  onSelect: (preset: Preset) => void;
  expanded: boolean;
  onToggle: (id: string) => void;
}

function PresetCard({ preset, showroom, products, pricing, carousel, onSelect, expanded, onToggle }: PresetCardProps) {
  const form: FormState = { ...DEFAULT_FORM, ...preset.formSnapshot, product: preset.productId };
  const product = products.find((p) => p.id === preset.productId);
  const hasImages = preset.images?.length > 0;
  const isBlank = preset.isBlank;
  const isDetail = preset.clickBehavior === "detail";

  const showPrice = resolveVisibility(preset.showPrice, showroom.showPrice);
  const showSpecs = resolveVisibility(preset.showSpecs, showroom.showSpecs);

  // Price computation
  let price: number | null = null;
  if (!isBlank && product) {
    const fixed = computeFixedPrice(form, product);
    if (fixed !== null) {
      price = fixed;
    } else {
      const computed = computePrice(form, pricing);
      price = computed.customerPrice;
    }
  }

  // Specs — always derive for detail panel, regardless of showSpecs
  const allSpecs = !isBlank ? deriveSpecs(form, products) : [];
  const displaySpecs = showSpecs ? allSpecs : [];

  const handleClick = () => {
    if (isDetail) {
      onToggle(preset.id);
    } else {
      onSelect(preset);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`group flex flex-col text-left bg-white rounded-lg overflow-hidden transition-all duration-200 ${
        isBlank
          ? "border-2 border-dashed border-border hover:border-brand"
          : "border border-border hover:shadow-card-hover hover:border-brand"
      }`}
      style={{ boxShadow: isBlank ? "none" : "var(--shadow-card)" }}
    >
      {/* Clickable upper portion */}
      <div className="flex flex-col flex-1 cursor-pointer" onClick={handleClick} role="button" tabIndex={0} onKeyDown={handleKeyDown}>
        {/* Image area */}
        <div className="relative w-full">
          {hasImages ? (
            <div className={isBlank ? "opacity-60 sepia-[0.3]" : ""}>
              <ImageCarousel images={preset.images} {...(carousel ? { interval: carousel.interval, driftDuration: carousel.driftDuration, fadeDuration: carousel.fadeDuration, zoom: carousel.zoom, aspectRatio: carousel.aspectRatio } : {})} />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-[rgba(31,59,49,0.04)]" style={{ paddingBottom: "66.67%", position: "relative" }}>
              <span className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">
                {isBlank ? "\u270F\uFE0F" : "\u{1F4F7}"}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-1.5 p-4 flex-1">
          {preset.showTitle && preset.title && (
            <span className="text-base font-bold tracking-[0.02em] uppercase text-text leading-tight">
              {preset.title}
            </span>
          )}
          {preset.showDesc && preset.desc && (
            <span className="text-sm text-muted leading-normal tracking-[0.04em]">
              {preset.desc}
            </span>
          )}
          {showSpecs && displaySpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {displaySpecs.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-brand bg-brand-light rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {showPrice && price !== null && (
            <span className="text-sm font-bold text-brand mt-1">
              CHF {Math.round(price)}
            </span>
          )}
        </div>

        {/* CTA area */}
        <div className="px-4 pb-4">
          <span
            className={`wz-btn w-full h-[40px] text-[12px] ${
              isBlank
                ? "wz-btn-ghost border-dashed"
                : "wz-btn-primary"
            }`}
          >
            {isBlank && <span className="mr-1.5" aria-hidden="true">{"\u270F\uFE0F"}</span>}
            {preset.ctaText || "Jetzt gestalten"}
          </span>
        </div>
      </div>

      {/* Detail expansion panel */}
      {isDetail && expanded && (
        <div className="border-t border-border px-4 py-4 bg-[rgba(31,59,49,0.02)]">
          {/* Larger image carousel */}
          {preset.images.length > 1 && (
            <ImageCarousel images={preset.images} className="mb-4 rounded" {...(carousel ? { interval: carousel.interval, driftDuration: carousel.driftDuration, fadeDuration: carousel.fadeDuration, zoom: carousel.zoom, aspectRatio: carousel.aspectRatio } : {})} />
          )}
          {/* All specs */}
          {allSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {allSpecs.map((s, i) => (
                <span key={i} className="px-2.5 py-1 text-[11px] font-semibold bg-[rgba(31,59,49,0.06)] text-brand rounded-sm">{s}</span>
              ))}
            </div>
          )}
          {/* Price */}
          {price != null && (
            <div className="text-[18px] font-bold text-brand mb-4">CHF {Math.round(price)}</div>
          )}
          {/* Two action buttons */}
          <div className="flex gap-3">
            <button onClick={() => onSelect({ ...preset, clickBehavior: "summary" })}
              className="flex-1 py-2.5 rounded text-[12px] font-bold tracking-[0.04em] uppercase bg-brand text-white border-none cursor-pointer hover:opacity-90 transition-opacity font-body">
              Bestellen
            </button>
            <button onClick={() => onSelect({ ...preset, clickBehavior: "wizard" })}
              className="flex-1 py-2.5 rounded text-[12px] font-bold tracking-[0.04em] uppercase bg-transparent text-brand border-[1.5px] border-brand cursor-pointer hover:bg-brand hover:text-white transition-colors font-body">
              Anpassen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ShowroomGridProps {
  showroom: Showroom;
  products: Product[];
  pricing: Pricing;
  carousel?: CarouselConfig;
  onSelectPreset: (preset: Preset) => void;
}

export default function ShowroomGrid({ showroom, products, pricing, carousel, onSelectPreset }: ShowroomGridProps) {
  const [detailPresetId, setDetailPresetId] = useState<string | null>(null);

  const toggleDetail = (id: string) => {
    setDetailPresetId((prev) => (prev === id ? null : id));
  };

  const enabledPresets = (showroom?.presets || [])
    .filter((p) => p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (enabledPresets.length === 0) return null;

  const layout = showroom.layout || "grid";
  const columns = showroom.columns || 3;

  const cardProps = (preset: Preset) => ({
    key: preset.id,
    preset,
    showroom,
    products,
    pricing,
    carousel,
    onSelect: onSelectPreset,
    expanded: detailPresetId === preset.id,
    onToggle: toggleDetail,
  });

  // Grid layout
  if (layout === "grid") {
    const gridClass =
      columns === 2 ? "cq-grid-2" :
      columns === 4 ? "cq-grid-4" :
      "cq-products-3";

    return (
      <div className={`grid gap-4 grid-cols-1 ${gridClass}`}>
        {enabledPresets.map((preset) => (
          <PresetCard {...cardProps(preset)} />
        ))}
      </div>
    );
  }

  // Hero layout: first card full-width, rest in grid
  if (layout === "hero" && enabledPresets.length > 0) {
    const [hero, ...rest] = enabledPresets as [Preset, ...Preset[]];
    const gridClass =
      columns === 2 ? "cq-grid-2" :
      columns === 4 ? "cq-grid-4" :
      "cq-products-3";

    return (
      <div className="flex flex-col gap-4">
        <PresetCard {...cardProps(hero)} />
        {rest.length > 0 && (
          <div className={`grid gap-4 grid-cols-1 ${gridClass}`}>
            {rest.map((preset) => (
              <PresetCard {...cardProps(preset)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Carousel layout: horizontal scroll with snap
  if (layout === "carousel") {
    return (
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
        {enabledPresets.map((preset) => (
          <div key={preset.id} className="flex-shrink-0 snap-start" style={{ width: 280 }}>
            <PresetCard {...cardProps(preset)} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
