export default function AdminImportExport({ onExport, onImport }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 p-3 bg-field border border-border rounded">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3v10M6 9l4 4 4-4" />
          <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-text mb-0.5">Exportieren</div>
          <div className="text-[11px] text-muted leading-snug mb-2">Aktuelle Konfiguration als JSON-Datei herunterladen. Enthält alle Einstellungen, Preise und Grenzen.</div>
          <button className="wz-btn wz-btn-ghost h-8 px-4 text-[11px]" onClick={onExport}>
            JSON exportieren
          </button>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-field border border-border rounded">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17V7M6 11l4-4 4 4" />
          <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-text mb-0.5">Importieren</div>
          <div className="text-[11px] text-muted leading-snug mb-2">JSON-Datei laden und alle Einstellungen überschreiben. Die aktuelle Konfiguration geht dabei verloren.</div>
          <button className="wz-btn wz-btn-ghost h-8 px-4 text-[11px]" onClick={onImport}>
            JSON importieren
          </button>
        </div>
      </div>
    </div>
  );
}
