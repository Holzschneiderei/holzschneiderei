/**
 * Circular checkmark badge — shows a ✓ indicator on selected items.
 *
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Badge size preset
 * @param {string} [props.className] - Extra positioning classes (default: "top-2 right-2.5")
 */
export default function CheckBadge({ size = "md", className }) {
  const sizes = {
    sm: "w-4 h-4 text-[9px]",
    md: "w-[18px] h-[18px] text-[10px]",
    lg: "w-[22px] h-[22px] text-xs",
  };

  const defaultPos = {
    sm: "top-1 right-1",
    md: "top-1.5 right-1.5",
    lg: "top-2.5 right-2.5",
  };

  return (
    <div className={`absolute ${className || defaultPos[size]} ${sizes[size]} rounded-full bg-brand text-white flex items-center justify-center font-bold`}>
      {"\u2713"}
    </div>
  );
}
