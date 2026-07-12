import { useEffect } from 'react';

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full ${maxWidth} overflow-hidden rounded-[14px] border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-base)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};
