import { useId } from 'react';

export default function TextField({ label, req, error, value, onChange, onBlur, placeholder, type = "text", autoComplete }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5 text-text">
        {label}{req && <span className="text-error ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={`w-full h-[46px] px-3.5 text-base font-body text-text bg-field border rounded-sm ${error ? 'border-error' : 'border-border'}`}
      />
      {error && typeof error === "string" && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
