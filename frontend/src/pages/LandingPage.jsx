import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[var(--bg-surface)]/90 backdrop-blur-md shadow-sm border-b border-[var(--border-base)] py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-900)]">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
                <circle cx="7" cy="18.5" r="1.5" />
                <circle cx="17" cy="18.5" r="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--color-brand-900)] dark:text-white">TransitOps</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#home" className="hover:text-[var(--color-brand-600)] transition-colors">Home</a>
            <a href="#features" className="hover:text-[var(--color-brand-600)] transition-colors">Features</a>
            <a href="#workflow" className="hover:text-[var(--color-brand-600)] transition-colors">Workflow</a>
            <a href="#roles" className="hover:text-[var(--color-brand-600)] transition-colors">Roles</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-brand-600)] transition-colors">Log In</Link>
            <Link to="/register" className="rounded-[10px] bg-[var(--color-brand-900)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-800)]">Get Started</Link>
          </div>

          <button className="md:hidden text-[var(--text-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border-base)] shadow-lg p-6 flex flex-col gap-4">
            <a href="#home" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#workflow" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
            <hr className="border-[var(--border-base)]" />
            <Link to="/login" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="text-sm font-medium text-[var(--color-brand-600)]" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section id="home" className="pt-32 pb-20 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/4 transform opacity-20">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-50)] blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-6 border border-[var(--color-brand-100)]">Enterprise Logistics Platform</span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] text-[var(--text-primary)] mb-6">
              Smart Transport Operations for <span className="text-[var(--color-brand-600)]">Modern Logistics</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg">
              TransitOps digitizes vehicles, drivers, dispatch, maintenance, fuel tracking, expense management, and analytics from a single centralized platform.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/register" className="rounded-[10px] bg-[var(--color-brand-900)] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--color-brand-800)] hover:shadow-lg hover:shadow-blue-900/20">
                Get Started
              </Link>
              <Link to="/login" className="rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] px-8 py-3.5 text-base font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--bg-surface-hover)]">
                Explore Dashboard
              </Link>
            </div>
          </div>
          <div className="relative relative lg:-right-10">
            <div className="relative rounded-2xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-2 shadow-2xl animate-[float_6s_ease-in-out_infinite]">
              {/* Browser Mockup Header */}
              <div className="flex items-center gap-1.5 border-b border-[var(--border-base)] pb-2 pt-1 px-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="p-4 flex gap-4 h-[400px]">
                <div className="w-16 bg-gray-50 rounded-lg hidden sm:block border border-gray-100"></div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-blue-50 rounded-lg border border-blue-100"></div>
                    <div className="h-20 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                    <div className="h-20 bg-purple-50 rounded-lg border border-purple-100"></div>
                  </div>
                  <div className="flex gap-4 h-full">
                    <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 p-3">
                      <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-10 bg-white rounded border border-gray-100"></div>
                        <div className="h-10 bg-white rounded border border-gray-100"></div>
                        <div className="h-10 bg-white rounded border border-gray-100"></div>
                      </div>
                    </div>
                    <div className="w-1/3 bg-gray-50 rounded-lg border border-gray-100 hidden md:block"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics ────────────────────────────────────────── */}
      <section className="py-16 border-y border-[var(--border-base)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-[var(--border-base)]">
          <div className="text-center px-4">
            <h3 className="text-4xl font-bold text-[var(--color-brand-600)]">500+</h3>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">Vehicles Managed</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-4xl font-bold text-[var(--color-brand-600)]">25k+</h3>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">Trips Completed</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-4xl font-bold text-[var(--color-brand-600)]">98%</h3>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">Fleet Utilization</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-4xl font-bold text-[var(--color-brand-600)]">40%</h3>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">Lower Operational Cost</p>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Everything you need to run your fleet</h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">A comprehensive suite of modules designed to handle the complexity of modern transport operations.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Fleet Management', desc: 'Track all your vehicles, capacities, and availability in real-time.' },
              { title: 'Driver Management', desc: 'Monitor licenses, expiry dates, and driver safety scores.' },
              { title: 'Trip Dispatch', desc: 'Create, assign, and track trips from draft to completion.' },
              { title: 'Maintenance', desc: 'Schedule and track vehicle maintenance and shop time.' },
              { title: 'Fuel & Expenses', desc: 'Log fuel consumption and track operational expenses.' },
              { title: 'Enterprise Analytics', desc: 'Make data-driven decisions with real-time reports and charts.' },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border-base)] bg-[var(--bg-surface)] p-6 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────── */}
      <section id="workflow" className="py-24 bg-[var(--bg-surface)] border-y border-[var(--border-base)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Simplified Workflow</h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">From registration to analytics, TransitOps streamlines every step.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border-base)] -z-10"></div>
            {[
              { step: '1', title: 'Register Fleet', desc: 'Add vehicles and drivers' },
              { step: '2', title: 'Create Trip', desc: 'Define route and cargo' },
              { step: '3', title: 'Dispatch', desc: 'Assign resources' },
              { step: '4', title: 'Track', desc: 'Monitor operations' },
            ].map((item, i) => (
              <div key={i} className="flex flex-row md:flex-col items-center gap-4 md:gap-4 md:text-center bg-[var(--bg-surface)] px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-900)] text-white font-bold ring-8 ring-[var(--bg-surface)]">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-brand-900)] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Modernize Your Fleet Operations?</h2>
          <p className="text-lg text-blue-100 mb-10">Join leading logistics companies using TransitOps to optimize their daily operations.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto rounded-[10px] bg-white px-8 py-3.5 text-base font-bold text-[var(--color-brand-900)] transition-all hover:bg-gray-50">
              Get Started for Free
            </Link>
            <Link to="/contact" className="w-full sm:w-auto rounded-[10px] border border-blue-400 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-blue-800">
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[var(--bg-surface)] py-12 border-t border-[var(--border-base)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-brand-900)]">
                <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M1 17h22M5 17V9l3-5h8l3 5v8" />
                </svg>
              </div>
              <span className="font-bold text-[var(--text-primary)]">TransitOps</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Enterprise-grade transport operations platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link to="/features" className="hover:text-[var(--color-brand-600)]">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-[var(--color-brand-600)]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link to="/about" className="hover:text-[var(--color-brand-600)]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--color-brand-600)]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link to="/privacy" className="hover:text-[var(--color-brand-600)]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[var(--color-brand-600)]">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[var(--border-base)] text-center text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} TransitOps. All rights reserved.
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
