import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Toast = ({ message, type = 'success', onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const variants = {
    success: 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
    error: 'border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error-text)]',
    info: 'border-[var(--color-info)] bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={cn('app-toast', variants[type])} role="status">
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button type="button" onClick={onDismiss} className="app-toast-dismiss" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
