interface AdminFieldProps {
  label: string;
  children: React.ReactNode;
}

export default function AdminField({ label, children }: AdminFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted tracking-widest uppercase mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
