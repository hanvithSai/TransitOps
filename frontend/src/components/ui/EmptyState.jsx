import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="app-empty-state">
    {Icon && (
      <div className="app-empty-state-icon" aria-hidden="true">
        <Icon className="h-8 w-8 text-[var(--text-muted)]" />
      </div>
    )}
    <h3 className="text-h3">{title}</h3>
    {description && <p className="text-body max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <Button onClick={onAction} className="mt-2">
        {actionLabel}
      </Button>
    )}
  </div>
);
