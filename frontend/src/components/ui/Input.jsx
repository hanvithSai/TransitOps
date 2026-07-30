import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  className,
  containerClassName,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full space-y-2', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-label !normal-case !tracking-normal !text-[var(--text-primary)]">
          {label}
          {props.required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-smooth',
            'placeholder:text-[var(--text-muted)]',
            'focus-visible:border-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]',
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            className,
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn('text-[13px] font-medium', error ? 'text-[var(--color-error)]' : 'text-[var(--text-secondary)]')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
