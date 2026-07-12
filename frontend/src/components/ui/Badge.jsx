import { cn } from "../../lib/utils";

export const Badge = ({ children, variant = 'gray', className }) => {
  const variants = {
    gray: 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border-[var(--border-base)]',
    blue: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)]',
    emerald: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-emerald-200 dark:border-emerald-800',
    red: 'bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-red-200 dark:border-red-800',
    amber: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
