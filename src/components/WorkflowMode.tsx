import type { Ref } from "react";
import PhaseDone from "./phases/PhaseDone";
import PhaseTypen from "./phases/PhaseTypen";
import PhaseWizard from "./phases/PhaseWizard";
import Shell from "./ui/Shell";
import { WizardProvider } from "../context/WizardContext";
import type { UseWizardStateReturn } from "../hooks/useWizardState";

interface WorkflowModeProps {
  ws: UseWizardStateReturn;
}

export default function WorkflowMode({ ws }: WorkflowModeProps) {
  if (ws.phase === "typen") {
    return (
      <WizardProvider value={ws.wizardCtx}>
        <Shell ref={ws.shellRef as Ref<HTMLDivElement>}>
          <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
            <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
              <PhaseTypen startWizard={ws.startWizard} startPreset={ws.startPreset} triggerShake={ws.triggerShake} setErrors={ws.setErrors} />
            </div>
          </main>
        </Shell>
      </WizardProvider>
    );
  }

  if (ws.phase === "done") {
    return (
      <Shell ref={ws.shellRef as Ref<HTMLDivElement>}>
        <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
          <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
            <PhaseDone
              checkoutError={ws.checkoutError} setPhase={ws.setPhase} setForm={ws.setForm}
              setConfigId={ws.setConfigId} setCheckoutError={ws.setCheckoutError} setSubmitting={ws.setSubmitting}
            />
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <WizardProvider value={ws.wizardCtx}>
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased" ref={ws.shellRef as Ref<HTMLDivElement>}>
        <PhaseWizard
          activeSteps={ws.activeSteps} wizardIndex={ws.wizardIndex} currentStepId={ws.currentStepId}
          setPhase={ws.setPhase} prev={ws.prev} next={ws.next} doSubmit={ws.doSubmit} submitting={ws.submitting} checkoutError={ws.checkoutError}
          navDir={ws.navDir} animKey={ws.animKey} shake={ws.shake}
          setNavDir={ws.setNavDir} setWizardIndex={ws.setWizardIndex} setAnimKey={ws.setAnimKey}
        />
      </div>
    </WizardProvider>
  );
}
