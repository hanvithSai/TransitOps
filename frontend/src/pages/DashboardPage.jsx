const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Fleet overview and key performance indicators
        </p>
      </div>

      {/* Placeholder KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {['Total Vehicles', 'Active Trips', 'Drivers on Duty', 'Fleet Utilization'].map((label, i) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">—</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Coming in Phase 2+</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]/60 p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-600)]/20">
          <svg className="h-7 w-7 text-[var(--color-brand-400)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Phase 1 Complete ✅</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Authentication &amp; RBAC is live. Dashboard KPIs will populate in Phase 7.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
