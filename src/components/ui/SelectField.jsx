import { useId } from 'react';

export default function SelectField({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5 text-text">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[46px] px-3.5 pr-9 text-base font-body text-text bg-field border border-border rounded-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%277%27%3E%3Cpath%20d=%27M1%201l5%205%205-5%27%20fill=%27none%27%20stroke=%27%235b615b%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
