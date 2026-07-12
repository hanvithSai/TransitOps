import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from "../../lib/utils";

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-md', className }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[var(--bg-base)]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full overflow-hidden rounded-[14px] border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-xl",
          "animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-base)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
