import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
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
    roles: ['admin', 'fleet_manager', 'driver', 'safety_officer', 'financial_analyst'],
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
    roles: ['admin', 'fleet_manager', 'driver'],
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
    roles: ['admin', 'driver', 'safety_officer'],
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3" />
      </svg>
    ),
    roles: ['admin', 'driver', 'fleet_manager'],
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
    roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'],
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'],
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

/* ── AppLayout ───────────────────────────────────────────────── */
const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const userRole = user?.role?.name || '';
  const userRoleLabel = user?.role?.displayName || '';
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        style={{ width: collapsed ? '72px' : '260px' }}
        className="relative flex flex-col border-r border-[var(--border-base)] bg-[var(--bg-surface)] transition-all duration-300 shrink-0"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-[var(--border-base)]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-900)] shadow-sm">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
                <circle cx="7" cy="18.5" r="1.5" />
                <circle cx="17" cy="18.5" r="1.5" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-[15px] font-bold tracking-wide text-[var(--text-primary)]">
                Transit<span className="text-[var(--color-brand-600)]">Ops</span>
              </span>
            )}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition-colors hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-400)]"
          aria-label="Toggle sidebar"
        >
          <svg className={`h-3 w-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Menu
            </p>
          )}
          <ul className="space-y-1">
            {visibleNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)]/30 dark:text-[var(--color-brand-300)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
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
        <div className="border-t border-[var(--border-base)] p-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-800)] dark:text-[var(--color-brand-100)] text-xs font-bold border border-[var(--border-base)]">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--color-success)]" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">
                  {userRoleLabel}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-base)] bg-[var(--bg-surface)] px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Overview</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-base)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="4.22" x2="19.78" y2="5.64" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Logout"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
