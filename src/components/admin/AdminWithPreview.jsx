import { useState } from 'react';
import PhoneFrame from '../ui/PhoneFrame';

/**
 * Two-panel layout: Admin on left, live preview on right.
 * - Desktop (>=1200px): side-by-side
 * - Tablet (768-1199px): admin + narrow preview strip
 * - Mobile (<768px): admin only + floating FAB for preview overlay
 */
export default function AdminWithPreview({ adminContent, previewContent }) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  return (
    <div className="admin-with-preview">
      {/* Admin panel */}
      <div className="admin-with-preview-main">
        {adminContent}
      </div>

      {/* Desktop/tablet preview panel */}
      <div className="admin-with-preview-aside">
        <div className="admin-preview-sticky">
          <div className="text-[9px] font-bold text-muted tracking-[0.12em] uppercase text-center mb-3">Live-Vorschau</div>
          <PhoneFrame>
            {previewContent}
          </PhoneFrame>
        </div>
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
          <div className="admin-preview-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-muted">Vorschau</span>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="w-8 h-8 flex items-center justify-center text-lg text-muted hover:text-text cursor-pointer bg-transparent border-none"
              >{"\u00D7"}</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <PhoneFrame>
                {previewContent}
              </PhoneFrame>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
