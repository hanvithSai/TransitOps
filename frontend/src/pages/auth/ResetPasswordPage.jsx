import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

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

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setSuccessMsg(data.message || 'Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
            <h2 className="text-3xl font-bold font-sans tracking-tight">Reset Password</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Please enter your new password below.
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
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="mt-4 w-full rounded bg-[#b45309] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Reset Password'}
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

export default ResetPasswordPage;
