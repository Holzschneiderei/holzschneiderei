import { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  req?: boolean;
  error?: string | boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export default function SelectField({ label, req, error, value, onChange, options }: SelectFieldProps) {
  const id = useId();
  const errorId = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-2 text-text">
        {label}{req && <span className="text-error ml-1" aria-hidden="true">*</span>}{req && <span className="sr-only"> (erforderlich)</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full h-[48px] px-4 pr-9 text-base font-body text-text bg-field border rounded cursor-pointer transition-all duration-200 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%277%27%3E%3Cpath%20d=%27M1%201l5%205%205-5%27%20fill=%27none%27%20stroke=%27%235b615b%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] ${error ? 'border-error' : 'border-border'}`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && typeof error === "string" && <p id={errorId} role="alert" className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  );
}
