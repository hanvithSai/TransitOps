import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

const LoginPage = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <AuthLayout shake={shake}>
      <div className="auth-card-header">
        <h1 className="text-h1">Welcome back</h1>
        <p className="text-body">Enter your credentials to access your dashboard</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input
          label="Email address"
          id="email"
          name="email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          placeholder="name@company.com"
          required
          autoComplete="email"
        />

        <div className="space-y-2">
          <label htmlFor="password" className="text-label !normal-case !tracking-normal !text-[var(--text-primary)]">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={cn(
                'flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-smooth',
                'placeholder:text-[var(--text-muted)] focus-visible:border-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="auth-form-row">
          <Link to="/forgot-password" className="auth-link ml-auto">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Log in
        </Button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="auth-link">Create one</Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
