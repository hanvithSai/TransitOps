import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SelectField } from './SelectField';

const DEFAULT_MIN_SEARCH_OPTIONS = 6;

const filterOptions = (options, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((opt) => {
    const haystack = `${opt.label} ${opt.keywords || ''}`.toLowerCase();
    return haystack.includes(q);
  });
};

export const SearchableSelectField = forwardRef(({
  label,
  id,
  error,
  required,
  disabled,
  className,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Search or select…',
  emptyMessage = 'No matches found',
  minSearchOptions = DEFAULT_MIN_SEARCH_OPTIONS,
}, ref) => {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const listboxId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selected = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filtered = useMemo(() => filterOptions(options, query), [options, query]);

  const emitChange = useCallback((nextValue) => {
    onChange?.({ target: { value: nextValue, name } });
  }, [name, onChange]);

  const selectOption = useCallback((opt) => {
    if (opt.disabled) return;
    emitChange(opt.value);
    setQuery('');
    setOpen(false);
    setHighlightIndex(0);
  }, [emitChange]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
        onBlur?.({ target: { value, name } });
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, name, onBlur, value]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  const assignRef = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  if (options.length < minSearchOptions) {
    return (
      <SelectField
        label={label}
        id={fieldId}
        error={error}
        required={required}
        disabled={disabled}
        className={className}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </SelectField>
    );
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) setOpen(true);
      setHighlightIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const opt = filtered[highlightIndex];
      if (opt) selectOption(opt);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const displayValue = open ? query : (selected?.label ?? '');

  return (
    <div className={cn('app-form-field', className)} ref={rootRef}>
      {label && (
        <label htmlFor={fieldId} className="app-form-field-label">
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}

      <div className="searchable-select">
        <div className="field-adornment field-adornment--start" aria-hidden="true">
          <Search />
        </div>
        <div className="field-adornment field-adornment--end pointer-events-none" aria-hidden="true">
          <ChevronDown className={cn('searchable-select-chevron', open && 'searchable-select-chevron--open')} />
        </div>

        <input
          ref={assignRef}
          id={fieldId}
          type="text"
          role="combobox"
          name={name}
          autoComplete="off"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          placeholder={selected ? selected.label : placeholder}
          value={displayValue}
          className={cn(
            'input-field input-field--with-left-icon input-field--with-right-adornment searchable-select-input',
            error && '!border-[var(--color-error)] focus-visible:!border-[var(--color-error)]',
          )}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onKeyDown={handleInputKeyDown}
          onBlur={() => {
            // Close handled on outside mousedown; blur sync for RHF touched state
          }}
        />

        {open && !disabled && (
          <ul
            id={listboxId}
            role="listbox"
            className="searchable-select-list"
            aria-label={label || 'Options'}
          >
            {filtered.length === 0 ? (
              <li className="searchable-select-empty" role="presentation">{emptyMessage}</li>
            ) : (
              filtered.map((opt, index) => (
                <li
                  key={`${opt.value}-${index}`}
                  role="option"
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled || undefined}
                  className={cn(
                    'searchable-select-option',
                    opt.value === value && 'searchable-select-option--selected',
                    index === highlightIndex && 'searchable-select-option--highlighted',
                    opt.disabled && 'searchable-select-option--disabled',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectOption(opt)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <p className="text-[13px] font-medium text-[var(--color-error)]">{error}</p>}
    </div>
  );
});

SearchableSelectField.displayName = 'SearchableSelectField';
