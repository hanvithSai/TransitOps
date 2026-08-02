import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPostLoginPath } from '../../lib/passwordPolicy';
import { BACKEND_STATUS, getBackendStatus, subscribeBackendStatus } from '../../services/api';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const LoginPage = () => {
  const { login, isAuthenticated, loading: authLoading, requiresPasswordChange } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [backendStatus, setBackendStatus] = useState(getBackendStatus());

  useEffect(() => subscribeBackendStatus(setBackendStatus), []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getPostLoginPath(fromPath, requiresPasswordChange), { replace: true });
    }
  }, [isAuthenticated, authLoading, requiresPasswordChange, navigate, fromPath]);

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
      navigate(getPostLoginPath(fromPath, result.requiresPasswordChange), { replace: true });
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

      {(backendStatus === BACKEND_STATUS.CHECKING || backendStatus === BACKEND_STATUS.SLOW) && !error && (
        <div className="auth-alert auth-alert-info" role="status">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
          <span>Server is starting up — login may take a little longer than usual.</span>
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

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          icon={Lock}
          showPasswordToggle
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

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
