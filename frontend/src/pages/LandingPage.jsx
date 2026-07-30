/**
 * LandingPage — public marketing site (style guide §11).
 * Spacing via .mkt-* utilities in index.css (4px grid).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Moon, Sun, Menu, X, ArrowRight, CheckCircle2,
  CarFront, Users, Map, Wrench, Fuel, BarChart3,
  Lock, ShieldCheck, Clock, Globe,
} from 'lucide-react';
import { cn } from '../lib/utils';

const getInitialTheme = () => {
  const saved = localStorage.getItem('transitops-theme');
  if (saved === 'dark' || saved === 'light') return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const NAV_LINKS = [
  { label: 'Platform', href: '#features' },
  { label: 'How it works', href: '#workflow' },
];

const TRUST_BULLETS = [
  'Role-based fleet access',
  'Live vehicle status tracking',
  'Audit-ready operational data',
];

const FEATURES = [
  { icon: CarFront, tag: 'Core', title: 'Fleet registry', desc: 'Track registration, capacity, odometer, and status from one source of truth.' },
  { icon: Users, tag: 'Compliance', title: 'Driver management', desc: 'Monitor licences, expiry dates, and safety scores with automated alerts.' },
  { icon: Map, tag: 'Operations', title: 'Trip dispatch', desc: 'Draft, assign, dispatch, and complete trips with enforced vehicle–driver rules.' },
  { icon: Wrench, tag: 'Safety', title: 'Maintenance', desc: 'Log shop time and keep vehicles out of rotation while service is in progress.' },
  { icon: Fuel, tag: 'Finance', title: 'Fuel & expenses', desc: 'Record operational costs per vehicle and surface trends before they escalate.' },
  { icon: BarChart3, tag: 'Insights', title: 'Reports & ROI', desc: 'Fleet utilisation and per-vehicle ROI — exportable for finance teams.' },
];

const STATS = [
  { label: 'Vehicles managed', value: '500+', accent: 'var(--color-brand-500)' },
  { label: 'Trips completed', value: '25k+', accent: 'var(--color-accent-500)' },
  { label: 'Fleet utilisation', value: '98%', accent: 'var(--color-brand-400)' },
  { label: 'Op-cost reduction', value: '40%', accent: 'var(--color-warning)' },
];

const STEPS = [
  { icon: Bus, title: 'Register your fleet', desc: 'Add vehicles and drivers. Assign roles for managers, dispatchers, and analysts.' },
  { icon: Map, title: 'Create & dispatch', desc: 'Define routes and cargo. Assign the right vehicle–driver pair and dispatch.' },
  { icon: CarFront, title: 'Monitor operations', desc: 'Track active trips, maintenance holds, and fuel costs from the live dashboard.' },
  { icon: BarChart3, title: 'Analyse & export', desc: 'Review ROI reports and export data for stakeholders and finance.' },
];

const TRUST_STRIP = [
  { icon: Lock, label: 'JWT auth + RBAC' },
  { icon: ShieldCheck, label: 'Role-based access' },
  { icon: Clock, label: 'Audit logging' },
  { icon: Globe, label: 'Multi-role workflows' },
];

const PREVIEW_ROWS = [
  { plate: 'MH-12-AB-4521', name: 'Volvo FH16', status: 'Available', badge: 'badge-emerald' },
  { plate: 'DL-01-CD-8834', name: 'Tata Prima', status: 'On Trip', badge: 'badge-blue' },
  { plate: 'KA-05-EF-2290', name: 'Ashok 5525', status: 'In Shop', badge: 'badge-amber' },
];

const PREVIEW_KPIS = [
  { label: 'Available', value: '42', accent: 'var(--color-accent-500)' },
  { label: 'On trip', value: '18', accent: 'var(--color-brand-500)' },
  { label: 'In shop', value: '4', accent: 'var(--color-warning)' },
];

const ProductPreview = () => (
  <div className="mkt-preview">
    <div className="mkt-preview-bar">
      <div className="mkt-preview-bar-inner">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)]">
          <Bus className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-[var(--text-primary)]">
          Transit<span className="text-[var(--color-brand-600)]">Ops</span>
        </span>
      </div>
    </div>

    <div className="mkt-preview-kpis">
      {PREVIEW_KPIS.map((kpi) => (
        <div key={kpi.label} className="kpi-card mkt-preview-kpi" style={{ '--kpi-accent': kpi.accent }}>
          <p className="text-label">{kpi.label}</p>
          <p className="text-kpi-value kpi-card-value !text-xl">{kpi.value}</p>
        </div>
      ))}
    </div>

    <div className="mkt-preview-table-wrap">
      <div className="ds-data-table">
        <div className="ds-data-table-head">
          <span>Plate</span>
          <span>Vehicle</span>
          <span>Status</span>
        </div>
        {PREVIEW_ROWS.map((row) => (
          <div key={row.plate} className="ds-data-table-row">
            <span className="text-mono-data !text-xs">{row.plate}</span>
            <span className="ds-data-table-cell-primary !text-xs">{row.name}</span>
            <span className={cn('badge', row.badge)}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('transitops-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="ds-page">
      <div className="ds-page-grid" aria-hidden="true" />

      <header className="mkt-nav">
        <div className="mkt-container flex h-full items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-600)] shadow-[var(--shadow-sm)]">
              <Bus className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
              Transit<span className="text-[var(--color-brand-600)]">Ops</span>
            </span>
          </Link>

          <nav className="mkt-nav-links" aria-label="Marketing">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mkt-nav-actions">
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="mkt-theme-toggle"
              aria-label={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="btn btn-outline">Sign in</Link>
            <Link to="/register" className="btn btn-primary">Get started</Link>
          </div>

          <div className="mkt-nav-mobile">
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="mkt-theme-toggle"
              aria-label={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="mkt-nav-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mkt-mobile-menu">
            <nav aria-label="Mobile">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="mkt-mobile-menu-link"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mkt-mobile-menu-actions">
              <Link to="/login" className="btn btn-outline w-full" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>Get started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 page-enter">
        {/* Hero */}
        <section className="mkt-section-hero">
          <div className="mkt-container mkt-hero-grid">
            <div className="mkt-hero-copy">
              <p className="text-label">Enterprise fleet operations</p>
              <h1 className="text-display">
                Run your fleet with{' '}
                <span className="text-[var(--color-brand-600)]">precision</span>
              </h1>
              <p className="max-w-lg text-body-lg">
                Dispatch, maintain, and analyse fleet operations from one platform built for fleet managers and finance teams.
              </p>

              <ul className="mkt-hero-bullets">
                {TRUST_BULLETS.map((item) => (
                  <li key={item} className="text-body">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent-500)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mkt-hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start free trial
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign in</Link>
              </div>
            </div>

            <div className="mkt-hero-preview">
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="mkt-trust-strip">
          <div className="mkt-container mkt-trust-strip-inner">
            {TRUST_STRIP.map(({ icon: Icon, label }) => (
              <div key={label} className="mkt-trust-item">
                <Icon className="h-4 w-4 text-[var(--color-brand-600)]" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mkt-section scroll-mt-20">
          <div className="mkt-container">
            <div className="mkt-section-header">
              <p className="text-label">Platform</p>
              <h2 className="text-h2">Everything your fleet team needs</h2>
              <p className="text-body-lg">
                From vehicle registry to ROI reports — one system for operations, compliance, and finance.
              </p>
            </div>

            <div className="mkt-section-lead mkt-grid-features">
              {FEATURES.map(({ icon: Icon, tag, title, desc }) => (
                <article key={title} className="ds-panel mkt-feature-card transition-smooth hover:shadow-[var(--shadow-md)]">
                  <div className="mkt-feature-card-head">
                    <div className="mkt-feature-icon">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="badge badge-gray">{tag}</span>
                  </div>
                  <h3 className="text-h3">{title}</h3>
                  <p className="text-body">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mkt-section bg-[var(--bg-surface)] border-y border-[var(--border-base)]">
          <div className="mkt-container mkt-grid-stats">
            {STATS.map(({ label, value, accent }) => (
              <div key={label} className="kpi-card mkt-stat-card" style={{ '--kpi-accent': accent }}>
                <p className="text-label">{label}</p>
                <p className="text-kpi-value kpi-card-value">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="mkt-section scroll-mt-20">
          <div className="mkt-container">
            <div className="mkt-section-header">
              <p className="text-label">How it works</p>
              <h2 className="text-h2">From registration to ROI in four steps</h2>
            </div>

            <div className="mkt-section-lead mkt-grid-steps">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="ds-panel mkt-step-card">
                  <span className="ds-section-index !h-8 !w-8 !text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <div className="mkt-feature-icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-h3">{title}</h3>
                  <p className="text-body">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mkt-section">
          <div className="mkt-container">
            <div className="mkt-cta">
              <h2 className="text-h2">Ready to streamline your fleet operations?</h2>
              <p className="text-body-lg">
                Join fleet managers who use TransitOps to dispatch smarter and report faster.
              </p>
              <div className="mkt-cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">Create your account</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign in</Link>
              </div>
              <p className="mkt-cta-note text-caption text-[var(--text-muted)]">
                No credit card required · Free trial for new teams
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mkt-footer">
        <div className="mkt-container">
          <div className="mkt-footer-grid">
            <div className="mkt-footer-brand max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)]">
                  <Bus className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)]">TransitOps</span>
              </div>
              <p className="text-body">
                Enterprise fleet operations platform for dispatch, compliance, and financial reporting.
              </p>
              <p className="mkt-footer-status text-caption text-[var(--text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent-500)]" aria-hidden="true" />
                All systems operational
              </p>
            </div>

            <div className="mkt-footer-links">
              <div className="mkt-footer-col">
                <p className="text-label">Product</p>
                <ul>
                  <li><a href="#features" className="hover:text-[var(--text-primary)] transition-smooth">Features</a></li>
                  <li><a href="#workflow" className="hover:text-[var(--text-primary)] transition-smooth">How it works</a></li>
                </ul>
              </div>
              <div className="mkt-footer-col">
                <p className="text-label">Account</p>
                <ul>
                  <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-smooth">Sign in</Link></li>
                  <li><Link to="/register" className="hover:text-[var(--text-primary)] transition-smooth">Register</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mkt-footer-bar">
            <p>© {new Date().getFullYear()} TransitOps. All rights reserved.</p>
            <div className="mkt-footer-legal">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
