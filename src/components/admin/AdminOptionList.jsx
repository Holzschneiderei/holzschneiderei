import { useState } from 'react';
import VisibilityToggle from '../ui/VisibilityToggle';

/**
 * Reusable admin component for managing an option list.
 * Supports: visibility toggle, inline rename, reorder (arrows), add, delete.
 *
 * @param {Object} props
 * @param {Array} props.items - Full items array from useOptionList
 * @param {function} props.onToggle - toggleItem(value)
 * @param {function} props.onAdd - addItem(item)
 * @param {function} props.onRemove - removeItem(value)
 * @param {function} props.onUpdate - updateItem(value, changes)
 * @param {function} props.onReorder - reorderItems(fromIdx, toIdx)
 * @param {function} [props.renderMeta] - Optional render function for meta fields per item
 * @param {string} [props.addPlaceholder] - Placeholder for the add input
 */
export default function AdminOptionList({ items, onToggle, onAdd, onRemove, onUpdate, onReorder, renderMeta, addPlaceholder = "Neues Element..." }) {
  const [newLabel, setNewLabel] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const enabledCount = items.filter((i) => i.enabled).length;

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    onAdd({ label, meta: {} });
    setNewLabel("");
  };

  const startEdit = (item) => {
    setEditingValue(item.value);
    setEditLabel(item.label);
  };

  const commitEdit = () => {
    if (editingValue && editLabel.trim()) {
      onUpdate(editingValue, { label: editLabel.trim() });
    }
    setEditingValue(null);
    setEditLabel("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((item, idx) => {
        const isLast = enabledCount === 1 && item.enabled;
        const isEditing = editingValue === item.value;

        return (
          <div key={item.value}
            className={`flex items-center gap-2.5 py-2.5 px-3 border-[1.5px] rounded font-body transition-all duration-200 ${
              item.enabled ? 'border-brand bg-[rgba(31,59,49,0.05)]' : 'border-border bg-field opacity-60'
            }`}>
            {/* Reorder arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => idx > 0 && onReorder(idx, idx - 1)}
                disabled={idx === 0}
                className="w-5 h-4 flex items-center justify-center text-[10px] text-muted hover:text-brand disabled:opacity-30 disabled:cursor-default cursor-pointer bg-transparent border-none p-0 font-body"
                title="Nach oben"
              >{"\u25B2"}</button>
              <button
                onClick={() => idx < sorted.length - 1 && onReorder(idx, idx + 1)}
                disabled={idx === sorted.length - 1}
                className="w-5 h-4 flex items-center justify-center text-[10px] text-muted hover:text-brand disabled:opacity-30 disabled:cursor-default cursor-pointer bg-transparent border-none p-0 font-body"
                title="Nach unten"
              >{"\u25BC"}</button>
            </div>

            {/* Label (inline editable) */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingValue(null); }}
                  autoFocus
                  className="w-full h-7 px-2 text-[13px] font-body text-text bg-field border border-brand rounded-sm"
                />
              ) : (
                <button
                  onClick={() => startEdit(item)}
                  className="text-[13px] font-bold text-text cursor-pointer bg-transparent border-none p-0 text-left font-body hover:text-brand"
                  title="Klicken zum Umbenennen"
                >
                  {item.label}
                </button>
              )}
              {renderMeta && <div className="mt-0.5">{renderMeta(item)}</div>}
            </div>

            {/* Visibility toggle */}
            <VisibilityToggle
              visible={item.enabled}
              disabled={isLast}
              onClick={() => !isLast && onToggle(item.value)}
            />

            {/* Delete button */}
            <button
              onClick={() => !isLast && onRemove(item.value)}
              disabled={isLast}
              className="w-6 h-6 flex items-center justify-center text-[14px] text-muted hover:text-error cursor-pointer bg-transparent border-none p-0 font-body disabled:opacity-30 disabled:cursor-default shrink-0"
              title="Löschen"
            >{"\u00D7"}</button>
          </div>
        );
      })}

      {/* Add new item row */}
      <div className="flex items-center gap-2 mt-2 px-3 py-2 border border-dashed border-border rounded bg-transparent">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder={addPlaceholder}
          className="flex-1 h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim()}
          className="h-7 px-3 text-[11px] font-bold font-body text-white bg-brand rounded-sm cursor-pointer border-none disabled:opacity-40 disabled:cursor-default"
        >+ Hinzufügen</button>
      </div>
    </div>
  );
}
