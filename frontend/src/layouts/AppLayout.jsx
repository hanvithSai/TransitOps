import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── Navigation config ──────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'],
  },
  {
    label: 'Vehicles',
    path: '/vehicles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M1 17h22M5 17V9l3-5h8l3 5v8M9 17v-4h6v4" />
        <circle cx="7" cy="18.5" r="1.5" />
        <circle cx="17" cy="18.5" r="1.5" />
      </svg>
    ),
    roles: ['admin', 'fleet_manager', 'dispatcher'],
  },
  {
    label: 'Drivers',
    path: '/drivers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    roles: ['admin', 'dispatcher', 'safety_officer'],
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3" />
      </svg>
    ),
    roles: ['admin', 'dispatcher', 'fleet_manager'],
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    roles: ['admin', 'fleet_manager'],
  },
  {
    label: 'Fuel',
    path: '/fuel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M3 22h14M17 8h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" />
        <path d="M7 8v3h4V8" />
      </svg>
    ),
    roles: ['admin', 'financial_analyst'],
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    roles: ['admin', 'financial_analyst'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    roles: ['admin', 'financial_analyst', 'fleet_manager'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    roles: ['admin'],
  },
];

/* ── Role badge colors ───────────────────────────────────────── */
const ROLE_COLORS = {
  admin:             'bg-purple-500/20 text-purple-300',
  fleet_manager:     'bg-blue-500/20 text-blue-300',
  dispatcher:        'bg-emerald-500/20 text-emerald-300',
  safety_officer:    'bg-amber-500/20 text-amber-300',
  financial_analyst: 'bg-rose-500/20 text-rose-300',
};

/* ── AppLayout ───────────────────────────────────────────────── */
const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const userRole      = user?.role?.name || '';
  const userRoleLabel = user?.role?.displayName || '';
  const initials      = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-950)]">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        style={{ width: collapsed ? '72px' : 'var(--sidebar-width)' }}
        className="relative flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-900)] transition-all duration-300 shrink-0"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] shadow-lg shadow-blue-900/30">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
              <circle cx="7" cy="18.5" r="1.5" />
              <circle cx="17" cy="18.5" r="1.5" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-wide text-[var(--color-text-primary)]">
              Transit<span className="text-[var(--color-brand-400)]">Ops</span>
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border-light)] bg-[var(--color-surface-800)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-brand-400)]"
          aria-label="Toggle sidebar"
        >
          <svg className={`h-3 w-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Navigation
            </p>
          )}
          <ul className="space-y-1">
            {visibleNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--color-brand-600)] text-white shadow-md shadow-blue-900/30'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-text-primary)]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="h-5 w-5 shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--color-border)] p-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-purple-600 text-xs font-bold text-white shadow-md">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface-900)] bg-[var(--color-success)]" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{user?.name}</p>
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[userRole] || 'bg-gray-500/20 text-gray-300'}`}>
                  {userRoleLabel}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Logout"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-900)]/60 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Welcome back,</span>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_COLORS[userRole] || ''}`}>
              {userRoleLabel}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
