interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="w-[375px] max-w-full mx-auto border-2 border-border rounded-3xl py-2 bg-[var(--wz-bg,#f3f1ea)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex justify-center mb-1">
        <div className="w-20 h-1 rounded-sm bg-border" />
      </div>
      <div className="max-h-[667px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
