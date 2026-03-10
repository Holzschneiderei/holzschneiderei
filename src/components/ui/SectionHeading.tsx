interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionHeading({ children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`text-[10px] font-bold text-muted tracking-widest uppercase ${className}`}>
      {children}
    </div>
  );
}
