import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(data.message || 'Email sent with password reset instructions');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-950)] text-white">
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:px-32 relative items-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold font-sans tracking-tight">Forgot Password</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Enter your email and we will send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="raven.k@transitops.in"
                className="w-full rounded border border-[var(--color-border-light)] bg-transparent py-2.5 px-3 text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded bg-[#b45309] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
                &larr; Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
