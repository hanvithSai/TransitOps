import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg', className, id }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="app-modal-overlay">
      <div className="absolute inset-0 bg-[var(--bg-base)]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id || 'modal-title'}
        className={cn('app-modal', maxWidth, className)}
      >
        <div className="app-modal-header">
          <h2 id={id || 'modal-title'} className="text-h3">{title}</h2>
          <button type="button" onClick={onClose} className="app-modal-close" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
};
