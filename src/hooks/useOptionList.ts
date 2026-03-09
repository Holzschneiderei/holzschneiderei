import { useState, useMemo, useCallback } from "react";
import { getActiveItems, getAllItems } from "../data/optionLists";
import type { OptionItem, FlatItem, ToggleMap } from "../types/config";

interface UseOptionListReturn {
  items: OptionItem[];
  setItems: React.Dispatch<React.SetStateAction<OptionItem[]>>;
  activeItems: FlatItem[];
  allItemsFlat: FlatItem[];
  enabled: ToggleMap;
  setEnabled: (enabledMap: ToggleMap) => void;
  toggleItem: (value: string) => void;
  addItem: (item: Partial<OptionItem> & { label: string }) => void;
  removeItem: (value: string) => void;
  updateItem: (value: string, changes: Partial<OptionItem>) => void;
  reorderItems: (fromIdx: number, toIdx: number) => void;
  active: FlatItem[];
  toggle: (value: string) => void;
}

export default function useOptionList(
  defaultItems: OptionItem[],
  formValue: string,
  onFallback?: (value: string) => void,
  initialItems?: OptionItem[],
): UseOptionListReturn {
  const [items, setItems] = useState<OptionItem[]>(() => (initialItems ?? defaultItems).map((item, i) => ({
    ...item,
    sortOrder: item.sortOrder ?? i,
  })));

  const activeItems = useMemo(() => getActiveItems(items), [items]);
  const allItemsFlat = useMemo(() => getAllItems(items), [items]);

  const toggleItem = useCallback((value: string) => {
    let fallbackValue: string | null = null;
    setItems((prev) => {
      const next = prev.map((item) =>
        item.value === value ? { ...item, enabled: !item.enabled } : item
      );
      if (next.filter((item) => item.enabled).length === 0) return prev;
      const toggled = next.find((item) => item.value === value);
      if (toggled && !toggled.enabled && value === formValue) {
        const first = next.find((item) => item.enabled);
        if (first) fallbackValue = first.value;
      }
      return next;
    });
    if (fallbackValue !== null && onFallback) onFallback(fallbackValue);
  }, [formValue, onFallback]);

  const addItem = useCallback((item: Partial<OptionItem> & { label: string }) => {
    setItems((prev) => {
      const slug = item.value || item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (prev.some((p) => p.value === slug)) return prev;
      const maxSort = prev.reduce((max, p) => Math.max(max, p.sortOrder), -1);
      return [...prev, { enabled: true, sortOrder: maxSort + 1, meta: {}, ...item, value: slug }];
    });
  }, []);

  const removeItem = useCallback((value: string) => {
    let fallbackValue: string | null = null;
    setItems((prev) => {
      if (prev.filter((item) => item.enabled).length <= 1 && prev.find((item) => item.value === value)?.enabled) {
        return prev;
      }
      const next = prev.filter((item) => item.value !== value);
      if (value === formValue) {
        const first = next.find((item) => item.enabled);
        if (first) fallbackValue = first.value;
      }
      return next;
    });
    if (fallbackValue !== null && onFallback) onFallback(fallbackValue);
  }, [formValue, onFallback]);

  const updateItem = useCallback((value: string, changes: Partial<OptionItem>) => {
    setItems((prev) => prev.map((item) =>
      item.value === value
        ? { ...item, ...changes, meta: { ...item.meta, ...(changes.meta || {}) } }
        : item
    ));
  }, []);

  const reorderItems = useCallback((fromIdx: number, toIdx: number) => {
    setItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const [moved] = sorted.splice(fromIdx, 1);
      sorted.splice(toIdx, 0, moved!);
      return sorted.map((item, i) => ({ ...item, sortOrder: i }));
    });
  }, []);

  const enabled = useMemo<ToggleMap>(() =>
    items.reduce<ToggleMap>((acc, item) => ({ ...acc, [item.value]: item.enabled }), {}),
    [items]
  );

  const setEnabled = useCallback((enabledMap: ToggleMap) => {
    setItems((prev) => prev.map((item) => ({
      ...item,
      enabled: enabledMap[item.value] ?? item.enabled,
    })));
  }, []);

  return {
    items, setItems, activeItems, allItemsFlat, enabled, setEnabled,
    toggleItem, addItem, removeItem, updateItem, reorderItems,
    active: activeItems, toggle: toggleItem,
  };
}
