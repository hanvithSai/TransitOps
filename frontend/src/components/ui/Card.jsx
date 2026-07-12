export const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm ${
        noPadding ? '' : 'p-5'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`mb-4 flex items-start justify-between gap-4 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
