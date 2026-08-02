import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setTokenRefreshHandler, warmBackend } from '../services/api';
import { getApiErrorMessage } from '../lib/apiErrors';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check
  const [error, setError]     = useState(null);

  // ── Warm backend on load (helps Render cold starts) ───────────
  useEffect(() => {
    warmBackend();
  }, []);

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        // Token invalid/expired — try refresh (handled by axios interceptor)
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Keep user profile in sync after token refresh / window focus ─
  useEffect(() => {
    setTokenRefreshHandler(setUser);

    const syncUser = async () => {
      if (!localStorage.getItem('accessToken')) return;
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        // ignore — interceptor handles auth failures
      }
    };

    window.addEventListener('focus', syncUser);
    return () => {
      setTokenRefreshHandler(null);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, accessToken, requiresPasswordChange } = data.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(loggedInUser);
      return { success: true, requiresPasswordChange: !!requiresPasswordChange };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed. Please try again.');
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ── Change password (compliance upgrade) ───────────────────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
      setUser(data.data.user);
      return { success: true, message: data.message };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update password.');
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, roleName) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, roleName });
      return { success: true, message: data.message };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed. Please try again.');
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed even if server call fails
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  // ── Clear error ───────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    requiresPasswordChange: !!user?.mustChangePassword,
    login,
    register,
    logout,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
