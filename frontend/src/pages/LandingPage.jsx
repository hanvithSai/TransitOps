/**
 * LandingPage.jsx
 *
 * Public-facing marketing page for TransitOps.
 * Built as a fully designed, section-by-section layout following
 * the project's design system (CSS custom properties in index.css).
 *
 * Sections:
 *  1. Navbar   – fixed, scroll-aware glassmorphism
 *  2. Hero     – two-column, headline + UI mockup
 *  3. Logos    – trust strip (placeholder logos)
 *  4. Features – 3-column feature grid
 *  5. Stats    – 4 KPI numbers
 *  6. Workflow – numbered step-by-step
 *  7. CTA      – full-bleed brand banner
 *  8. Footer   – 4-column links
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Menu, X, ArrowRight, ArrowUpRight,
  Activity, Users, Map, Wrench, TrendingUp,
  ShieldCheck, CheckCircle2, Zap, BarChart3,
  Lock, Clock, Globe, Star,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

/* ─── Data ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    icon: Bus,
    title: 'Fleet Management',
    desc: 'Real-time visibility into every vehicle — location, capacity, status, and utilisation — from one unified dashboard.',
    tag: 'Core',
  },
  {
    icon: Users,
    title: 'Driver Management',
    desc: 'Track licences, expiry dates, and safety scores. Get automated alerts before a licence lapses.',
    tag: 'Compliance',
  },
  {
    icon: Map,
    title: 'Trip Dispatch',
    desc: 'Create, assign, and track trips from draft to delivery. Route optimisation built in.',
    tag: 'Operations',
  },
  {
    icon: Wrench,
    title: 'Maintenance',
    desc: 'Schedule preventative maintenance, log shop time, and never let a service interval slip through the cracks.',
    tag: 'Safety',
  },
  {
    icon: TrendingUp,
    title: 'Fuel & Expenses',
    desc: 'Log every litre and every receipt. Identify anomalies and cut operational costs measurably.',
    tag: 'Finance',
  },
  {
    icon: BarChart3,
    title: 'Enterprise Analytics',
    desc: 'Interactive reports, live charts, and exportable data to power every boardroom decision.',
    tag: 'Insights',
  },
];

const STATS = [
  { value: '500+', label: 'Vehicles managed daily' },
  { value: '25 k+', label: 'Trips completed' },
  { value: '98%', label: 'Fleet utilisation rate' },
  { value: '40%', label: 'Reduction in op-costs' },
];

const STEPS = [
  {
    n: '01',
    icon: Bus,
    title: 'Register Your Fleet',
    desc: 'Add vehicles and drivers in minutes. Import from CSV or connect your existing systems.',
  },
  {
    n: '02',
    icon: Map,
    title: 'Create & Assign Trips',
    desc: 'Define routes, cargo, and schedules. Assign the best driver-vehicle pair automatically.',
  },
  {
    n: '03',
    icon: Activity,
    title: 'Monitor Live',
    desc: 'Track every trip in real time. Get alerts on delays, incidents, or safety violations.',
  },
  {
    n: '04',
    icon: BarChart3,
    title: 'Analyse & Improve',
    desc: 'Review performance data, spot trends, and continuously optimise your entire operation.',
  },
];

const TRUST_BADGES = [
  { icon: Lock,  label: 'Bank-grade security' },
  { icon: Clock, label: '99.9% uptime SLA'    },
  { icon: Globe, label: 'Multi-region support' },
  { icon: Zap,   label: 'Real-time sync'       },
];

/* ─── Sub-components ─────────────────────────────────────────────── */

/** Pill / badge label used in feature cards */
const Tag = ({ children }) => (
  <span className="inline-block rounded-full bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)] text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 border border-[var(--color-brand-100)] dark:border-[var(--color-brand-800)]">
    {children}
  </span>
);

/** Decorative blurred gradient orb */
const Orb = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      'pointer-events-none absolute rounded-full blur-[120px] opacity-40 dark:opacity-20',
      className,
    )}
  />
);

/* ─── Page Component ─────────────────────────────────────────────── */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════
          1. NAVBAR
      ════════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border-base)] shadow-sm'
            : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 select-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)] shadow shadow-[var(--color-brand-600)]/30">
              <Bus className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Transit<span className="text-[var(--color-brand-600)]">Ops</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link to="/register">
              <Button size="sm" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-md p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border-base)] bg-[var(--bg-surface)] px-6 py-6 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <hr className="border-[var(--border-base)]" />
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button fullWidth icon={ArrowRight} iconPosition="right">
                Get Started Free
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════
          2. HERO
      ════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative pt-36 pb-28 lg:pt-44 lg:pb-36 overflow-hidden"
      >
        {/* Background orbs */}
        <Orb className="h-[600px] w-[600px] bg-[var(--color-brand-400)] -top-32 -right-32" />
        <Orb className="h-[480px] w-[480px] bg-[var(--color-accent-400)] bottom-0 -left-24" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left column – copy */}
          <div className="flex flex-col items-start">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-950)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-500)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />
              </span>
              Enterprise Transport Platform
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] mb-6">
              Smart Operations for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-accent-500)]">
                Modern&nbsp;Logistics
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg leading-relaxed text-[var(--text-secondary)] mb-10 max-w-xl">
              TransitOps centralises fleet tracking, driver compliance, trip dispatch,
              fuel management, and enterprise analytics — all in one beautifully
              designed platform.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Start for Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" icon={ArrowUpRight} iconPosition="right">
                  Explore Dashboard
                </Button>
              </Link>
            </div>

            {/* Social proof / trust */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                Setup in under 10 minutes
              </span>
            </div>
          </div>

          {/* Right column – UI mockup */}
          <div className="relative hidden lg:block">
            {/* Glow behind the card */}
            <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-accent-400)] opacity-20 blur-2xl" />

            {/* App shell mockup */}
            <div className="relative rounded-2xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
              {/* Chrome bar */}
              <div className="flex items-center gap-1.5 border-b border-[var(--border-base)] bg-[var(--bg-base)] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="ml-4 flex-1 h-6 max-w-[200px] rounded-md bg-[var(--bg-surface)] border border-[var(--border-base)]" />
              </div>

              {/* App interior */}
              <div className="flex h-[380px]">
                {/* Sidebar */}
                <div className="w-14 shrink-0 border-r border-[var(--border-base)] bg-[var(--bg-base)] flex flex-col items-center pt-5 gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-brand-600)]" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn('h-7 w-7 rounded-lg', i === 0 ? 'bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]' : 'bg-[var(--border-base)]')} />
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5 space-y-4 overflow-hidden">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { bg: 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/40', border: 'border-[var(--color-brand-100)] dark:border-[var(--color-brand-800)]', bar: 'bg-[var(--color-brand-400)]' },
                      { bg: 'bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-900)]/30', border: 'border-[var(--color-accent-100)] dark:border-[var(--color-accent-800)]', bar: 'bg-[var(--color-accent-400)]' },
                      { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800', bar: 'bg-amber-400' },
                    ].map((c, i) => (
                      <div key={i} className={cn('rounded-xl border p-3', c.bg, c.border)}>
                        <div className="h-2.5 w-1/2 rounded bg-current opacity-20 mb-2" />
                        <div className={cn('h-6 w-3/4 rounded', c.bar, 'opacity-70')} />
                        <div className="mt-2 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10">
                          <div className={cn('h-1.5 rounded-full', c.bar)} style={{ width: `${55 + i * 15}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table-ish rows */}
                  <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] p-4 space-y-2.5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-3 w-24 rounded bg-[var(--border-base)]" />
                      <div className="h-5 w-16 rounded-full bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] border border-[var(--color-brand-100)]" />
                    </div>
                    {[80, 60, 90, 45].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-base)] shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 rounded bg-[var(--border-base)]" style={{ width: `${w}%` }} />
                          <div className="h-2 rounded bg-[var(--border-base)] opacity-60" style={{ width: `${w - 20}%` }} />
                        </div>
                        <div className={cn('h-5 w-14 rounded-full text-center text-[10px]', i === 1 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-[var(--border-base)]')} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge – trips completed */}
            <div className="absolute -bottom-4 -left-6 rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Trips today</p>
                <p className="text-base font-bold text-[var(--text-primary)]">148 completed</p>
              </div>
            </div>

            {/* Floating badge – live vehicles */}
            <div className="absolute -top-4 -right-6 rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-[var(--color-brand-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Active vehicles</p>
                <p className="text-base font-bold text-[var(--text-primary)]">87 / 94 live</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. TRUST STRIP
      ════════════════════════════════════════════════════════════ */}
      <div className="border-y border-[var(--border-base)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-muted)]"
            >
              <Icon className="h-4 w-4 text-[var(--color-brand-500)]" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          4. FEATURES
      ════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-28 lg:py-36">
        <Orb className="h-[500px] w-[500px] bg-[var(--color-brand-300)] top-0 right-1/4" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-20 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-brand-600)]">
              Platform Capabilities
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-primary)] mb-5">
              Everything your fleet team needs
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              A complete suite of tools purpose-built for transport operations —
              from the yard to the boardroom.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, tag }, i) => (
              <div
                key={i}
                className="group relative flex flex-col p-8 rounded-2xl border border-[var(--border-base)] bg-[var(--bg-surface)] hover:border-[var(--color-brand-300)] dark:hover:border-[var(--color-brand-700)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)] transition-all duration-300 group-hover:bg-[var(--color-brand-600)] group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--color-brand-500)]/30">
                  <Icon className="h-7 w-7" />
                </div>

                {/* Tag */}
                <div className="mb-3">
                  <Tag>{tag}</Tag>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-snug">
                  {title}
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed flex-1">
                  {desc}
                </p>

                {/* Hover arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-600)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Subtle gradient overlay on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--color-brand-50)]/30 to-transparent dark:from-[var(--color-brand-900)]/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. STATS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[var(--color-brand-950)] dark:bg-[var(--color-brand-950)] relative overflow-hidden">
        <Orb className="h-[400px] w-[400px] bg-[var(--color-brand-600)] opacity-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {STATS.map(({ value, label }, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-12 px-6 text-center bg-[var(--color-brand-950)]"
              >
                <p className="text-4xl lg:text-5xl font-bold text-white mb-2 leading-none">
                  {value}
                </p>
                <p className="text-sm font-medium text-[var(--color-brand-300)] leading-snug max-w-[120px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section id="workflow" className="relative py-28 lg:py-36 bg-[var(--bg-surface)]">
        <Orb className="h-[500px] w-[500px] bg-[var(--color-accent-300)] bottom-0 left-0 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-brand-600)]">
              Simple by Design
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-primary)] mb-5">
              From sign-up to full visibility in&nbsp;4&nbsp;steps
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              No professional services, no lengthy onboarding. Your team is up and
              running in under a day.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line – desktop only */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[var(--color-brand-300)] dark:via-[var(--color-brand-700)] to-transparent" />

            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-base)] border-2 border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] shadow-md group-hover:border-[var(--color-brand-500)] group-hover:shadow-[var(--color-brand-500)]/20 group-hover:shadow-lg transition-all duration-300">
                  <Icon className="h-8 w-8 text-[var(--color-brand-600)]" />
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white text-xs font-bold">
                    {i + 1}
                  </span>
                </div>

                {/* Step number text */}
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-500)] mb-2">
                  Step {n}
                </p>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-snug">
                  {title}
                </h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-700)] via-[var(--color-brand-600)] to-[var(--color-accent-700)]" />
        <Orb className="h-[600px] w-[600px] bg-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[200px]" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center text-white">
          {/* Stars */}
          <div className="mb-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <h2 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Ready to transform your fleet operations?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of logistics companies that trust TransitOps to run
            smarter, safer, and more profitable operations every day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-[var(--color-brand-700)] hover:bg-gray-50 font-bold shadow-xl shadow-black/20 px-10"
                icon={ArrowRight}
                iconPosition="right"
              >
                Start for Free
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10"
              >
                View Live Demo
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/60 font-medium">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-base)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            {/* Brand column */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-5 select-none">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)]">
                  <Bus className="h-4.5 w-4.5 text-white" />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  Transit<span className="text-[var(--color-brand-600)]">Ops</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mb-6">
                The enterprise-grade transport operations platform built for modern
                logistics teams.
              </p>
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                All systems operational
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                heading: 'Product',
                links: ['Features', 'Integrations', 'Pricing', 'Changelog'],
              },
              {
                heading: 'Company',
                links: ['About', 'Careers', 'Blog', 'Contact'],
              },
              {
                heading: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="mb-5 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-brand-600)] transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--border-base)] gap-4 text-sm text-[var(--text-muted)]">
            <p>© {new Date().getFullYear()} TransitOps. All rights reserved.</p>
            <p className="font-medium">Built for modern fleet teams.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
