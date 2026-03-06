export default function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline px-4 py-2 gap-3">
      <span className="text-sm font-bold tracking-[0.06em] uppercase text-muted shrink-0">{label}</span>
      <span className="text-base text-right text-text break-words">{value}</span>
    </div>
  );
}
