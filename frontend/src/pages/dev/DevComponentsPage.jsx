/**
 * DevComponentsPage — Phase 1 token reference (dev only).
 * Uses `.ds-*` layout system from index.css (shared app-wide).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Moon, Sun, ArrowLeft, Copy, Check,
  Type, Palette, Layers, MessageSquare, Box, Sparkles,
  AlertTriangle, Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const getInitialTheme = () => {
  const saved = localStorage.getItem('transitops-theme');
  if (saved === 'dark' || saved === 'light') return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Bus },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'color-brand', label: 'Brand & accent', icon: Palette },
  { id: 'color-surface', label: 'Surfaces', icon: Layers },
  { id: 'color-semantic', label: 'Semantic', icon: MessageSquare },
  { id: 'elevation', label: 'Elevation', icon: Box },
  { id: 'patterns', label: 'Patterns', icon: Sparkles },
];

const TYPE_SCALE = [
  { sample: 'Fleet operations at scale', name: 'Display', token: '.text-display', spec: 'clamp 2–3.25rem · 600', className: 'text-display' },
  { sample: 'Vehicle registry', name: 'H1 · Page title', token: '.text-h1', spec: 'clamp 1.25–2rem · 600', className: 'text-h1' },
  { sample: 'Maintenance overview', name: 'H2 · Section', token: '.text-h2', spec: 'clamp 1.5–1.875rem', className: 'text-h2' },
  { sample: 'Trip details', name: 'H3 · Card title', token: '.text-h3', spec: '1rem · 600', className: 'text-h3' },
  { sample: 'Track vehicle status, odometer readings, and shop assignments from a single registry.', name: 'Body', token: '.text-body', spec: '14px · 400 · lh 1.6', className: 'text-body max-w-xl' },
  { sample: 'Sign in to your fleet operations dashboard.', name: 'Body large', token: '.text-body-lg', spec: '16px · auth copy', className: 'text-body-lg' },
  { sample: 'Registration number', name: 'Label', token: '.text-label', spec: '11px · uppercase', className: 'text-label' },
  { sample: 'Licence expires in 14 days', name: 'Caption', token: '.text-caption', spec: '13px · meta', className: 'text-caption' },
  { sample: 'MH-12-AB-4521', name: 'Mono data', token: '.text-mono-data', spec: 'JetBrains Mono', className: 'text-mono-data', mono: true },
  { sample: '128', name: 'KPI value', token: '.text-kpi-value', spec: '1.5rem · 800', className: 'text-kpi-value' },
];

const CopyToken = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button type="button" onClick={copy} className="ds-token" aria-label={`Copy ${value}`}>
      <span>{value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-[var(--color-success)]" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3 opacity-50" aria-hidden="true" />
      )}
    </button>
  );
};

const SpecSection = ({ id, index, title, description, children }) => (
  <section id={id} className="ds-section">
    <div className="ds-section-head">
      <span className="ds-section-index">{index}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-h2">{title}</h2>
        {description && <p className="mt-3 max-w-2xl text-body-lg">{description}</p>}
      </div>
    </div>
    <div className="ds-section-body">{children}</div>
  </section>
);

const SpecPanel = ({ title, description, children, flush = false, className }) => (
  <div className={cn('ds-panel', className)}>
    {(title || description) && (
      <div className="ds-panel-head">
        {title && <h3 className="text-h3">{title}</h3>}
        {description && <p className="mt-1.5 text-caption">{description}</p>}
      </div>
    )}
    <div className={flush ? 'ds-panel-body-flush' : 'ds-panel-body'}>{children}</div>
  </div>
);

const ColorStrip = ({ stops }) => (
  <div className="flex overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-base)]">
    {stops.map(({ token, label }) => (
      <div
        key={token}
        className="group relative min-h-[80px] flex-1"
        style={{ background: `var(${token})` }}
        title={label}
      >
        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center font-mono text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </span>
      </div>
    ))}
  </div>
);

const ColorTokenCard = ({ name, token, hex, usage }) => (
  <div className="group ds-panel overflow-hidden transition-smooth hover:shadow-[var(--shadow-md)]">
    <div className="relative h-[88px] border-b border-[var(--border-base)]" style={{ background: `var(${token})` }}>
      {token.includes('accent') && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-400)]" aria-hidden="true" />
          Live
        </span>
      )}
    </div>
    <div className="ds-panel-body space-y-2 !py-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
      <p className="text-caption leading-snug">{usage}</p>
      <div className="ds-token-meta flex flex-wrap items-center gap-2 pt-1">
        <CopyToken value={token} />
        {hex && <span className="font-mono text-[11px] text-[var(--text-muted)]">{hex}</span>}
      </div>
    </div>
  </div>
);

const SemanticCard = ({ name, bg, text, border, icon: Icon }) => (
  <div
    className="group ds-semantic"
    style={{
      background: `var(${bg})`,
      color: `var(${text})`,
      borderColor: `color-mix(in srgb, var(${border}) 22%, transparent)`,
    }}
  >
    <div className="ds-semantic-icon" style={{ background: `color-mix(in srgb, var(${border}) 14%, transparent)` }}>
      <Icon className="h-5 w-5" style={{ color: `var(${border})` }} aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-label" style={{ color: `var(${text})` }}>{name}</p>
      <p className="mt-2 text-body leading-relaxed" style={{ color: `var(${text})` }}>
        Vehicle <span className="font-mono font-medium">MH-12-AB-4521</span> is available for dispatch.
      </p>
      <div className="ds-token-meta mt-3 flex flex-wrap gap-2">
        <CopyToken value={bg} />
        <CopyToken value={text} />
        <CopyToken value={border} />
      </div>
    </div>
  </div>
);

const DevComponentsPage = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('transitops-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-28% 0px -58% 0px', threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="ds-page">
      <div className="ds-page-grid" aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-[var(--border-base)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] transition-smooth hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              aria-label="Back to app"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-600)]">
              <Bus className="h-[18px] w-[18px] text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                Transit<span className="text-[var(--color-brand-600)]">Ops</span>
                <span className="ml-2 hidden font-normal text-[var(--text-muted)] sm:inline">Design System</span>
              </p>
              <p className="hidden text-[11px] text-[var(--text-muted)] sm:block">Phase 1 · Tokens v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-1 text-label normal-case sm:inline-flex">
              Dev only
            </span>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-base)] bg-[var(--bg-base)] text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
              aria-label={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="ds-shell">
        <aside className="ds-nav-rail">
          <nav className="ds-nav-sticky" aria-label="Token sections">
            <p className="mb-4 px-3 text-label">On this page</p>
            <ul className="space-y-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    data-active={activeSection === id}
                    className="ds-nav-link"
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="ds-main page-enter">
          <div className="ds-stack">
            <section id="overview" className="ds-section">
              <div className="ds-hero">
                <p className="text-label">TransitOps · Enterprise fleet UI</p>
                <h1 className="text-display mt-5 max-w-3xl">Design tokens</h1>
                <p className="mt-6 max-w-2xl text-body-lg">
                  Foundational visual language for dispatch consoles, fleet registries, and operational dashboards.
                  Indigo for action, teal for live operations.
                </p>
                <div className="ds-stat-row">
                  {[
                    { label: 'Base unit', value: '4px grid' },
                    { label: 'Body size', value: '14px Inter' },
                    { label: 'Display', value: 'Outfit' },
                  ].map(({ label, value }) => (
                    <div key={label} className="ds-stat-cell">
                      <p className="text-label">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <SpecSection
              id="typography"
              index="01"
              title="Typography"
              description="Outfit for authority, Inter for UI density, JetBrains Mono for plates and IDs."
            >
              <SpecPanel title="Type scale" description="Hover a row to reveal token class names.">
                <div className="ds-spec-table">
                  <div className="ds-spec-head hidden md:grid">
                    <span>Sample</span>
                    <span>Token</span>
                    <span>Spec</span>
                  </div>
                  {TYPE_SCALE.map((row) => (
                    <div key={row.token} className="group ds-spec-row">
                      <div className={cn(row.className, row.mono && 'text-mono-data')}>{row.sample}</div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] md:hidden">{row.name}</p>
                        <div className="ds-token-meta md:!opacity-100 md:!max-h-none">
                          <CopyToken value={row.token} />
                        </div>
                      </div>
                      <p className="font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">{row.spec}</p>
                    </div>
                  ))}
                </div>
              </SpecPanel>
            </SpecSection>

            <SpecSection
              id="color-brand"
              index="02"
              title="Brand & accent"
              description="Indigo drives primary actions. Teal indicates live operational state."
            >
              <SpecPanel title="Indigo scale" description="Primary brand ramp">
                <ColorStrip
                  stops={[
                    { token: '--color-brand-50', label: '50' },
                    { token: '--color-brand-100', label: '100' },
                    { token: '--color-brand-200', label: '200' },
                    { token: '--color-brand-300', label: '300' },
                    { token: '--color-brand-400', label: '400' },
                    { token: '--color-brand-500', label: '500' },
                    { token: '--color-brand-600', label: '600' },
                    { token: '--color-brand-700', label: '700' },
                    { token: '--color-brand-800', label: '800' },
                    { token: '--color-brand-900', label: '900' },
                  ]}
                />
              </SpecPanel>
              <div className="ds-grid-3">
                <ColorTokenCard name="Brand 600" token="--color-brand-600" hex="#4f46e5" usage="Primary actions, logo, links" />
                <ColorTokenCard name="Brand 500" token="--color-brand-500" hex="#6366f1" usage="Focus rings, charts, dark primary" />
                <ColorTokenCard name="Accent 500" token="--color-accent-500" hex="#14b8a6" usage="Live indicators, utilisation" />
              </div>
            </SpecSection>

            <SpecSection
              id="color-surface"
              index="03"
              title="Surfaces & text"
              description="Neutral layers create depth. Cards always sit on surface over base."
            >
              <div className="ds-grid-2">
                <SpecPanel title="Surface hierarchy">
                  <div className="ds-stack-sm">
                    {[
                      { name: 'Base', token: '--bg-base', desc: 'Page canvas' },
                      { name: 'Surface', token: '--bg-surface', desc: 'Cards, sidebar, modals' },
                      { name: 'Surface hover', token: '--bg-surface-hover', desc: 'Row hover, inputs' },
                      { name: 'Elevated', token: '--bg-elevated', desc: 'Dropdowns, popovers' },
                    ].map(({ name, token, desc }) => (
                      <div key={token} className="group ds-list-row" style={{ background: `var(${token})` }}>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
                          <p className="text-caption mt-0.5">{desc}</p>
                        </div>
                        <div className="ds-token-meta shrink-0">
                          <CopyToken value={token} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SpecPanel>

                <SpecPanel title="Text hierarchy">
                  <div className="ds-text-tiers">
                    {[
                      { name: 'Primary', token: '--text-primary', sample: 'Volvo FH16 · 24,500 km', className: 'text-lg font-semibold text-[var(--text-primary)]' },
                      { name: 'Secondary', token: '--text-secondary', sample: 'Assigned to Route 7 — Mumbai to Pune', className: 'text-body' },
                      { name: 'Muted', token: '--text-muted', sample: 'Last updated 4 min ago', className: 'text-caption text-[var(--text-muted)]' },
                    ].map(({ name, token, sample, className }) => (
                      <div key={token} className="group ds-text-tier">
                        <div className="ds-text-tier-label-row">
                          <p className="text-label">{name}</p>
                          <div className="ds-token-meta">
                            <CopyToken value={token} />
                          </div>
                        </div>
                        <p className={cn('ds-text-tier-sample', className)}>{sample}</p>
                      </div>
                    ))}
                  </div>
                </SpecPanel>
              </div>
            </SpecSection>

            <SpecSection
              id="color-semantic"
              index="04"
              title="Semantic colors"
              description="Status and alerts use bg + text + border trios that adapt in dark mode."
            >
              <div className="ds-grid-2">
                <SemanticCard name="Success" bg="--success-bg" text="--success-text" border="--success" icon={Check} />
                <SemanticCard name="Info" bg="--info-bg" text="--info-text" border="--info" icon={Info} />
                <SemanticCard name="Warning" bg="--warning-bg" text="--warning-text" border="--warning" icon={AlertTriangle} />
                <SemanticCard name="Error" bg="--error-bg" text="--error-text" border="--error" icon={AlertTriangle} />
              </div>
            </SpecSection>

            <SpecSection
              id="elevation"
              index="05"
              title="Elevation & radius"
              description="Subtle shadows and moderate radius — enterprise B2B, never bubble UI."
            >
              <div className="ds-grid-3">
                {[
                  { shadow: 'var(--shadow-sm)', radius: 'var(--radius-lg)', label: 'sm', use: 'Cards at rest', r: 'lg' },
                  { shadow: 'var(--shadow-md)', radius: 'var(--radius-lg)', label: 'md', use: 'Hover, floating', r: 'lg' },
                  { shadow: 'var(--shadow-lg)', radius: 'var(--radius-xl)', label: 'lg', use: 'Modals, drawer', r: 'xl' },
                ].map(({ shadow, radius, label, use, r }) => (
                  <div key={label} className="ds-elevation-demo" style={{ boxShadow: shadow, borderRadius: radius }}>
                    <p className="text-h3">{use}</p>
                    <p className="text-caption mt-2">--shadow-{label} · radius {r}</p>
                  </div>
                ))}
              </div>
            </SpecSection>

            <SpecSection
              id="patterns"
              index="06"
              title="Patterns & motion"
              description="Operational building blocks used across fleet list pages and dashboards."
            >
              <div className="ds-grid-2">
                <SpecPanel title="Form control" description="Shared select styling for filters and modals.">
                  <div className="ds-form-field">
                    <label htmlFor="dev-select" className="text-label">Vehicle status</label>
                    <select id="dev-select" className="select-field">
                      <option>Available</option>
                      <option>On Trip</option>
                      <option>In Shop</option>
                      <option>Retired</option>
                    </select>
                  </div>
                </SpecPanel>

                <SpecPanel title="KPI card" description="Accent bar with safe inner padding via .kpi-card.">
                  <div className="kpi-card" style={{ '--kpi-accent': 'var(--color-accent-500)' }}>
                    <div className="kpi-card-header">
                      <p className="text-label">Available vehicles</p>
                      <span className="kpi-card-live" aria-hidden="true" />
                    </div>
                    <p className="text-kpi-value kpi-card-value">42</p>
                    <p className="text-caption kpi-card-delta text-[var(--color-success)]">+3 since yesterday</p>
                  </div>
                </SpecPanel>

                <SpecPanel title="Table selection" description="Selected row uses inset brand bar." flush className="lg:col-span-2">
                  <div className="ds-data-table">
                    <div className="ds-data-table-head">
                      <span>Plate</span>
                      <span>Vehicle</span>
                      <span>Status</span>
                    </div>
                    {[
                      { plate: 'MH-12-AB-4521', name: 'Volvo FH16', status: 'Available', selected: false },
                      { plate: 'DL-01-CD-8834', name: 'Tata Prima', status: 'On Trip', selected: true },
                      { plate: 'KA-05-EF-2290', name: 'Ashok 5525', status: 'In Shop', selected: false },
                    ].map((row) => (
                      <div
                        key={row.plate}
                        className={cn('ds-data-table-row transition-smooth', row.selected && 'table-row-selected')}
                      >
                        <span className="text-mono-data">{row.plate}</span>
                        <span className="ds-data-table-cell-primary">{row.name}</span>
                        <span className="ds-data-table-cell-status">{row.status}</span>
                      </div>
                    ))}
                  </div>
                </SpecPanel>

                <SpecPanel title="Loading skeleton" description="Shimmer placeholder for async content." className="lg:col-span-2">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2.5">
                        <div className="skeleton h-3 w-2/5 max-w-[200px]" />
                        <div className="skeleton h-3 w-3/5 max-w-[280px]" />
                      </div>
                    </div>
                    <div className="skeleton h-32 w-full rounded-[var(--radius-lg)]" />
                  </div>
                </SpecPanel>
              </div>
            </SpecSection>
          </div>

          <footer className="mt-20 border-t border-[var(--border-base)] pt-8 pb-4">
            <p className="text-caption">
              TransitOps Design System · Remove <code className="font-mono text-[11px]">/dev/components</code> before production
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DevComponentsPage;
