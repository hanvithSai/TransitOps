import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CarFront, Users, Map, Wrench, Fuel, 
  ReceiptText, BarChart3, ShieldCheck, LogOut, Sun, Moon, 
  ChevronLeft, Menu, X, Bus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'fleet_manager', 'driver', 'safety_officer', 'financial_analyst'] },
  { label: 'Vehicles', path: '/vehicles', icon: CarFront, roles: ['admin', 'fleet_manager', 'driver'] },
  { label: 'Drivers', path: '/drivers', icon: Users, roles: ['admin', 'driver', 'safety_officer'] },
  { label: 'Trips', path: '/trips', icon: Map, roles: ['admin', 'driver', 'fleet_manager'] },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['admin', 'fleet_manager'] },
  { label: 'Fuel', path: '/fuel', icon: Fuel, roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'] },
  { label: 'Expenses', path: '/expenses', icon: ReceiptText, roles: ['admin', 'fleet_manager', 'driver', 'financial_analyst'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'financial_analyst', 'fleet_manager'] },
  { label: 'Users', path: '/users', icon: ShieldCheck, roles: ['admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const userRole = user?.role?.name || '';
  const userRoleLabel = user?.role?.displayName || '';
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-4 border-b border-[var(--border-base)]">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden w-full">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-600)] shadow-sm">
            <Bus className="h-5 w-5 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-[16px] font-bold tracking-wide text-[var(--text-primary)]">
              Transit<span className="text-[var(--color-brand-600)]">Ops</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {visibleNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-100)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              )
            }
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {(!collapsed || mobileOpen) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border-base)] p-4 shrink-0">
        <div className={cn("flex items-center gap-3", collapsed && !mobileOpen && "justify-center")}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-800)] dark:text-[var(--color-brand-100)] text-xs font-bold border border-[var(--border-base)]">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--color-success)]" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
              <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">{userRoleLabel}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex relative flex-col border-r border-[var(--border-base)] bg-[var(--bg-surface)] transition-all duration-300 shrink-0",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition-colors hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-400)]"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-[var(--bg-surface)] shadow-2xl animate-in slide-in-from-left">
            <SidebarContent />
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-base)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline-block text-sm font-medium text-[var(--text-secondary)] capitalize">
              {location.pathname.replace('/', '') || 'Overview'}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-base)] bg-[var(--bg-base)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
