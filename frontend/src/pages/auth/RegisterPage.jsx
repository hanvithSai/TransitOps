import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const RegisterPage = () => {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Fleet Manager' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill in all fields.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.role);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-4 sm:p-8">
      {/* Brand */}
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-900)]">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
            <circle cx="7" cy="18.5" r="1.5" />
            <circle cx="17" cy="18.5" r="1.5" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">TransitOps</span>
      </Link>

      {/* Auth Card */}
      <Card className={`w-full max-w-md ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create an account</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Join TransitOps to manage your fleet</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@company.com"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-[34px] flex h-5 w-5 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <EyeIcon open={showPass} />
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-sm font-medium text-[var(--text-secondary)]">
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full appearance-none rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-base)] py-2 px-3 pr-8 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Driver">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} fullWidth className="mt-2">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--text-secondary)]">Already have an account?</span>{' '}
          <Link to="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)]">
            Log in
          </Link>
        </div>
      </Card>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
