import type { Dispatch, SetStateAction } from "react";
import { useWizard } from "../../context/WizardContext";
import { berge, OPTIONAL_STEPS, schriftarten } from "../../data/constants";
import { computePrice } from "../../data/pricing";
import { fmtChf } from "../../lib/format";
import type { FormState, Pricing } from "../../types/config";
import StepAusfuehrung from "../steps/StepAusfuehrung";
import StepDarstellung from "../steps/StepDarstellung";
import StepExtras from "../steps/StepExtras";
import StepHolzart from "../steps/StepHolzart";
import StepKontakt from "../steps/StepKontakt";
import StepMasse from "../steps/StepMasse";
import StepMotiv from "../steps/StepMotiv";
import StepUebersicht from "../steps/StepUebersicht";
import SideRail from "../ui/SideRail";

interface StepRendererProps {
  currentStepId: string;
}

function StepRenderer({ currentStepId }: StepRendererProps) {
  switch (currentStepId) {
    case "motiv": return <StepMotiv />;
    case "holzart": return <StepHolzart />;
    case "masse": return <StepMasse />;
    case "ausfuehrung": return <StepAusfuehrung />;
    case "extras": return <StepExtras />;
    case "darstellung": return <StepDarstellung />;
    case "kontakt": return <StepKontakt />;
    case "uebersicht": return <StepUebersicht />;
    default: return null;
  }
}

function stepLabel(id: string): string {
  const step = OPTIONAL_STEPS.find((s) => s.id === id);
  if (step) return step.label;
  if (id === "kontakt") return "Kontakt";
  if (id === "uebersicht") return "\u00DCbersicht";
  return id;
}

interface PriceIndicatorProps {
  form: FormState;
  pricing: Pricing;
}

function PriceIndicator({ form, pricing }: PriceIndicatorProps) {
  if (!pricing) return null;
  const price = computePrice(form, pricing);
  const fmt = fmtChf;
  return (
    <div className="text-xs text-muted text-center leading-tight">
      <span className="font-bold text-brand">ab CHF {fmt(price.customerPrice)}.\u2013</span>
    </div>
  );
}

interface PhaseWizardProps {
  activeSteps: string[];
  wizardIndex: number;
  currentStepId: string;
  setPhase: (phase: string) => void;
  prev: () => void;
  next: () => void;
  doSubmit: () => void;
  submitting: boolean;
  checkoutError: string | null;
  navDir: number;
  animKey: number;
  shake: boolean;
  setNavDir: (dir: number) => void;
  setWizardIndex: (idx: number) => void;
  setAnimKey: Dispatch<SetStateAction<number>>;
  compact?: boolean;
}

export default function PhaseWizard({
  activeSteps, wizardIndex, currentStepId, setPhase, prev, next, doSubmit, submitting, checkoutError,
  navDir, animKey, shake, setNavDir, setWizardIndex, setAnimKey, compact = false,
}: PhaseWizardProps) {
  const { form, pricing, activeProduct } = useWizard();
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typChip = form.typ === "schriftzug" ? `\u270F\uFE0F \u201E${form.schriftzug}\u201C \u00B7 ${fontObj?.label || ""}` : `\u26F0\uFE0F ${bergObj?.label || ""}`;
  const totalSteps = activeSteps.length;
  const progress = ((wizardIndex + 1) / totalSteps) * 100;

  const getAnimClass = () => navDir > 0 ? "animate-slide-right" : "animate-slide-left";

  return (
    <>
      <a href="#wizard-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded focus:text-sm focus:font-bold">
        Zum Hauptinhalt springen
      </a>
      <main id="wizard-main" className="flex-1 flex justify-center px-4 py-4 pb-24 cq-main-md cq-main-lg cq-main-xl">
        <div className="w-full max-w-[720px] flex cq-wizard-body-lg cq-wizard-body-xl">
          <SideRail
            steps={activeSteps} stepData={OPTIONAL_STEPS} currentIndex={wizardIndex}
            onNavigate={(i: number) => { setNavDir(i > wizardIndex ? 1 : -1); setWizardIndex(i); setAnimKey((k) => k + 1); }}
            onBack={wizardIndex === 0 ? () => setPhase("typen") : prev}
            onSubmit={doSubmit} isFirst={wizardIndex === 0} isLast={currentStepId === "uebersicht"} submitting={submitting}
            form={form} pricing={pricing}
          />
          <div className={`w-full max-w-[540px] cq-card-md cq-card-lg cq-card-xl ${shake ? 'animate-shake' : ''}`}>
            <div className="flex justify-between items-center px-0 py-2.5 mb-2 border-b border-border gap-3">
              <span className="text-xs text-muted tracking-[0.02em]" aria-hidden="true">{typChip}</span>
              <span className="text-[11px] text-muted font-semibold tracking-widest uppercase" aria-hidden="true">Schritt {wizardIndex + 1} / {totalSteps}</span>
            </div>
            <div key={animKey} className={getAnimClass()}>
              <StepRenderer currentStepId={currentStepId} />
              {checkoutError && currentStepId === "uebersicht" && (
                <div role="alert" className="bg-error/5 border border-error/20 rounded px-4 py-3.5 mt-4">
                  <p className="text-[13px] text-error m-0">{checkoutError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* fixed is intentional: mobile bottom nav needs viewport-anchoring; hidden at 1024px+ via cq-bottom-hide where SideRail takes over */}
      <nav aria-label="Schritt-Navigation" className="fixed bottom-0 left-0 right-0 bg-field/85 backdrop-blur-[12px] border-t border-border z-20 pb-[env(safe-area-inset-bottom)] cq-bottom-hide">
        <div
          role="progressbar"
          aria-valuenow={wizardIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Schritt ${wizardIndex + 1} von ${totalSteps}`}
          className="w-full h-[3px] bg-border"
        >
          <div className="h-full bg-brand transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="px-4 py-3.5 flex justify-between items-center gap-3">
          <button className="wz-btn wz-btn-ghost h-[48px] px-6 text-sm" onClick={wizardIndex === 0 ? () => setPhase("typen") : prev}>
            {"\u2190"} Zur{"ü"}ck
          </button>
          <div className="flex flex-col items-center gap-0.5" aria-hidden="true">
            <span className="text-xs font-bold text-text">{stepLabel(currentStepId)}</span>
            <PriceIndicator form={form} pricing={pricing} />
          </div>
          {currentStepId !== "uebersicht"
            ? <button className="wz-btn wz-btn-primary h-[48px] px-6 text-sm" onClick={next}>Weiter {"\u2192"}</button>
            : <button className={`wz-btn wz-btn-primary h-[48px] px-6 text-sm ${submitting ? 'opacity-60' : ''}`} onClick={doSubmit} disabled={submitting}>{submitting ? "Wird gesendet\u2026" : "Bestellen"}</button>}
        </div>
      </nav>
    </>
  );
}
