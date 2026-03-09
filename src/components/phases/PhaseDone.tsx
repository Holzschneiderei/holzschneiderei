import type { FormState } from "../../types/config";
import Fade from "../ui/Fade";
import { DEFAULT_FORM } from "../../data/constants";
import { clearProgress } from "../../bridge";

interface PhaseDoneProps {
  checkoutError: string | null;
  setPhase: (phase: string) => void;
  setForm: (form: FormState) => void;
  setConfigId: (id: string | null) => void;
  setCheckoutError: (err: string | null) => void;
  setSubmitting: (v: boolean) => void;
}

export default function PhaseDone({ checkoutError, setPhase, setForm, setConfigId, setCheckoutError, setSubmitting }: PhaseDoneProps) {
  const restart = () => {
    setPhase("typen");
    setForm({ ...DEFAULT_FORM });
    setConfigId(null);
    setCheckoutError(null);
    setSubmitting(false);
    clearProgress();
  };

  return (
    <Fade>
      <div className="text-center pt-12 pb-6">
        <div className="w-16 h-16 rounded-full bg-brand-light border-2 border-brand flex items-center justify-center mx-auto mb-5" aria-hidden="true">
          <span className="text-2xl text-brand">{"\u2713"}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-[0.02em] uppercase m-0 leading-tight mb-3 cq-fluid-h2">Vielen Dank!</h2>
        <p className="text-sm text-muted leading-relaxed max-w-[380px] mx-auto mb-8">
          Deine Konfiguration wurde gespeichert. Du wirst in K{"ü"}rze zur Bezahlung weitergeleitet.
        </p>
        {checkoutError && (
          <div role="alert" className="bg-[#fef2f2] border border-[#fecaca] rounded px-4 py-3.5 mb-5 max-w-[380px] mx-auto">
            <p className="text-[13px] text-error m-0">{checkoutError}</p>
          </div>
        )}
        <button className="wz-btn wz-btn-ghost h-[48px] px-7 text-sm mx-auto" onClick={restart}>
          Neue Konfiguration starten
        </button>
      </div>
    </Fade>
  );
}
