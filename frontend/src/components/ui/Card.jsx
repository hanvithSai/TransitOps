import { cn } from '../../lib/utils';

export const Card = ({ children, className, noPadding = false, hover = false, ...props }) => (
  <div
    className={cn(
      'surface-card transition-smooth',
      hover && 'hover:shadow-[var(--shadow-md)] hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]',
      !noPadding && 'p-6 sm:p-7',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn('mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start', className)}>
    <div>
      <h3 className="text-h3">{title}</h3>
      {subtitle && <p className="mt-1 text-body">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
