import ImageCarousel from "../ui/ImageCarousel";
import { deriveSpecs } from "../../data/showroom";
import { computeFixedPrice } from "../../data/products";
import { computePrice } from "../../data/pricing";
import { DEFAULT_FORM } from "../../data/constants";

function resolveVisibility(presetVal, globalVal) {
  return presetVal !== null ? presetVal : globalVal;
}

function PresetCard({ preset, showroom, products, pricing, onSelect }) {
  const form = { ...DEFAULT_FORM, ...preset.formSnapshot, product: preset.productId };
  const product = products.find((p) => p.id === preset.productId);
  const hasImages = preset.images?.length > 0;
  const isBlank = preset.isBlank;

  const showPrice = resolveVisibility(preset.showPrice, showroom.showPrice);
  const showSpecs = resolveVisibility(preset.showSpecs, showroom.showSpecs);

  // Price computation
  let price = null;
  if (showPrice && !isBlank && product) {
    const fixed = computeFixedPrice(form, product);
    if (fixed !== null) {
      price = fixed;
    } else {
      const computed = computePrice(form, pricing);
      price = computed.customerPrice;
    }
  }

  // Specs
  const specs = showSpecs && !isBlank ? deriveSpecs(form, products) : [];

  return (
    <button
      type="button"
      onClick={() => onSelect(preset)}
      className={`group flex flex-col text-left bg-white rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
        isBlank
          ? "border-2 border-dashed border-border hover:border-brand"
          : "border border-border hover:shadow-card-hover hover:border-brand"
      }`}
      style={{ boxShadow: isBlank ? "none" : "var(--shadow-card)" }}
    >
      {/* Image area */}
      <div className="relative w-full">
        {hasImages ? (
          <div className={isBlank ? "opacity-60 sepia-[0.3]" : ""}>
            <ImageCarousel images={preset.images} />
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
        {showSpecs && specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {specs.map((s, i) => (
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
    </button>
  );
}

export default function ShowroomGrid({ showroom, products, pricing, onSelectPreset }) {
  const enabledPresets = (showroom?.presets || [])
    .filter((p) => p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (enabledPresets.length === 0) return null;

  const layout = showroom.layout || "grid";
  const columns = showroom.columns || 3;

  // Grid layout
  if (layout === "grid") {
    const gridClass =
      columns === 2 ? "cq-grid-2" :
      columns === 4 ? "cq-grid-4" :
      "cq-products-3";

    return (
      <div className={`grid gap-4 grid-cols-1 ${gridClass}`}>
        {enabledPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            showroom={showroom}
            products={products}
            pricing={pricing}
            onSelect={onSelectPreset}
          />
        ))}
      </div>
    );
  }

  // Hero layout: first card full-width, rest in grid
  if (layout === "hero") {
    const [hero, ...rest] = enabledPresets;
    const gridClass =
      columns === 2 ? "cq-grid-2" :
      columns === 4 ? "cq-grid-4" :
      "cq-products-3";

    return (
      <div className="flex flex-col gap-4">
        <PresetCard
          preset={hero}
          showroom={showroom}
          products={products}
          pricing={pricing}
          onSelect={onSelectPreset}
        />
        {rest.length > 0 && (
          <div className={`grid gap-4 grid-cols-1 ${gridClass}`}>
            {rest.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                showroom={showroom}
                products={products}
                pricing={pricing}
                onSelect={onSelectPreset}
              />
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
            <PresetCard
              preset={preset}
              showroom={showroom}
              products={products}
              pricing={pricing}
              onSelect={onSelectPreset}
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
