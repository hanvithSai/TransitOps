import { cn } from "../../lib/utils";

export const Card = ({ children, className, noPadding = false, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm",
        "transition-smooth",
        hover && "hover:shadow-md hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]",
        !noPadding && "p-6 sm:p-7",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn("mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4", className)}>
    <div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
