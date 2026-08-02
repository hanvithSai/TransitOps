import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SessionLoadingScreen from './common/SessionLoadingScreen';

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

  if (loading) {
    return <SessionLoadingScreen />;
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
