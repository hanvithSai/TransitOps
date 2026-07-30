import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validatePasswordStrength } from '../../lib/passwordPolicy';
import { cn } from '../../lib/utils';

const UpdatePasswordPage = () => {
  const { user, loading: authLoading, changePassword, requiresPasswordChange } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && user && !requiresPasswordChange) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, requiresPasswordChange, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    const { valid, errors } = validatePasswordStrength(form.newPassword);
    if (!valid) {
      setError(errors[0]);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    const result = await changePassword(form.currentPassword, form.newPassword);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-600)] border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthLayout shake={shake}>
      <div className="auth-card-header">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/30">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-h1">Update your password</h1>
        <p className="text-body">
          For security compliance, please set a stronger password before continuing.
        </p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input
          label="Current password"
          id="currentPassword"
          name="currentPassword"
          type="password"
          icon={Lock}
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <div className="space-y-2">
          <Input
            label="New password"
            id="newPassword"
            name="newPassword"
            type="password"
            icon={KeyRound}
            value={form.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          <PasswordChecklist
            password={form.newPassword}
            className={cn(
              'rounded-lg border border-[var(--border-base)] bg-[var(--bg-surface)] p-3',
            )}
          />
        </div>

        <Input
          label="Confirm new password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          icon={KeyRound}
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} fullWidth size="lg">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default UpdatePasswordPage;
