import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  prefix,
  showPasswordToggle = false,
  className,
  containerClassName,
  id,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const hasLeftIcon = Icon && iconPosition === 'left';
  const hasRightIcon = Icon && iconPosition === 'right';

  return (
    <div className={cn('app-form-field w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="app-form-field-label">
          {label}
          {props.required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        {hasLeftIcon && (
          <div className="field-adornment field-adornment--start" aria-hidden="true">
            <Icon />
          </div>
        )}
        {prefix && (
          <div className="field-adornment field-adornment--prefix" aria-hidden="true">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          className={cn(
            'input-field',
            'focus-visible:outline-none',
            error && '!border-[var(--color-error)] focus-visible:!border-[var(--color-error)]',
            hasLeftIcon && 'input-field--with-left-icon',
            prefix && 'input-field--with-prefix',
            (hasRightIcon || (isPassword && showPasswordToggle)) && 'input-field--with-right-adornment',
            className,
          )}
          {...props}
        />
        {hasRightIcon && (
          <div className="field-adornment field-adornment--end" aria-hidden="true">
            <Icon />
          </div>
        )}
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="field-adornment field-adornment--end text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
            style={{ pointerEvents: 'auto' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
