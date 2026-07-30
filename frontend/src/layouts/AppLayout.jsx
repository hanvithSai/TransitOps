import { Outlet } from 'react-router-dom';

/**
 * Minimal app shell — Phase 0 scaffold.
 * Full sidebar, header, and theme toggle arrive in Phase 3.
 */
const AppLayout = () => (
  <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
    <aside className="hidden w-[var(--sidebar-width)] shrink-0 border-r border-[var(--border-base)] bg-[var(--bg-surface)] md:flex md:flex-col">
      <div className="border-b border-[var(--border-base)] px-4 py-5">
        <p className="text-[15px] font-bold tracking-tight">
          Transit<span className="text-[var(--color-brand-600)]">Ops</span>
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">App shell — Phase 3</p>
      </div>
    </aside>

    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;
