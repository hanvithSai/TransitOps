import { cn } from '../../lib/utils';
import { Card } from './Card';

/**
 * StatCard — KPI / metric tile with consistent inner padding and icon spacing.
 * layout: "stack" (label + icon row, value below) | "row" (icon beside text)
 */
export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueClassName,
  layout = 'stack',
  className,
}) => {
  if (layout === 'row') {
    return (
      <Card noPadding className={cn('app-stat-card app-stat-card--row', className)}>
        <div className={cn('app-stat-card-icon app-stat-card-icon--lg', iconBg, iconColor)}>
          {Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
        </div>
        <div className="app-stat-card-body">
          <p className="app-stat-card-label">{label}</p>
          <p className={cn('app-stat-card-value', valueClassName ?? 'text-[var(--text-primary)]')}>{value}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      noPadding
      className={cn(
        'app-stat-card transition-smooth hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-brand-200)] dark:hover:border-[var(--color-brand-800)]',
        className,
      )}
    >
      <div className="app-stat-card-head">
        <p className="app-stat-card-label">{label}</p>
        {Icon && (
          <div className={cn('app-stat-card-icon', iconBg, iconColor)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <p className={cn('app-stat-card-value', valueClassName ?? iconColor)}>{value}</p>
    </Card>
  );
};
