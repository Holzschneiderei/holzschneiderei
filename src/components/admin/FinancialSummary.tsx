import SummaryRow from '../ui/SummaryRow';
import { holzarten } from '../../data/constants';
import { computePrice } from '../../data/pricing';
import type { FormState, Pricing, Product } from '../../types/config';

interface FinancialSummaryProps {
  form: FormState;
  pricing: Pricing;
  activeProduct?: Product;
}

export default function FinancialSummary({ form, pricing, activeProduct }: FinancialSummaryProps) {
  const price = computePrice(form, pricing, activeProduct);
  const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const wood = holzarten.find((h) => h.value === form.holzart);

  if (price.isFixed) {
    return (
      <div className="p-4 bg-[rgba(31,59,49,0.03)] border-[1.5px] border-brand rounded mb-3.5">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded bg-brand-medium flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5" viewBox="0 0 18 18" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="14" height="11" rx="1.5" />
              <path d="M5 4V3a2 2 0 012-2h4a2 2 0 012 2v1" />
              <path d="M9 8v4M7 10h4" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-bold text-text">Festpreis</div>
            <div className="text-[11px] text-muted">{activeProduct?.label || "Produkt"} · {wood?.label || "–"} · {form.breite} cm</div>
          </div>
        </div>
        <div className="bg-field border border-border rounded py-1.5 overflow-hidden">
          <div className="flex justify-between items-baseline px-4 py-3 gap-3 bg-brand-light rounded">
            <span className="text-[13px] font-bold tracking-[0.06em] uppercase text-brand shrink-0">Kundenpreis</span>
            <span className="text-lg font-extrabold text-brand">CHF {fmt(price.customerPrice)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[rgba(31,59,49,0.03)] border-[1.5px] border-brand rounded mb-3.5">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-8 h-8 rounded bg-brand-medium flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5" viewBox="0 0 18 18" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="14" height="11" rx="1.5" />
            <path d="M5 4V3a2 2 0 012-2h4a2 2 0 012 2v1" />
            <path d="M9 8v4M7 10h4" />
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-bold text-text">Kalkulation</div>
          <div className="text-[11px] text-muted">Echtzeitberechnung auf Basis der Konfiguration</div>
        </div>
      </div>
      <div className="bg-field border border-border rounded py-1.5 overflow-hidden">
        <SummaryRow label="Fläche" value={`${price.surfaceM2.toFixed(3)} m²`} />
        <SummaryRow label={`Material (${wood?.label || "–"} @ ${pricing.woodCosts[form.holzart] || 0} CHF/m²)`} value={`CHF ${fmt(price.materialCost)}`} />
        <SummaryRow label={`Arbeit (${price.estimatedHours.toFixed(1)}h @ ${pricing.labourRate} CHF/h)`} value={`CHF ${fmt(price.labourCost)}`} />
        {price.extrasCost > 0 && <SummaryRow label="Extras" value={`CHF ${fmt(price.extrasCost)}`} />}
        <div className="flex justify-between items-baseline px-4 py-2.5 gap-3 border-t border-border mt-1">
          <span className="text-sm font-bold tracking-[0.06em] uppercase text-text shrink-0">Herstellkosten</span>
          <span className="text-base text-right text-text font-bold">CHF {fmt(price.productionCost)}</span>
        </div>
        <div className="flex justify-between items-baseline px-4 py-2 gap-3">
          <span className="text-sm font-bold tracking-[0.06em] uppercase text-muted shrink-0">Marge ({pricing.margin}x)</span>
          <span className="text-base text-right text-text">+{Math.round((pricing.margin - 1) * 100)}%</span>
        </div>
        <div className="flex justify-between items-baseline px-4 py-3 gap-3 bg-brand-light rounded">
          <span className="text-[13px] font-bold tracking-[0.06em] uppercase text-brand shrink-0">Kundenpreis</span>
          <span className="text-lg font-extrabold text-brand">CHF {fmt(price.customerPrice)}</span>
        </div>
      </div>
    </div>
  );
}
