import { DEFAULT_TEXTS } from '../../data/constants';

const FIELDS = [
  { key: 'heading', toggleKey: 'showHeading', label: 'Titel', rows: 1 },
  { key: 'subheading', toggleKey: 'showSubheading', label: 'Untertitel', rows: 1 },
  { key: 'description', toggleKey: 'showDescription', label: 'Beschreibung', rows: 2 },
];

export default function AdminProduktwahl({ texts, setTexts }) {
  const pw = texts.produktwahl || {};
  const defaults = DEFAULT_TEXTS.produktwahl;

  const setValue = (key, value) => {
    setTexts(prev => ({
      ...prev,
      produktwahl: { ...prev.produktwahl, [key]: value },
    }));
  };

  const reset = (key) => {
    setValue(key, defaults[key]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-[11px] text-muted leading-relaxed">
        Diese Texte sehen deine Kunden als Erstes im Konfigurator. Passe Titel, Untertitel und Beschreibung an dein Angebot an.
      </div>
      {FIELDS.map(({ key, toggleKey, label, rows }) => {
        const current = pw[key] || defaults[key];
        const isDefault = current === defaults[key];
        const visible = pw[toggleKey] !== false;
        return (
          <div key={key} className={`flex flex-col gap-1.5 transition-opacity ${visible ? '' : 'opacity-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  role="switch"
                  aria-checked={visible}
                  onClick={() => setValue(toggleKey, !visible)}
                  className={`relative w-8 h-[18px] rounded-full border-none cursor-pointer transition-colors duration-200 shrink-0 ${
                    visible ? 'bg-brand' : 'bg-border'
                  }`}
                >
                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    visible ? 'left-[16px]' : 'left-[2px]'
                  }`} />
                </button>
                <label className="text-[10px] font-bold tracking-[0.06em] uppercase text-muted">{label}</label>
              </div>
              {visible && !isDefault && (
                <button
                  onClick={() => reset(key)}
                  className="text-[9px] text-muted hover:text-brand cursor-pointer bg-transparent border-none underline decoration-dotted underline-offset-2 transition-colors"
                >
                  Zurücksetzen
                </button>
              )}
            </div>
            {visible && (
              <>
                {rows > 1 ? (
                  <textarea
                    value={current}
                    onChange={e => setValue(key, e.target.value)}
                    placeholder={defaults[key]}
                    rows={rows}
                    className="w-full px-3 py-2 text-sm font-body bg-field border border-border rounded text-text resize-y leading-relaxed focus:outline-none focus:border-brand transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={current}
                    onChange={e => setValue(key, e.target.value)}
                    placeholder={defaults[key]}
                    className="w-full px-3 py-2 text-sm font-body bg-field border border-border rounded text-text focus:outline-none focus:border-brand transition-colors"
                  />
                )}
                {isDefault && (
                  <div className="text-[9px] text-muted italic">Standard-Text</div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
