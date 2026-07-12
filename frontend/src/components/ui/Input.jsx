import { forwardRef } from 'react';
import { cn } from "../../lib/utils";

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
    <div className={cn("space-y-2 w-full", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-primary)]">
          {label} {props.required && <span className="text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-smooth",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-[var(--text-muted)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:border-[var(--color-brand-500)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--color-error)] focus-visible:ring-[var(--color-error)] focus-visible:border-[var(--color-error)]",
            Icon && iconPosition === 'left' && "pl-10",
            Icon && iconPosition === 'right' && "pr-10",
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[var(--text-muted)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn("text-[13px] font-medium", error ? "text-[var(--color-error)]" : "text-[var(--text-secondary)]")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
