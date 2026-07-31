import { cn } from '../../lib/utils';

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn('app-empty-state h-full', className)}>
    {Icon && (
      <div className="app-empty-state-icon" aria-hidden="true">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <p className="app-empty-state-title">{title}</p>
    {description && (
      <p className="app-empty-state-description">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
