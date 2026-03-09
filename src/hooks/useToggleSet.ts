import { useState, useMemo, useCallback } from "react";
import type { ToggleMap, FlatItem } from "../types/config";

interface UseToggleSetReturn {
  enabled: ToggleMap;
  setEnabled: React.Dispatch<React.SetStateAction<ToggleMap>>;
  active: FlatItem[];
  toggle: (val: string) => void;
}

export default function useToggleSet(
  items: FlatItem[],
  formValue: string,
  onFallback: (value: string) => void,
  initialEnabled?: ToggleMap,
): UseToggleSetReturn {
  const [enabled, setEnabled] = useState<ToggleMap>(
    initialEnabled ?? items.reduce<ToggleMap>((acc, item) => ({ ...acc, [item.value]: true }), {})
  );

  const active = useMemo(
    () => items.filter((item) => enabled[item.value]),
    [enabled, items]
  );

  const toggle = useCallback((val: string) => {
    let fallbackValue: string | null = null;
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
