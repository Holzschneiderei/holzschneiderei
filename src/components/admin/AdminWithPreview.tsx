import { useEffect, useRef, useState } from 'react';

interface Viewport {
  id: string;
  label: string;
  w: number;
  h: number;
}

const VIEWPORTS: Viewport[] = [
  { id: 'phone', label: 'Mobile', w: 375, h: 667 },
  { id: 'tablet', label: 'Tablet', w: 768, h: 1024 },
  { id: 'desktop', label: 'Desktop', w: 1280, h: 800 },
];

interface PreviewFrameProps {
  viewport: Viewport;
  children: React.ReactNode;
}

function PreviewFrame({ viewport, children }: PreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const aw = el.clientWidth;
      const ah = el.clientHeight - 24; // reserve space for meta label
      const sw = aw / viewport.w;
      const sh = ah / viewport.h;
      setScale(Math.min(1, sw, sh));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewport.w, viewport.h]);

  const pct = Math.round(scale * 100);

  return (
    <div ref={containerRef} className="preview-frame-container">
      <div
        className="preview-frame-device"
        style={{
          width: viewport.w,
          height: viewport.h,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          borderRadius: viewport.id === 'phone' ? 32 : viewport.id === 'tablet' ? 20 : 8,
        }}
      >
        {/* Top bar / notch */}
        {viewport.id !== 'desktop' ? (
          <div className="flex justify-center py-1.5 shrink-0">
            <div
              className="bg-border rounded-sm"
              style={{ width: viewport.id === 'phone' ? 80 : 100, height: 4 }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 bg-[rgba(31,59,49,0.03)] border-b border-border">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(31,59,49,0.12)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(31,59,49,0.12)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(31,59,49,0.12)]" />
          </div>
        )}
        <div className="preview-frame-screen">
          {children}
        </div>
        {/* Home indicator (mobile/tablet only) */}
        {viewport.id !== 'desktop' && (
          <div className="flex justify-center py-2 shrink-0">
            <div
              className="bg-border rounded-full"
              style={{ width: viewport.id === 'phone' ? 100 : 120, height: 4 }}
            />
          </div>
        )}
      </div>
      {/* Dimension label — positioned at the bottom of the scaled frame */}
      <div className="preview-frame-meta" style={{ marginTop: viewport.h * scale }}>
        {viewport.w} x {viewport.h}
        {pct < 100 && <span className="preview-frame-scale">{pct}%</span>}
      </div>
    </div>
  );
}

interface ViewportTabsProps {
  viewport: string;
  onChange: (id: string) => void;
}

function ViewportTabs({ viewport, onChange }: ViewportTabsProps) {
  return (
    <div className="flex gap-0.5 bg-[rgba(31,59,49,0.06)] rounded-md p-0.5">
      {VIEWPORTS.map(vp => (
        <button
          key={vp.id}
          onClick={() => onChange(vp.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold tracking-[0.08em] uppercase border-none cursor-pointer transition-all duration-150 ${
            viewport === vp.id
              ? 'bg-brand text-white shadow-[0_1px_4px_rgba(31,59,49,0.2)]'
              : 'bg-transparent text-muted hover:text-text'
          }`}
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.3">
            {vp.id === 'phone' ? (
              <>
                <rect x="4" y="1" width="8" height="14" rx="1.5" />
                <line x1="7" y1="12.5" x2="9" y2="12.5" />
              </>
            ) : vp.id === 'tablet' ? (
              <>
                <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
                <line x1="6.5" y1="11" x2="9.5" y2="11" />
              </>
            ) : (
              <>
                <rect x="1" y="2" width="14" height="10" rx="1.5" />
                <line x1="8" y1="12" x2="8" y2="14" />
                <line x1="5" y1="14" x2="11" y2="14" />
              </>
            )}
          </svg>
          {vp.label}
        </button>
      ))}
    </div>
  );
}

interface CollapseChevronProps {
  collapsed?: boolean;
}

function CollapseChevron({ collapsed }: CollapseChevronProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`w-3 h-3 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
    >
      <path d="M8 2l-4 4 4 4" />
    </svg>
  );
}

interface AdminWithPreviewProps {
  adminContent: React.ReactNode;
  previewContent: React.ReactNode;
}

export default function AdminWithPreview({ adminContent, previewContent }: AdminWithPreviewProps) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [viewport, setViewport] = useState('phone');

  const vp = VIEWPORTS.find(v => v.id === viewport) ?? VIEWPORTS[0]!;

  return (
    <div
      className={`admin-with-preview ${previewCollapsed ? 'admin-preview-collapsed' : ''}`}
      data-viewport={viewport}
    >
      {/* Admin panel */}
      <div className="admin-with-preview-main">
        {adminContent}
      </div>

      {/* Desktop/tablet preview panel */}
      <div className="admin-with-preview-aside">
        {previewCollapsed ? (
          /* Collapsed: entire strip is clickable */
          <button
            className="admin-preview-collapsed-bar"
            onClick={() => setPreviewCollapsed(false)}
            title="Vorschau einblenden"
          >
            <div className="w-6 h-6 flex items-center justify-center text-muted rounded border border-border shrink-0">
              <CollapseChevron collapsed />
            </div>
            <span className="admin-preview-collapsed-label">Vorschau</span>
          </button>
        ) : (
          /* Expanded: viewport tabs + preview */
          <div className="admin-preview-sticky">
            <div className="flex items-center justify-between gap-2 mb-3">
              <ViewportTabs viewport={viewport} onChange={setViewport} />
              <button
                onClick={() => setPreviewCollapsed(true)}
                className="w-6 h-6 flex items-center justify-center text-muted hover:text-text cursor-pointer bg-transparent border border-border rounded transition-colors shrink-0"
                title="Vorschau ausblenden"
              >
                <CollapseChevron />
              </button>
            </div>
            <PreviewFrame viewport={vp}>
              {previewContent}
            </PreviewFrame>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="admin-preview-fab"
        title="Vorschau anzeigen"
      >
        <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
          <circle cx="10" cy="10" r="2.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {showMobilePreview && (
        <div className="admin-preview-overlay" onClick={() => setShowMobilePreview(false)}>
          <div className="admin-preview-overlay-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <ViewportTabs viewport={viewport} onChange={setViewport} />
              <button
                onClick={() => setShowMobilePreview(false)}
                className="w-8 h-8 flex items-center justify-center text-lg text-muted hover:text-text cursor-pointer bg-transparent border-none"
              >{'\u00D7'}</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <PreviewFrame viewport={vp}>
                {previewContent}
              </PreviewFrame>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
