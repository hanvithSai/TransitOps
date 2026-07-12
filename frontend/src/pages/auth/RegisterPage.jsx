import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Eye, EyeOff, Mail, Lock, Bus, AlertCircle, User, Shield, CheckCircle2 } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-4 sm:p-8 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-brand-500)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-brand-600)]/10 blur-[120px] pointer-events-none" />

      {/* Brand */}
      <Link to="/" className="mb-8 flex items-center gap-2.5 z-10 hover:opacity-90 transition-opacity">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-800)] shadow-lg shadow-[var(--color-brand-500)]/20">
          <Bus className="h-5 w-5 text-white" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">TransitOps</span>
      </Link>

      {/* Auth Card */}
      <Card className={`w-full max-w-md z-10 border-[var(--border-base)] shadow-xl ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''} p-8 sm:p-10`}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create an account</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Join TransitOps to manage your fleet</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-3 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                tabIndex="-1"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-3 pr-10 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)] cursor-pointer"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Driver">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)]">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} fullWidth className="mt-6 py-3 text-sm font-semibold shadow-md shadow-[var(--color-brand-500)]/20">
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <span className="text-[var(--text-secondary)]">Already have an account?</span>{' '}
          <Link to="/login" className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors">
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
