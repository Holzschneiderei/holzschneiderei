export default function Shell({ r, children }) {
  return (
    <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased" ref={r}>
      {children}
    </div>
  );
}
