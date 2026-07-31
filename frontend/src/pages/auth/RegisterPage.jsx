import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { SelectField } from '../../components/common/SelectField';
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
            autoComplete="new-password"
          />
          <PasswordChecklist password={form.password} className="mt-1" />
        </div>

        <SelectField label="Role" id="role" name="role" value={form.role} onChange={handleChange} required>
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </SelectField>

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
