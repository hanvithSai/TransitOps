import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-950)] px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
        <svg className="h-10 w-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">Access Denied</h1>
      <p className="mb-1 text-[var(--color-text-secondary)]">
        Your role <span className="font-semibold text-red-400">({user?.role?.displayName || 'Unknown'})</span> does not have permission to view this page.
      </p>
      <p className="mb-8 text-sm text-[var(--color-text-muted)]">
        Contact your administrator if you believe this is a mistake.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-[var(--color-border-light)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-[var(--color-brand-600)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-500)]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
