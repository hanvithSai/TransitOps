import { useEffect } from 'react';

export const Toast = ({ message, type = 'success', onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const variants = {
    success: 'border-[var(--color-success)] bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    error: 'border-[var(--color-danger)] bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'border-[var(--color-info)] bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const icons = {
    success: (
      <svg className="h-5 w-5 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-[var(--color-danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-[var(--color-info)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-[10px] border px-4 py-3 text-sm font-medium shadow-lg transition-all ${variants[type]}`}>
      {icons[type]}
      {message}
    </div>
  );
};
