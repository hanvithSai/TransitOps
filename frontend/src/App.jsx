import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes — wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Phase 2+ routes */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'dispatcher']}>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'safety_officer']}>
                  <DriversPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'dispatcher', 'safety_officer']}>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/maintenance" element={<ComingSoon title="Maintenance"        phase={5} />} />
            <Route path="/fuel"        element={<ComingSoon title="Fuel Management"    phase={6} />} />
            <Route path="/expenses"    element={<ComingSoon title="Expense Tracking"   phase={6} />} />
            <Route path="/reports"     element={<ComingSoon title="Reports & Analytics" phase={8} />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

/* ── Coming Soon placeholder ──────────────────────────────────── */
const ComingSoon = ({ title, phase, note }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-700)] ring-1 ring-[var(--color-border-light)]">
      <svg className="h-8 w-8 text-[var(--color-brand-400)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
      {note || `Scheduled for Phase ${phase} of the development roadmap.`}
    </p>
  </div>
);

export default App;
