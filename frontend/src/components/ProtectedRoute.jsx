import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute>                         — auth only
 *   <ProtectedRoute allowedRoles={['admin']} — auth + role
 */
const ProtectedRoute = ({ children, allowedRoles = [], allowPasswordUpdate = false }) => {
  const { isAuthenticated, user, loading, requiresPasswordChange } = useAuth();
  const location = useLocation();

  // Wait for initial session check
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-600)] border-t-transparent" />
          <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Compliance: must update weak password before using the app
  if (requiresPasswordChange && !allowPasswordUpdate) {
    return <Navigate to="/update-password" replace />;
  }

  // Already compliant — skip update-password page
  if (allowPasswordUpdate && !requiresPasswordChange) {
    return <Navigate to="/dashboard" replace />;
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
