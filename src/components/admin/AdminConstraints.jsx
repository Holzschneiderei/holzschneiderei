import { hooksFor } from "../../data/pricing";

function DimensionDiagram({ constr }) {
  return (
    <div className="admin-dimension-diagram">
      <svg viewBox="0 0 340 200" className="w-full h-auto max-w-[400px] mx-auto block">
        {/* Wardrobe body */}
        <rect x="70" y="20" width="200" height="150" rx="3" fill="rgba(31,59,49,0.04)" stroke="var(--color-brand)" strokeWidth="1.5" />

        {/* Hooks row */}
        {[110, 145, 180, 215].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="55" x2={x} y2="100" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx={x} cy="102" r="2" fill="var(--color-border)" />
          </g>
        ))}
        <line x1="76" y1="55" x2="264" y2="55" stroke="var(--color-border)" strokeWidth="1" />

        {/* Width dimension (top) */}
        <line x1="70" y1="10" x2="270" y2="10" stroke="var(--color-brand)" strokeWidth="1" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
        <text x="170" y="8" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-brand)" fontFamily="var(--font-body)">
          {constr.MIN_W}–{constr.MAX_W} cm
        </text>

        {/* Height dimension (right) */}
        <line x1="280" y1="20" x2="280" y2="170" stroke="var(--color-brand)" strokeWidth="1" markerStart="url(#arrowU)" markerEnd="url(#arrowD)" />
        <text x="294" y="98" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-brand)" fontFamily="var(--font-body)" transform="rotate(90,294,98)">
          {constr.MIN_H}–{constr.MAX_H} cm
        </text>

        {/* Depth label (bottom-left) */}
        <text x="70" y="190" fontSize="9" fontWeight="600" fill="var(--color-muted)" fontFamily="var(--font-body)">
          {"Tiefe: "}{constr.MIN_D}–{constr.MAX_D} cm
        </text>

        {/* Hook spacing annotation */}
        <line x1="110" y1="113" x2="145" y2="113" stroke="var(--color-muted)" strokeWidth="0.75" strokeDasharray="2,2" />
        <text x="127.5" y="123" textAnchor="middle" fontSize="8" fill="var(--color-muted)" fontFamily="var(--font-body)">{constr.HOOK_SPACING} cm</text>

        {/* Edge margin annotation */}
        <line x1="70" y1="130" x2="110" y2="130" stroke="var(--color-muted)" strokeWidth="0.75" strokeDasharray="2,2" />
        <text x="90" y="140" textAnchor="middle" fontSize="8" fill="var(--color-muted)" fontFamily="var(--font-body)">{constr.EDGE_MARGIN} cm</text>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--color-brand)" strokeWidth="1" /></marker>
          <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="var(--color-brand)" strokeWidth="1" /></marker>
          <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto"><path d="M0,0 L3,6 L6,0" fill="none" stroke="var(--color-brand)" strokeWidth="1" /></marker>
          <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto"><path d="M0,6 L3,0 L6,6" fill="none" stroke="var(--color-brand)" strokeWidth="1" /></marker>
        </defs>
      </svg>
    </div>
  );
}

export default function AdminConstraints({ constr, setConstrVal, limits }) {
  // Pairs of (MIN_key, MAX_key) for cross-validation
  const pairs = [["MIN_W", "MAX_W"], ["MIN_H", "MAX_H"], ["MIN_D", "MAX_D"]];
  const violations = pairs.filter(([lo, hi]) => constr[lo] > constr[hi]).map(([lo]) => lo);

  return (
    <div>
      <DimensionDiagram constr={constr} />
      {/* Min/Max dimension ranges */}
      <div className="flex flex-col gap-1.5 mb-3">
        {[
          { min: "MIN_W", max: "MAX_W", label: "Breite" },
          { min: "MIN_H", max: "MAX_H", label: "Höhe" },
          { min: "MIN_D", max: "MAX_D", label: "Tiefe" },
        ].map(({ min, max, label }) => (
          <div key={min} className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-text w-12 shrink-0">{label}</span>
            <input type="number" min="1" value={constr[min]} onChange={(e) => setConstrVal(min, e.target.value)}
              className={`w-[52px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border rounded-sm shrink-0 ${violations.includes(min) ? 'border-red-400 bg-red-50' : 'border-border'}`} />
            <span className="text-[10px] text-muted px-1">{"\u2194"}</span>
            <input type="number" min="1" value={constr[max]} onChange={(e) => setConstrVal(max, e.target.value)}
              className={`w-[52px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border rounded-sm shrink-0 border-border`} />
            <span className="text-[10px] text-muted">cm</span>
          </div>
        ))}
      </div>

      {/* Other parameters */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 cq-constraint-4">
        {[
          { k: "HOOK_SPACING", l: "Haken-Abstand (cm)" }, { k: "EDGE_MARGIN", l: "Randabstand (cm)" },
          { k: "LETTER_W", l: "Breite/Buchstabe (cm)" }, { k: "LETTER_MARGIN", l: "Schrift-Rand (cm)" },
        ].map(({ k, l }) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted flex-1 min-w-0">{l}</span>
            <input type="number" min="1" value={constr[k]} onChange={(e) => setConstrVal(k, e.target.value)}
              className="w-[52px] h-[26px] text-[11px] text-center px-1 font-body text-text bg-field border border-border rounded-sm shrink-0" />
          </div>
        ))}
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
