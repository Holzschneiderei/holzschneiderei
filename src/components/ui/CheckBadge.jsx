export default function CheckBadge({ size = "md", className }) {
  const sizes = {
    sm: "w-4.5 h-4.5 text-[9px]",
    md: "w-5 h-5 text-[10px]",
    lg: "w-6 h-6 text-xs",
  };

  const defaultPos = {
    sm: "top-1.5 right-1.5",
    md: "top-2 right-2",
    lg: "top-2.5 right-2.5",
  };

  return (
    <div className={`absolute ${className || defaultPos[size]} ${sizes[size]} rounded-full bg-brand text-white flex items-center justify-center font-bold shadow-btn`}>
      {"\u2713"}
    </div>
  );
}
