import { useState, useMemo, useCallback } from "react";

/**
 * Manages an enabled/disabled toggle set with a fallback selection.
 * Used for holzarten, schriftarten, and berge — all share the same pattern:
 * - Track which items are enabled
 * - Ensure at least one stays enabled
 * - If the currently selected form value becomes disabled, auto-select the first enabled item
 *
 * @param {Array} items - Full list of items (each must have a `.value` property)
 * @param {string} formValue - Currently selected value in the form
 * @param {function} onFallback - Called with a new value when the current selection becomes disabled
 */
export default function useToggleSet(items, formValue, onFallback) {
  const [enabled, setEnabled] = useState(
    items.reduce((acc, item) => ({ ...acc, [item.value]: true }), {})
  );

  const active = useMemo(
    () => items.filter((item) => enabled[item.value]),
    [enabled, items]
  );

  const toggle = useCallback((val) => {
    let fallbackValue = null;
    setEnabled((prev) => {
      const next = { ...prev, [val]: !prev[val] };
      if (Object.values(next).filter(Boolean).length === 0) return prev;
      if (!next[formValue]) {
        const first = items.find((item) => next[item.value]);
        if (first) fallbackValue = first.value;
      }
      return next;
    });
    if (fallbackValue !== null) onFallback(fallbackValue);
  }, [items, formValue, onFallback]);

  return { enabled, setEnabled, active, toggle };
}
