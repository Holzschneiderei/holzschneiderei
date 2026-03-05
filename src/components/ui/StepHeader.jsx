export default function StepHeader({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-normal uppercase m-0 leading-tight">{title}</h2>
      {sub && <p className="text-base text-muted mt-2 leading-relaxed">{sub}</p>}
    </div>
  );
}
