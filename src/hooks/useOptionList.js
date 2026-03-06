import { useState, useMemo, useCallback } from "react";
import { getActiveItems, getAllItems } from "../data/optionLists";

/**
 * Manages a mutable option list with CRUD, toggle, and reorder operations.
 * Replaces useToggleSet with full list management.
 *
 * @param {Array} defaultItems - Default option list items (from optionLists.js)
 * @param {string} formValue - Currently selected value in the form (for fallback on disable)
 * @param {function} onFallback - Called with a new value when the current selection becomes disabled
 */
export default function useOptionList(defaultItems, formValue, onFallback) {
  const [items, setItems] = useState(() => defaultItems.map((item, i) => ({
    ...item,
    sortOrder: item.sortOrder ?? i,
  })));

  const activeItems = useMemo(() => getActiveItems(items), [items]);
  const allItemsFlat = useMemo(() => getAllItems(items), [items]);

  const toggleItem = useCallback((value) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.value === value ? { ...item, enabled: !item.enabled } : item
      );
      // Guard: at least 1 must remain enabled
      if (next.filter((item) => item.enabled).length === 0) return prev;
      // If current form value was disabled, fallback to first enabled
      const toggled = next.find((item) => item.value === value);
      if (toggled && !toggled.enabled && value === formValue) {
        const first = next.find((item) => item.enabled);
        if (first && onFallback) onFallback(first.value);
      }
      return next;
    });
  }, [formValue, onFallback]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const slug = item.value || item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (prev.some((p) => p.value === slug)) return prev;
      const maxSort = prev.reduce((max, p) => Math.max(max, p.sortOrder), -1);
      return [...prev, { ...item, value: slug, sortOrder: maxSort + 1, enabled: true }];
    });
  }, []);

  const removeItem = useCallback((value) => {
    setItems((prev) => {
      if (prev.filter((item) => item.enabled).length <= 1 && prev.find((item) => item.value === value)?.enabled) {
        return prev; // Guard: don't remove last enabled item
      }
      const next = prev.filter((item) => item.value !== value);
      if (value === formValue) {
        const first = next.find((item) => item.enabled);
        if (first && onFallback) onFallback(first.value);
      }
      return next;
    });
  }, [formValue, onFallback]);

  const updateItem = useCallback((value, changes) => {
    setItems((prev) => prev.map((item) =>
      item.value === value
        ? { ...item, ...changes, meta: { ...item.meta, ...(changes.meta || {}) } }
        : item
    ));
  }, []);

  const reorderItems = useCallback((fromIdx, toIdx) => {
    setItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const [moved] = sorted.splice(fromIdx, 1);
      sorted.splice(toIdx, 0, moved);
      return sorted.map((item, i) => ({ ...item, sortOrder: i }));
    });
  }, []);

  // Compatibility: enabled map (like useToggleSet)
  const enabled = useMemo(() =>
    items.reduce((acc, item) => ({ ...acc, [item.value]: item.enabled }), {}),
    [items]
  );

  const setEnabled = useCallback((enabledMap) => {
    setItems((prev) => prev.map((item) => ({
      ...item,
      enabled: enabledMap[item.value] ?? item.enabled,
    })));
  }, []);

  return {
    items,
    setItems,
    activeItems,
    allItemsFlat,
    enabled,
    setEnabled,
    toggleItem,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    // Legacy compat aliases
    active: activeItems,
    toggle: toggleItem,
  };
}
