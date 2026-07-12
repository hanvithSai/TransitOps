import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
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
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {message ? (
          <div className="text-center">
            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {message}
            </div>
            <Link to="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)]">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="name@company.com"
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              Send Reset Link
            </Button>
          </form>
        )}

        {!message && (
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)]">
              &larr; Back to login
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
