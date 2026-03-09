import { useState, useEffect } from 'react';

export default function AdminFusion({ enabled, onToggle }) {
  const [status, setStatus] = useState(null); // null = loading
  const [testState, setTestState] = useState('idle'); // idle | sending | success | error
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetch('/api/fusion-status')
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => setStatus({ configured: false, missing: ['API unreachable'] }));
  }, []);

  useEffect(() => {
    if (testState === 'success') {
      const t = setTimeout(() => setTestState('idle'), 3000);
      return () => clearTimeout(t);
    }
    if (testState === 'error') {
      const t = setTimeout(() => setTestState('idle'), 5000);
      return () => clearTimeout(t);
    }
  }, [testState]);

  const sendTest = async () => {
    setTestState('sending');
    try {
      const r = await fetch('/api/fusion-test', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setTestState('success');
      } else {
        setTestError(data.error || 'Unbekannter Fehler');
        setTestState('error');
      }
    } catch (err) {
      setTestError(err.message || 'Netzwerkfehler');
      setTestState('error');
    }
  };

  const configured = status?.configured === true;

  return (
    <div className="flex flex-col gap-4">
      {/* Status card */}
      <div className="flex items-start gap-3 p-3 bg-field border border-border rounded">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l2.5 1.5" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-text mb-0.5">Verbindungsstatus</div>
          {!status ? (
            <div className="text-[11px] text-muted">Prüfe Verbindung...</div>
          ) : configured ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4caf50] shrink-0" />
              <span className="text-[11px] text-text font-semibold">Verbunden</span>
              <span className="text-[11px] text-muted">{status.workshopEmail}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e53935] shrink-0" />
                <span className="text-[11px] text-text font-semibold">Nicht konfiguriert</span>
              </div>
              {status.missing?.length > 0 && (
                <div className="text-[11px] text-muted leading-snug">
                  Fehlende Umgebungsvariablen: {status.missing.join(', ')}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Test card */}
      {configured && (
        <div className="flex items-start gap-3 p-3 bg-field border border-border rounded">
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="12" rx="1" />
            <path d="M2 4l8 6 8-6" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-text mb-0.5">Testmail</div>
            <div className="text-[11px] text-muted leading-snug mb-2">
              Testmail an die Werkstatt senden, um die Zustellung zu prüfen.
            </div>
            <button
              className="wz-btn wz-btn-ghost h-8 px-4 text-[11px]"
              onClick={sendTest}
              disabled={testState === 'sending'}
            >
              {testState === 'sending' ? 'Sende...' : 'Testmail senden'}
            </button>
            {testState === 'success' && (
              <span className="ml-2 text-[11px] text-[#4caf50] font-semibold">Testmail gesendet!</span>
            )}
            {testState === 'error' && (
              <span className="ml-2 text-[11px] text-error font-semibold">{testError}</span>
            )}
          </div>
        </div>
      )}

      {/* Toggle card */}
      <div className="flex items-start gap-3 p-3 bg-field border border-border rounded">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v4" />
          <circle cx="10" cy="2" r="1" fill="currentColor" stroke="none" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-text mb-0.5">Script-Generierung</div>
          <div className="text-[11px] text-muted leading-snug mb-2">
            {configured
              ? 'Fusion 360 Script bei Bestellung generieren und per E-Mail an die Werkstatt senden.'
              : 'Erst nach erfolgreicher Verbindung aktivierbar.'}
          </div>
          <label className={`inline-flex items-center gap-2.5 cursor-pointer ${!configured ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => onToggle(!enabled)}
                disabled={!configured}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[rgba(31,59,49,0.15)] rounded-full peer-checked:bg-brand transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <span className={`text-[11px] font-semibold ${enabled && configured ? 'text-brand' : 'text-muted'}`}>
              {enabled && configured ? 'Aktiviert' : 'Deaktiviert'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
