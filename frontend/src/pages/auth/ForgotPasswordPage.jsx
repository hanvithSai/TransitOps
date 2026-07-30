import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout shake={shake}>
      <div className="auth-card-header">
        <h1 className="text-h1">Reset your password</h1>
        <p className="text-body">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {message ? (
        <div className="space-y-6 text-center">
          <div className="auth-alert auth-alert-success flex-col items-center py-6">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            <span>{message}</span>
          </div>
          <Link to="/login" className="auth-link inline-flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Email address"
              id="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="name@company.com"
              required
              autoComplete="email"
            />
            <Button type="submit" loading={loading} fullWidth size="lg" icon={Send}>
              Send reset link
            </Button>
          </form>
          <p className="auth-footer">
            <Link to="/login" className="auth-link inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to login
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
