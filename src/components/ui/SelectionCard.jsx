import CheckBadge from "./CheckBadge";

/**
 * Reusable selectable card with border/bg state toggling, optional error ring,
 * and an automatic CheckBadge when selected.
 *
 * @param {Object}  props
 * @param {boolean} props.selected         - Whether the card is currently selected
 * @param {() => void} props.onClick       - Selection handler
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} [props.error]          - Show error border when nothing is selected
 * @param {"light" | "medium"} [props.shade="medium"] - Selected background shade
 * @param {"sm" | "md" | "lg"} [props.badgeSize="md"] - CheckBadge size preset
 * @param {string}  [props.badgeClassName] - Override CheckBadge positioning classes
 * @param {boolean} [props.noBadge]        - Suppress the checkmark badge entirely
 * @param {string}  [props.className]      - Extra classes merged onto the button
 */
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
}) {
  const bg = shade === "light" ? "bg-brand-light" : "bg-brand-medium";

  const border = error && !selected
    ? "border-error"
    : selected
      ? `border-brand ${bg}`
      : "border-border bg-field";

  return (
    <button
      onClick={onClick}
      role={role}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      className={`relative border-[1.5px] rounded cursor-pointer font-body transition-all duration-200 ${border} ${className}`}
    >
      {selected && !noBadge && <CheckBadge size={badgeSize} className={badgeClassName} />}
      {children}
    </button>
  );
}
