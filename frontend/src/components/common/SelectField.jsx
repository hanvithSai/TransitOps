import { cn } from '../../lib/utils';

export const SelectField = ({
  label,
  id,
  error,
  required,
  disabled,
  className,
  icon: Icon,
  children,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('app-form-field', className)}>
      {label && (
        <label htmlFor={selectId} className="app-form-field-label">
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="field-adornment field-adornment--start" aria-hidden="true">
            <Icon />
          </div>
        )}
        <select
          id={selectId}
          disabled={disabled}
          className={cn(
            'select-field',
            Icon && 'select-field--with-left-icon',
            error && '!border-[var(--color-error)] focus-visible:!border-[var(--color-error)]',
          )}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-[13px] font-medium text-[var(--color-error)]">{error}</p>}
    </div>
  );
};
