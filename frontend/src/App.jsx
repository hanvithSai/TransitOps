import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/app/DashboardPage';
import UsersPage from './pages/app/UsersPage';
import VehiclesPage from './pages/app/VehiclesPage';
import DriversPage from './pages/app/DriversPage';
import TripsPage from './pages/app/TripsPage';
import MaintenancePage from './pages/app/MaintenancePage';
import FinancePage from './pages/app/FinancePage';
import ReportsPage from './pages/app/ReportsPage';
import DevComponentsPage from './pages/dev/DevComponentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Dev — remove before merge */}
          <Route path="/dev/components" element={<DevComponentsPage />} />

          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Password compliance — auth required, blocks rest of app until updated */}
          <Route
            path="/update-password"
            element={
              <ProtectedRoute allowPasswordUpdate>
                <UpdatePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes — wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route
              path="/vehicles"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'driver']}>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'driver', 'safety_officer']}>
                  <DriversPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'driver', 'safety_officer']}>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager']}>
                  <MaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fuel"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'driver', 'financial_analyst']}>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'driver', 'financial_analyst']}>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'financial_analyst', 'fleet_manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
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

export default App;
