import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/* ── EyeIcon ─────────────────────────────────────────────────── */
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

/* ── LoginPage ───────────────────────────────────────────────── */
const LoginPage = () => {
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate  = useNavigate();
  // location removed

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'Driver' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shake, setShake]       = useState(false);

  // Redirect if already authenticated
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

    if (isSignUp) {
      if (!form.name || !form.email || !form.password || !form.role) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      const result = await register(form.name, form.email, form.password, form.role);
      setLoading(false);
      
      if (result.success) {
        setSuccessMsg(result.message);
        // Reset form for sign in but keep email
        setIsSignUp(false);
        setForm(prev => ({ ...prev, password: '', name: '' }));
      } else {
        setError(result.message);
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } else {
      if (!form.email || !form.password) {
        setError('Please enter both email and password.');
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
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-950)] text-white">
      {/* Left Pane - Branding & Roles */}
      <div className="hidden w-1/3 bg-[#DCE0E5] p-12 text-gray-900 lg:flex lg:flex-col lg:justify-center relative">
        <div className="mb-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500 shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
              <circle cx="7" cy="18.5" r="1.5" />
              <circle cx="17" cy="18.5" r="1.5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">TransitOps</h1>
          <p className="mt-2 text-lg text-gray-600">Smart Transport Operations Platform</p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">One login, four roles:</h2>
          <ul className="space-y-3">
            {['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'].map(role => (
              <li key={role} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                <span className="text-gray-700 font-medium">{role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-2/3 xl:px-32 relative">
        <div className={`w-full max-w-md ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-sans tracking-tight">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              {isSignUp ? 'Fill in the details to register' : 'Enter your credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Error & Success Alerts */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div dangerouslySetInnerHTML={{ __html: error.replace('\n', '<br/>') }} />
              </div>
            )}
            
            {successMsg && (
              <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {successMsg}
              </div>
            )}

            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded border border-[var(--color-border-light)] bg-transparent py-2.5 px-3 text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                className="w-full rounded border border-[var(--color-border-light)] bg-transparent py-2.5 px-3 text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded border border-[var(--color-border-light)] bg-transparent py-2.5 px-3 pr-10 text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-[var(--color-text-muted)] transition-colors hover:text-white"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Role Field (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Role (RBAC)
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full appearance-none rounded border border-[var(--color-border-light)] bg-transparent py-2.5 px-3 pr-8 text-sm text-white outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 [&>option]:bg-[#1e1e1e]"
                  >
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Driver">Driver</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-text-muted)]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Remember me & Forgot pass (Sign In Only) */}
            {!isSignUp && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-transparent text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-900" />
                  <span className="text-sm text-[var(--color-text-secondary)]">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded bg-[#b45309] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            
            {/* Toggle */}
            <div className="mt-4 text-center text-sm">
              <span className="text-[var(--color-text-muted)]">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }}
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </div>
            
          </form>

          {/* Access Scopes Information */}
          <div className="mt-12 space-y-1 text-sm text-[var(--color-text-muted)]">
            <p className="mb-2">Access is scoped by role after login:</p>
            <ul className="space-y-1">
              <li>• Fleet Manager → Fleet, Maintenance</li>
              <li>• Driver → Dashboard, Trips</li>
              <li>• Safety Officer → Drivers, Compliance</li>
              <li>• Financial Analyst → Fuel & Expenses, Analytics</li>
            </ul>
          </div>
          
        </div>
      </div>
      
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

export default LoginPage;
