interface FadeProps {
  children: React.ReactNode;
}

export default function Fade({ children }: FadeProps) {
  return <div className="animate-fade-up">{children}</div>;
}
