export default function AdminImportExport({ onExport, onImport }) {
  return (
    <div className="flex gap-2.5">
      <button className="inline-flex items-center justify-center flex-1 h-9 text-[11px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border" onClick={onExport}>
        {"\u2193"} Exportieren
      </button>
      <button className="inline-flex items-center justify-center flex-1 h-9 text-[11px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border" onClick={onImport}>
        {"\u2191"} Importieren
      </button>
    </div>
  );
}
