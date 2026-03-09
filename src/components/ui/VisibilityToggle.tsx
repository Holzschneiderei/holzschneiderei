interface VisibilityToggleProps {
  visible: boolean;
  disabled?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}

export default function VisibilityToggle({ visible, disabled, onClick, size = 'md' }: VisibilityToggleProps) {
  const sz = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const iconSz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const label = visible ? "Für Kunden ausblenden" : "Für Kunden einblenden";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${sz} rounded-full border-[1.5px] flex items-center justify-center p-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
        visible ? 'border-brand bg-brand-medium' : 'border-border bg-border-light'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
    >
      {visible ? (
        <svg aria-hidden="true" className={iconSz} viewBox="0 0 16 16" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      ) : (
        <svg aria-hidden="true" className={iconSz} viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
          <line x1="2" y1="14" x2="14" y2="2" />
        </svg>
      )}
    </button>
  );
}
