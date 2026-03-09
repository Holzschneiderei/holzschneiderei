import { forwardRef } from "react";

interface ShellProps {
  children: React.ReactNode;
}

const Shell = forwardRef<HTMLDivElement, ShellProps>(function Shell({ children }, ref) {
  return (
    <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased" ref={ref}>
      {children}
    </div>
  );
});

export default Shell;
