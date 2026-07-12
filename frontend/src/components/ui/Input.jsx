import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label} {props.required && <span className="text-[var(--color-danger)]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full rounded-[10px] border bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--border-base)]'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
