import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error-bg)] ring-1 ring-[var(--color-error)]/30">
        <ShieldX className="h-10 w-10 text-[var(--color-error)]" aria-hidden="true" />
      </div>
      <h1 className="text-h1">Access denied</h1>
      <p className="mt-3 max-w-md text-body-lg">
        Your role{' '}
        <span className="font-semibold text-[var(--color-error-text)]">
          ({user?.role?.displayName || 'Unknown'})
        </span>{' '}
        does not have permission to view this page.
      </p>
      <p className="mt-2 text-caption text-[var(--text-muted)]">
        Contact your administrator if you believe this is a mistake.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate('/dashboard')}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
