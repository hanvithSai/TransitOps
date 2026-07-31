import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

const renderProtected = (authState, initialPath = '/dashboard') => {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        <Route path="/update-password" element={<div>Update Password</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', () => {
    renderProtected({
      isAuthenticated: false,
      loading: false,
      user: null,
      requiresPasswordChange: false,
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects users without required role to unauthorized', () => {
    renderProtected({
      isAuthenticated: true,
      loading: false,
      user: { role: { name: 'driver' } },
      requiresPasswordChange: false,
    });

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('renders children when authenticated with allowed role', () => {
    renderProtected({
      isAuthenticated: true,
      loading: false,
      user: { role: { name: 'admin' } },
      requiresPasswordChange: false,
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to update-password when password change is required', () => {
    renderProtected({
      isAuthenticated: true,
      loading: false,
      user: { role: { name: 'admin' } },
      requiresPasswordChange: true,
    });

    expect(screen.getByText('Update Password')).toBeInTheDocument();
  });
});
