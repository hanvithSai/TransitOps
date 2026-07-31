import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg', className, id }) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = id || 'modal-title';

  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleTab = (e) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
      }
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
        aria-labelledby={titleId}
        className={cn('app-modal', maxWidth, className)}
      >
        <div className="app-modal-header">
          <h2 id={titleId} className="text-h3">{title}</h2>
          <button type="button" onClick={onClose} className="app-modal-close" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
};
