import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiErrors';
import AuthLayout from '../../components/layout/AuthLayout';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validatePasswordStrength } from '../../lib/passwordPolicy';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    const { valid, errors } = validatePasswordStrength(password);
    if (!valid) {
      setError(errors[0]);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password. The link might have expired.'));
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout shake={shake}>
      <div className="auth-card-header">
        <h1 className="text-h1">Set new password</h1>
        <p className="text-body">Please enter your new password below</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert auth-alert-success" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input
          label="New password"
          id="password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
        <PasswordChecklist password={password} className="pt-1" />
        <Input
          label="Confirm new password"
          id="confirmPassword"
          type="password"
          icon={KeyRound}
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} fullWidth size="lg">
          Reset password
        </Button>
      </form>

      <p className="auth-footer">
        <Link to="/login" className="auth-link inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
