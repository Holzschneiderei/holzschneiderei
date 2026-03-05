import Fade from "../ui/Fade";
import { DEFAULT_FORM } from "../../data/constants";
import { clearProgress } from "../../bridge";

export default function PhaseDone({ checkoutError, setPhase, setForm, setConfigId, setCheckoutError, setSubmitting }) {
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
      <div className="text-center pt-10 pb-5">
        <div className="text-5xl mb-4 opacity-80">{"\u2713"}</div>
        <h2 className="text-2xl font-bold tracking-normal uppercase m-0 leading-tight mb-3">Vielen Dank!</h2>
        <p className="text-sm text-muted leading-relaxed max-w-[380px] mx-auto mb-7">
          Ihre Konfiguration wurde gespeichert. Sie werden in K{"ü"}rze zur Bezahlung weitergeleitet.
        </p>
        {checkoutError && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 mb-4 max-w-[380px] mx-auto">
            <p className="text-[13px] text-error m-0">{checkoutError}</p>
          </div>
        )}
        <button className="inline-flex items-center justify-center h-[46px] px-6 text-sm font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border mx-auto" onClick={restart}>
          Neue Konfiguration starten
        </button>
      </div>
    </Fade>
  );
}
