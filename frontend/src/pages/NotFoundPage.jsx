import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-surface)] ring-1 ring-[var(--border-base)]">
        <FileQuestion className="h-10 w-10 text-[var(--text-muted)]" aria-hidden="true" />
      </div>
      <h1 className="text-h1">Page not found</h1>
      <p className="mt-3 max-w-md text-body-lg text-[var(--text-secondary)]">
        The page you requested does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
          {isAuthenticated ? 'Go to dashboard' : 'Go home'}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
