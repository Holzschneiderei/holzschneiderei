import { hooksFor } from "../../data/pricing";

export default function AdminConstraints({ constr, setConstrVal, limits }) {
  // Pairs of (MIN_key, MAX_key) for cross-validation
  const pairs = [["MIN_W", "MAX_W"], ["MIN_H", "MAX_H"], ["MIN_D", "MAX_D"]];
  const violations = pairs.filter(([lo, hi]) => constr[lo] > constr[hi]).map(([lo]) => lo);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 cq-constraint-4">
        {[
          { k: "MIN_W", l: "Min. Breite (cm)" }, { k: "MAX_W", l: "Max. Breite (cm)" },
          { k: "MIN_H", l: "Min. Höhe (cm)" }, { k: "MAX_H", l: "Max. Höhe (cm)" },
          { k: "MIN_D", l: "Min. Tiefe (cm)" }, { k: "MAX_D", l: "Max. Tiefe (cm)" },
          { k: "HOOK_SPACING", l: "Haken-Abstand (cm)" }, { k: "EDGE_MARGIN", l: "Randabstand (cm)" },
          { k: "LETTER_W", l: "Breite/Buchstabe (cm)" }, { k: "LETTER_MARGIN", l: "Schrift-Rand (cm)" },
        ].map(({ k, l }) => {
          const hasError = violations.includes(k);
          return (
            <div key={k} className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted flex-1 min-w-0">{l}</span>
              <input type="number" min="1" value={constr[k]} onChange={(e) => setConstrVal(k, e.target.value)}
                className={`w-[52px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border rounded-sm shrink-0 ${hasError ? 'border-red-400 bg-red-50' : 'border-border'}`} />
            </div>
          );
        })}
      </div>
      {violations.length > 0 && (
        <div className="mt-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-semibold">
          ⚠ Minimum ist grösser als Maximum — bitte korrigieren.
        </div>
      )}
      <div className="mt-2.5">
        <div className="text-[10px] text-muted mb-1">Haken-Verteilung:</div>
        {[limits.minW, Math.round((limits.minW + limits.maxW) / 2), limits.maxW].filter((w, i, a) => a.indexOf(w) === i).map((w) => {
          const mh = hooksFor(w, constr);
          const pct = (n) => constr.EDGE_MARGIN / w * 100 + (n * (constr.HOOK_SPACING / w * 100));
          return (
            <div key={w} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-muted w-10 text-right shrink-0">{w} cm</span>
              <div className="flex-1 h-4 bg-[rgba(31,59,49,0.05)] border border-border rounded-sm relative">
                {Array.from({ length: mh }).map((_, i) => (
                  <div key={i} className="absolute top-0.5 w-0.5 h-3 bg-brand rounded-sm opacity-70" style={{ left: `${pct(i)}%` }} />
                ))}
              </div>
              <span className="text-[10px] text-brand font-bold w-6 shrink-0">{mh}x</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
