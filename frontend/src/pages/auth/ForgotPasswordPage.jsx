import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Bus, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {message ? (
          <div className="text-center">
            <div className="mb-8 flex flex-col items-center justify-center gap-3 rounded-xl bg-emerald-50 p-6 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
              <CheckCircle2 className="h-10 w-10" />
              <span className="text-sm font-medium">{message}</span>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="name@company.com"
                required
                className="w-full rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)]"
              />
            </div>

            <Button type="submit" loading={loading} fullWidth className="mt-4 py-3 text-sm font-semibold shadow-md shadow-[var(--color-brand-500)]/20">
              <Send className="mr-2 h-4 w-4" />
              Send Reset Link
            </Button>
          </form>
        )}

        {!message && (
          <div className="mt-8 text-center text-sm font-medium">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        )}
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

export default ForgotPasswordPage;
