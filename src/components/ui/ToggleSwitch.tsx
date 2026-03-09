interface ToggleSwitchProps {
  on: boolean;
  locked?: boolean;
  size?: 'sm' | 'md';
  onChange?: () => void;
  'aria-label'?: string;
}

export default function ToggleSwitch({ on, locked = false, size = 'md', onChange, 'aria-label': ariaLabel }: ToggleSwitchProps) {
  const md = size === 'md';

  const trackW   = md ? 'w-[38px]' : 'w-8';
  const trackH   = md ? 'h-[22px]' : 'h-[18px]';
  const trackR   = md ? 'rounded-[11px]' : 'rounded-[9px]';
  const trackPx  = md ? 'px-1' : 'px-0.5';
  const thumbSize = md ? 'w-4 h-4' : 'w-3.5 h-3.5';

  // Determine colour
  const bg = locked
    ? 'bg-brand opacity-60'
    : on
      ? 'bg-brand'
      : 'bg-border';

  // Thumb position — md uses flex justify, sm uses translate
  const thumbPos = md
    ? '' // flex-based, handled by track justify
    : on ? 'translate-x-3.5' : 'translate-x-0';

  const trackJustify = md
    ? (on || locked ? 'justify-end' : 'justify-start')
    : '';

  return (
    <div
      role="switch"
      aria-checked={on || locked}
      aria-label={ariaLabel}
      tabIndex={locked ? -1 : 0}
      onClick={locked ? undefined : onChange}
      onKeyDown={locked ? undefined : (e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange?.(); } }}
      className={[
        trackW, trackH, trackR, trackPx, bg,
        'flex items-center shrink-0 transition-colors duration-[250ms]',
        'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
        trackJustify,
        locked ? '' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className={`${thumbSize} rounded-full bg-white transition-transform duration-200 ${thumbPos}`} />
    </div>
  );
}
