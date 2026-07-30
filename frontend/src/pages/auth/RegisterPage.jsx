import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validatePasswordStrength } from '../../lib/passwordPolicy';

const ROLES = [
  'Fleet Manager',
  'Driver',
  'Safety Officer',
  'Financial Analyst',
];

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

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    const { valid, errors } = validatePasswordStrength(form.password);
    if (!valid) {
      setError(errors[0]);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.role);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Account created successfully! Pending admin approval. Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <AuthLayout shake={shake}>
      <div className="auth-card-header">
        <h1 className="text-h1">Create an account</h1>
        <p className="text-body">Join TransitOps to manage your fleet</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-alert auth-alert-success" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input label="Full name" id="name" name="name" type="text" icon={User} value={form.name} onChange={handleChange} placeholder="John Doe" required autoComplete="name" />
        <Input label="Email address" id="email" name="email" type="email" icon={Mail} value={form.email} onChange={handleChange} placeholder="name@company.com" required autoComplete="email" />

        <div className="space-y-2">
          <label htmlFor="password" className="text-label !normal-case !tracking-normal !text-[var(--text-primary)]">
            Password <span className="text-[var(--color-error)]">*</span>
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
              autoComplete="new-password"
              className="flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-base)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-smooth placeholder:text-[var(--text-muted)] focus-visible:border-[var(--color-brand-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordChecklist password={form.password} className="pt-1" />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-label !normal-case !tracking-normal !text-[var(--text-primary)] flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Role
          </label>
          <select id="role" name="role" value={form.role} onChange={handleChange} className="select-field" required>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Create account
        </Button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
