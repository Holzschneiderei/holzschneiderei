import CheckBadge from "./CheckBadge";

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  error?: boolean;
  shade?: "light" | "medium";
  badgeSize?: "sm" | "md" | "lg";
  badgeClassName?: string;
  noBadge?: boolean;
  className?: string;
  role?: React.AriaRole;
  "aria-checked"?: boolean;
  "aria-pressed"?: boolean;
}

export default function SelectionCard({
  selected,
  onClick,
  children,
  error = false,
  shade = "medium",
  badgeSize = "md",
  badgeClassName,
  noBadge = false,
  className = "",
  role,
  "aria-checked": ariaChecked,
  "aria-pressed": ariaPressed,
}: SelectionCardProps) {
  const bg = shade === "light" ? "bg-brand-light" : "bg-brand-medium";

  const border = error && !selected
    ? "border-error"
    : selected
      ? `border-brand ${bg} shadow-card-active`
      : "border-border bg-field";

  const hover = selected
    ? ""
    : "hover:border-brand/40 hover:bg-brand-light hover:shadow-card-hover hover:-translate-y-[1px]";

  return (
    <button
      onClick={onClick}
      role={role}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      className={`relative border-[1.5px] rounded-[4px] cursor-pointer font-body transition-all duration-200 ease-out active:translate-y-0 active:shadow-card focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${border} ${hover} ${className}`}
    >
      {selected && !noBadge && <CheckBadge size={badgeSize} className={badgeClassName} />}
      {children}
    </button>
  );
}
