interface StepHeaderProps {
  title: string;
  sub?: string;
}

export default function StepHeader({ title, sub }: StepHeaderProps) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-bold tracking-[0.02em] uppercase m-0 leading-tight cq-fluid-h2">{title}</h2>
      {sub && <p className="text-muted mt-2.5 leading-relaxed cq-fluid-body">{sub}</p>}
    </div>
  );
}
