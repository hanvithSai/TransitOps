import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CarFront, Users, Map, Wrench, Fuel,
  ReceiptText, BarChart3, ShieldCheck, LogOut, Sun, Moon,
  ChevronLeft, Menu, X, Bus, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DemoModeBanner from '../components/DemoModeBanner';
import NotificationBell from '../components/common/NotificationBell';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'fleet_manager', 'driver', 'safety_officer', 'financial_analyst'] },
  { label: 'Vehicles', path: '/vehicles', icon: CarFront, roles: ['admin', 'fleet_manager', 'driver'] },
  { label: 'Drivers', path: '/drivers', icon: Users, roles: ['admin', 'driver', 'safety_officer'] },
  { label: 'Trips', path: '/trips', icon: Map, roles: ['admin', 'fleet_manager', 'driver', 'safety_officer'] },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['admin', 'fleet_manager'] },
  { label: 'Fuel', path: '/fuel', icon: Fuel, roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'] },
  { label: 'Expenses', path: '/expenses', icon: ReceiptText, roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'financial_analyst', 'fleet_manager'] },
  { label: 'Users', path: '/users', icon: ShieldCheck, roles: ['admin'] },
];

const BREADCRUMB_LABELS = Object.fromEntries(NAV_ITEMS.map((item) => [item.path.slice(1), item.label]));

const getInitialTheme = () => {
  const saved = localStorage.getItem('transitops-theme');
  if (saved === 'dark' || saved === 'light') return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const SidebarContent = ({
  collapsed,
  mobile = false,
  visibleNav,
  user,
  userRoleLabel,
  initials,
}) => (
  <>
    <div className="app-sidebar-brand">
      <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-600)]">
          <Bus className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        {(!collapsed || mobile) && (
          <span className="truncate text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            Transit<span className="text-[var(--color-brand-600)]">Ops</span>
          </span>
        )}
      </Link>
    </div>

    <nav className="app-sidebar-nav" aria-label="Main">
      {visibleNav.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn('app-sidebar-link', isActive && 'app-sidebar-link-active')}
          title={collapsed && !mobile ? item.label : undefined}
        >
          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {(!collapsed || mobile) && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>

    <div className="app-sidebar-user">
      <div className={cn('flex items-center gap-3', collapsed && !mobile && 'justify-center')}>
        <div className="app-sidebar-avatar">{initials}</div>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
            <p className="truncate text-caption text-[var(--text-muted)]">{userRoleLabel}</p>
          </div>
        )}
      </div>
    </div>
  </>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('transitops-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const userRole = user?.role?.name || '';
  const userRoleLabel = user?.role?.displayName || '';
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const pathSegment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const pageLabel = BREADCRUMB_LABELS[pathSegment] || 'Dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarProps = { collapsed, visibleNav, user, userRoleLabel, initials };

  return (
    <div className="app-shell">
      <aside className={cn('app-sidebar hidden md:flex', collapsed && 'app-sidebar-collapsed')}>
        <SidebarContent {...sidebarProps} />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="app-sidebar-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="app-sidebar app-sidebar-mobile relative z-50 flex w-64 flex-col shadow-2xl">
            <SidebarContent {...sidebarProps} mobile />
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 text-[var(--text-muted)]" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="app-main">
        <DemoModeBanner />
        <header className="app-header">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="app-header-icon-btn md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <nav className="app-breadcrumb hidden sm:flex" aria-label="Breadcrumb">
              <Link to="/dashboard" className="app-breadcrumb-link">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--text-primary)]">{pageLabel}</span>
            </nav>
            <span className="text-sm font-medium text-[var(--text-secondary)] sm:hidden">{pageLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button type="button" onClick={() => setIsDark(!isDark)} className="app-header-icon-btn" aria-label={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={handleLogout} className="app-header-icon-btn app-header-logout" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="app-content page-enter">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
