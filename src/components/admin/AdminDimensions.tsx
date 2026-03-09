import type React from 'react';
import { useRef } from 'react';
import { DIM_FIELDS, DIM_MODES } from '../../data/constants';
import ToggleSwitch from '../ui/ToggleSwitch';
import type { Constraints, DimConfig, DimModeValue } from '../../types/config';

interface AdminDimensionsProps {
  constr: Constraints;
  dimConfig: DimConfig;
  setDim: (dimKey: string, field: string, value: boolean | DimModeValue) => void;
  addPreset: (dimKey: string, value: string) => void;
  removePreset: (dimKey: string, value: number) => void;
}

export default function AdminDimensions({ constr, dimConfig, setDim, addPreset, removePreset }: AdminDimensionsProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  return (
    <div>
      {DIM_FIELDS.map((dim) => {
        const cfg = dimConfig[dim.key]!;
        const min = constr[dim.constrMin as keyof Constraints];
        const max = constr[dim.constrMax as keyof Constraints];
        return (
          <div key={dim.key} className="py-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ToggleSwitch on={cfg.enabled} size="sm" onChange={() => setDim(dim.key, "enabled", !cfg.enabled)} />
                <span className={`text-xs font-bold ${cfg.enabled ? 'text-text' : 'text-muted'}`}>{dim.label}</span>
                <span className="text-[10px] text-muted">{min}{"\u2013"}{max} {dim.unit}</span>
              </div>
              {cfg.enabled && (
                <div className="flex gap-0.5 bg-field border border-border rounded p-0.5">
                  {DIM_MODES.map((m) => (
                    <button key={m.value} onClick={() => setDim(dim.key, "mode", m.value)}
                      className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm cursor-pointer font-body ${
                        cfg.mode === m.value ? 'border-brand bg-brand text-white' : 'border-transparent bg-transparent text-muted'
                      }`}>{m.label}</button>
                  ))}
                </div>
              )}
            </div>
            {cfg.enabled && cfg.mode !== "text" && (
              <div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {cfg.presets.filter((v) => v >= min && v <= max).map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(31,59,49,0.08)] border border-border rounded text-[13px] font-semibold text-text">
                      {p}<button onClick={() => removePreset(dim.key, p)} className="bg-none border-none text-muted cursor-pointer text-[13px] font-bold p-0 px-0.5 font-body leading-none">{"\u00D7"}</button>
                    </span>
                  ))}
                  {cfg.presets.filter((v) => v < min || v > max).map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(31,59,49,0.08)] border border-border rounded text-[13px] font-semibold text-text opacity-40 line-through">
                      {p}<button onClick={() => removePreset(dim.key, p)} className="bg-none border-none text-muted cursor-pointer text-[13px] font-bold p-0 px-0.5 font-body leading-none">{"\u00D7"}</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input type="number" placeholder="Wert hinzufügen" ref={(el) => { inputRefs.current[dim.key] = el; }}
                    className="flex-1 h-7 px-2 text-[11px] font-body text-text bg-field border border-border rounded-sm"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { addPreset(dim.key, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }} />
                  <button onClick={() => { const el = inputRefs.current[dim.key]; if (el) { addPreset(dim.key, el.value); el.value = ""; } }}
                    className="inline-flex items-center justify-center h-7 px-2.5 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border">+</button>
                </div>
              </div>
            )}
            {cfg.enabled && cfg.mode === "text" && (
              <div className="text-[10px] text-muted italic">Freitext-Eingabe ({min}{"\u2013"}{max} {dim.unit})</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
