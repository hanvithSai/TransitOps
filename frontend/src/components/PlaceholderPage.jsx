const PlaceholderPage = ({ title, phase = 'TBD', description }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-base)] bg-[var(--bg-surface)] p-8 text-center">
    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
      UI rebuild — {phase}
    </p>
    <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
    <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
      {description || 'This screen will be rebuilt in a later phase of the frontend revamp.'}
    </p>
  </div>
);

export default PlaceholderPage;
