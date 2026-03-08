import { useState } from "react";
import Fade from "../ui/Fade";
import { useWizard } from "../../context/WizardContext";
import { berge, t } from "../../data/constants";
import { getProductGroups } from "../../data/products";
import SelectionCard from "../ui/SelectionCard";

export default function PhaseTypen({ startWizard, triggerShake, setErrors }) {
  const { form, set, errors, products, texts } = useWizard();
  const [comingSoonEmail, setComingSoonEmail] = useState("");

  const productGroups = products ? getProductGroups(products) : [];
  const hasProducts = productGroups.length > 0;

  // Find which group the current product belongs to
  const currentGroup = productGroups.find((g) =>
    g.type === "group" && g.variants.some((v) => v.id === form.product)
  );

  const selectProduct = (productId) => {
    set("product", productId);
    // Set typ for backwards compat
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      if (prod.motif === "schriftzug" || prod.id === "schriftzug") {
        set("typ", "schriftzug");
        set("berg", "");
      } else if (prod.id === "bergmotiv") {
        set("typ", "bergmotiv");
        set("schriftzug", "");
      }
    }
  };

  const selectGroup = (group) => {
    // Select the primary product of the group
    selectProduct(group.primary.id);
  };

  const handleWeiter = () => {
    const e = {};
    if (hasProducts && !form.product) e.typ = true;
    if (!hasProducts && !form.typ) e.typ = true;
    setErrors(e);
    if (Object.keys(e).length) { triggerShake(); return; }
    startWizard();
  };

  // Check if the selected product is in a group with variants
  const selectedProduct = products?.find((p) => p.id === form.product);
  const showVariantToggle = currentGroup && currentGroup.variants.length > 1;

  return (
    <Fade>
      <div className="text-center mb-10">
        {texts?.produktwahl?.showHeading !== false && (
          <h1 className="text-3xl font-bold tracking-[0.02em] uppercase m-0 leading-tight mb-2 cq-fluid-h1">{texts?.produktwahl?.heading || "Dein Unikat gestalten"}</h1>
        )}
        {texts?.produktwahl?.showSubheading !== false && (
          <h2 className="text-xl font-bold tracking-[0.02em] uppercase text-muted m-0 mb-5 leading-[1.3] cq-fluid-h2">{texts?.produktwahl?.subheading || "Massanfertigung aus Schweizer Holz"}</h2>
        )}
        {texts?.produktwahl?.showDescription !== false && (
          <p className="text-muted leading-relaxed max-w-[440px] mx-auto cq-fluid-sm">
            {texts?.produktwahl?.description || "W\u00E4hle dein Produkt \u2013 danach konfigurierst du Holz, Masse und Details."}
          </p>
        )}
      </div>

      {/* Product / Type selection */}
      {hasProducts ? (
        <div role="radiogroup" aria-label="Produkt wählen" className="flex flex-col gap-4">
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(productGroups.length, 3)}, 1fr)` }}>
            {productGroups.map((entry) => {
              if (entry.type === "standalone") {
                const product = entry.product;
                if (product.comingSoon) {
                  const emailId = `coming-soon-email-${product.id}`;
                  return (
                    <div key={product.id} className="relative border-[1.5px] border-border rounded-[4px] bg-field opacity-60 flex flex-col items-center gap-2.5 py-5 px-4 text-center">
                      <span className="text-[28px]" aria-hidden="true">{product.icon}</span>
                      <span className="text-base font-bold tracking-[0.02em] uppercase text-muted">{product.label}</span>
                      <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-brand bg-brand-medium px-2 py-0.5 rounded-sm">Coming Soon</span>
                      <span className="text-xs text-muted leading-normal">{product.teaser || product.desc}</span>
                      <div className="mt-1 w-full">
                        <label htmlFor={emailId} className="sr-only">E-Mail für Benachrichtigung zu {product.label}</label>
                        <input id={emailId} type="email" placeholder="E-Mail für Benachrichtigung" value={comingSoonEmail}
                          onChange={(e) => setComingSoonEmail(e.target.value)}
                          autoComplete="email"
                          className="w-full h-8 px-2 text-[11px] font-body text-text bg-field border border-border rounded-sm text-center" />
                      </div>
                    </div>
                  );
                }
                const selected = form.product === product.id;
                return (
                  <SelectionCard key={product.id} selected={selected} onClick={() => selectProduct(product.id)}
                    role="radio" aria-checked={selected}
                    shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
                    <span className="text-[28px]" aria-hidden="true">{product.icon}</span>
                    <span className="text-base font-bold tracking-[0.02em] uppercase text-text">{product.label}</span>
                    <span className="text-sm text-muted leading-normal tracking-[0.04em]">{product.desc}</span>
                  </SelectionCard>
                );
              }

              // Grouped products: show as one card using group metadata
              const { primary, variants } = entry;
              const isSelected = variants.some((v) => v.id === form.product);
              return (
                <SelectionCard key={primary.group} selected={isSelected} onClick={() => selectGroup(entry)}
                  role="radio" aria-checked={isSelected}
                  shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
                  <span className="text-[28px]" aria-hidden="true">{primary.groupIcon || primary.icon}</span>
                  <span className="text-base font-bold tracking-[0.02em] uppercase text-text">{primary.groupLabel || primary.label}</span>
                  <span className="text-sm text-muted leading-normal tracking-[0.04em]">{primary.groupDesc || primary.desc}</span>
                </SelectionCard>
              );
            })}
          </div>

          {/* Variant toggle — appears when a grouped product is selected */}
          {showVariantToggle && (
            <Fade>
              <div className="mt-1">
                <div className="text-[11px] font-bold tracking-widest uppercase text-muted text-center mb-2.5" aria-hidden="true">Variante</div>
                <div role="group" aria-label="Variante wählen" className="flex rounded-[4px] border-[1.5px] border-border overflow-hidden bg-field">
                  {currentGroup.variants.map((variant) => {
                    const isActive = form.product === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => selectProduct(variant.id)}
                        aria-pressed={isActive}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 font-body text-[13px] font-bold tracking-[0.02em] border-none cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[-2px] ${
                          isActive
                            ? 'bg-brand text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]'
                            : 'bg-transparent text-muted hover:text-text hover:bg-[rgba(31,59,49,0.04)]'
                        }`}
                      >
                        <span className="text-base" aria-hidden="true">{variant.variantIcon || variant.icon}</span>
                        <span>{variant.variantLabel || variant.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedProduct && (
                  <div className="text-[11px] text-muted text-center mt-2 leading-normal">
                    {selectedProduct.variantDesc || selectedProduct.desc}
                  </div>
                )}
              </div>
            </Fade>
          )}
        </div>
      ) : (
        <div role="radiogroup" aria-label="Garderoben-Typ" className="grid grid-cols-2 gap-4">
          <SelectionCard selected={form.typ === "schriftzug"} onClick={() => { set("typ", "schriftzug"); set("berg", ""); }}
            role="radio" aria-checked={form.typ === "schriftzug"}
            shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
            <div className="w-full mb-1" aria-hidden="true">
              <svg viewBox="0 0 160 80" className="w-full h-20">
                <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                {[22,36,50,64,78].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
                <text x="112" y="48" textAnchor="middle" fontSize="8" fill={form.typ === "schriftzug" ? t.brand : t.muted} fontWeight="700" letterSpacing=".12em" fontFamily="system-ui">IHR TEXT</text>
                {[122,136].map((x,i) => <line key={i} x1={x} y1="22" x2={x} y2="58" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
              </svg>
            </div>
            <span className="text-base font-bold tracking-[0.02em] uppercase text-text">Schriftzug</span>
            <span className="text-sm text-muted leading-normal tracking-[0.04em]">Dein pers{"ö"}nlicher Text als Motiv {"\u2013"} z.B. Familienname oder Willkommensgruss.</span>
          </SelectionCard>
          <SelectionCard selected={form.typ === "bergmotiv"} onClick={() => { set("typ", "bergmotiv"); set("schriftzug", ""); }}
            role="radio" aria-checked={form.typ === "bergmotiv"}
            shade="light" badgeSize="lg" className="flex flex-col items-center gap-2.5 py-5 px-4 text-center">
            <div className="w-full mb-1" aria-hidden="true">
              <svg viewBox="0 0 160 80" className="w-full h-20">
                <rect x="10" y="10" width="140" height="60" rx="2" fill="none" stroke={t.border} strokeWidth="1.2" />
                <path d={berge[0].path} fill="none" stroke={form.typ === "bergmotiv" ? t.brand : t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(18,8) scale(1.24,0.72)" opacity="0.7" />
                {[30,50,110,130].map((x,i) => <line key={i} x1={x} y1="25" x2={x} y2="57" stroke={t.border} strokeWidth="2" strokeLinecap="round" />)}
              </svg>
            </div>
            <span className="text-base font-bold tracking-[0.02em] uppercase text-text">Bergmotiv</span>
            <span className="text-sm text-muted leading-normal tracking-[0.04em]">Silhouette eines Schweizer Bergs {"\u2013"} 7 ikonische Gipfel zur Auswahl.</span>
          </SelectionCard>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button onClick={handleWeiter} disabled={!form.typ}
          className={`wz-btn wz-btn-primary h-[52px] px-10 text-[14px] tracking-[0.04em] ${!form.typ ? 'opacity-35 cursor-default' : ''}`}>
          Weiter zur Konfiguration {"\u2192"}
        </button>
      </div>
    </Fade>
  );
}
