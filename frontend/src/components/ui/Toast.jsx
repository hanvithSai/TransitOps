import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from "../../lib/utils";

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
    success: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)] shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-[var(--color-error)] shrink-0" />,
    info: <Info className="h-5 w-5 text-[var(--color-info)] shrink-0" />,
  };

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-[120] flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm font-medium shadow-lg",
        "animate-in slide-in-from-bottom-5 fade-in duration-300",
        variants[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 mt-0.5">{message}</div>
      <button 
        onClick={onDismiss}
        className="ml-2 mt-0.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
