import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  const variants = {
    primary: 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] focus-visible:ring-[var(--color-brand-500)] shadow-sm',
    secondary: 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] hover:opacity-90 focus-visible:ring-[var(--color-brand-500)]',
    outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-base)] hover:bg-[var(--bg-surface-hover)] focus-visible:ring-[var(--color-brand-500)]',
    danger: 'bg-[var(--color-error)] text-white hover:opacity-90 focus-visible:ring-[var(--color-error)] shadow-sm',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]',
  };

  const sizes = {
    sm: 'app-btn-sm',
    md: '',
    lg: 'app-btn-lg',
    icon: 'app-btn-icon',
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : size === 'icon' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <button
      type="button"
      className={cn(
        'app-btn transition-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className={cn('animate-spin', iconSize)} aria-hidden="true" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className={cn(iconSize, 'shrink-0')} aria-hidden="true" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={cn(iconSize, 'shrink-0')} aria-hidden="true" />}
    </button>
  );
};
