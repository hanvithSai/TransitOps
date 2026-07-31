import { cn } from '../../lib/utils';

export const SelectField = ({
  label,
  id,
  error,
  required,
  disabled,
  className,
  children,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full appearance-none select-field px-4 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]',
            disabled ? 'opacity-60 cursor-not-allowed bg-[var(--bg-base)]' : 'hover:bg-[var(--bg-surface-hover)]',
            error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && <p className="text-[13px] font-medium text-[var(--color-error)]">{error}</p>}
    </div>
  );
};
