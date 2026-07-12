export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[10px]';
  
  const variants = {
    primary: 'bg-[var(--color-brand-900)] text-white hover:bg-[var(--color-brand-800)] focus:ring-[var(--color-brand-500)]',
    secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-base)] hover:bg-[var(--bg-surface-hover)] focus:ring-[var(--color-slate-500)]',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
