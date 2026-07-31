export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center h-full">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-base)] border border-[var(--border-base)] shadow-sm">
        <Icon className="h-7 w-7 text-[var(--text-muted)]" />
      </div>
    )}
    <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
    {description && (
      <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[280px]">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
