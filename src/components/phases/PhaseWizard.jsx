import { useWizard } from "../../context/WizardContext";
import SideRail from "../ui/SideRail";
import FlowPicker from "../ui/FlowPicker";
import StepHolzart from "../steps/StepHolzart";
import StepMasse from "../steps/StepMasse";
import StepAusfuehrung from "../steps/StepAusfuehrung";
import StepExtras from "../steps/StepExtras";
import StepKontakt from "../steps/StepKontakt";
import StepUebersicht from "../steps/StepUebersicht";
import { berge, schriftarten, OPTIONAL_STEPS } from "../../data/constants";

function StepRenderer({ currentStepId }) {
  switch (currentStepId) {
    case "holzart": return <StepHolzart />;
    case "masse": return <StepMasse />;
    case "ausfuehrung": return <StepAusfuehrung />;
    case "extras": return <StepExtras />;
    case "kontakt": return <StepKontakt />;
    case "uebersicht": return <StepUebersicht />;
    default: return null;
  }
}

export default function PhaseWizard({
  activeSteps, wizardIndex, currentStepId, setPhase, prev, next, doSubmit, submitting, checkoutError,
  flow, setFlow, navDir, animKey, shake, setNavDir, setWizardIndex, setAnimKey,
}) {
  const { form } = useWizard();
  const bergObj = berge.find((b) => b.value === form.berg);
  const fontObj = schriftarten.find((f) => f.value === form.schriftart);
  const typChip = form.typ === "schriftzug" ? `\u270F\uFE0F \u201E${form.schriftzug}\u201C \u00B7 ${fontObj?.label || ""}` : `\u26F0\uFE0F ${bergObj?.label || ""}`;

  const getAnimClass = () => {
    if (flow === "ltr") return navDir > 0 ? "animate-slide-right" : "animate-slide-left";
    if (flow === "ttb") return navDir > 0 ? "animate-slide-bottom" : "animate-slide-top";
    if (flow === "btt") return navDir > 0 ? "animate-slide-top" : "animate-slide-bottom";
    return "animate-slide-right";
  };

  return (
    <>
      <main className="flex-1 flex justify-center px-4 py-6 pb-24 cq-main-md cq-main-lg cq-main-xl">
        <div className="w-full max-w-[720px] flex cq-wizard-body-lg cq-wizard-body-xl">
          <SideRail
            steps={activeSteps} stepData={OPTIONAL_STEPS} currentIndex={wizardIndex}
            onNavigate={(i) => { setNavDir(i > wizardIndex ? 1 : -1); setWizardIndex(i); setAnimKey((k) => k + 1); }}
            onBack={wizardIndex === 0 ? () => setPhase("typen") : prev}
            onSubmit={doSubmit} isFirst={wizardIndex === 0} isLast={currentStepId === "uebersicht"} submitting={submitting}
          />
          <div className={`w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl ${shake ? 'animate-shake' : ''}`}>
            <div className="flex justify-between items-center px-0 py-2 mb-2 border-b border-border gap-3">
              <span className="text-xs text-muted">{typChip}</span>
              <FlowPicker flow={flow} onChange={setFlow} />
            </div>
            <div key={animKey} className={getAnimClass()}>
              <StepRenderer currentStepId={currentStepId} />
              {checkoutError && currentStepId === "uebersicht" && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 mt-3">
                  <p className="text-[13px] text-error m-0">{checkoutError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--wz-bg,transparent)] border-t border-border px-4 py-3 flex justify-between items-center gap-3 z-20 cq-bottom-hide">
        <button className="wz-btn wz-btn-ghost h-[46px] px-6 text-sm" onClick={wizardIndex === 0 ? () => setPhase("typen") : prev}>
          {"\u2190"} Zur{"ü"}ck
        </button>
        <div className="flex gap-1.5">
          {activeSteps.map((_, i) => <div key={i} className={`w-[7px] h-[7px] rounded-full transition-colors duration-300 ${i <= wizardIndex ? 'bg-brand' : 'bg-border'}`} />)}
        </div>
        {currentStepId !== "uebersicht"
          ? <button className="wz-btn wz-btn-primary h-[46px] px-6 text-sm" onClick={next}>Weiter {"\u2192"}</button>
          : <button className={`wz-btn wz-btn-primary h-[46px] px-6 text-sm ${submitting ? 'opacity-60' : ''}`} onClick={doSubmit} disabled={submitting}>{submitting ? "Wird gesendet\u2026" : "Bestellen"}</button>}
      </nav>
    </>
  );
}
