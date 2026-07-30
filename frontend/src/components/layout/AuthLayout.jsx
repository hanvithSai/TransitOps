import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { cn } from '../../lib/utils';

const AuthLayout = ({ children, shake = false }) => (
  <div className="auth-page">
    <div className="auth-page-grid" aria-hidden="true" />

    <Link to="/" className="auth-brand">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-600)] shadow-[var(--shadow-sm)]">
        <Bus className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
        Transit<span className="text-[var(--color-brand-600)]">Ops</span>
      </span>
    </Link>

    <div className={cn('auth-card surface-card', shake && 'auth-shake')}>
      {children}
    </div>
  </div>
);

export default AuthLayout;
