import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  fullWidth = false,
  disabled,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none rounded-xl';
  
  const variants = {
    primary: 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] focus:ring-[var(--color-brand-500)] shadow-sm hover:shadow-md hover:-translate-y-[1px]',
    secondary: 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] focus:ring-[var(--color-brand-500)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-100)] dark:hover:bg-[var(--color-brand-800)]',
    outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-base)] hover:bg-[var(--bg-surface-hover)] focus:ring-[var(--color-slate-500)]',
    danger: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-text)] focus:ring-[var(--color-error)] shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-2',
    md: 'text-sm px-5 py-2.5 gap-2.5',
    lg: 'text-base px-8 py-3.5 gap-3',
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <Loader2 className={cn("animate-spin", size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn(size === 'sm' ? "h-3.5 w-3.5" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn(size === 'sm' ? "h-3.5 w-3.5" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />
      )}
    </button>
  );
};
