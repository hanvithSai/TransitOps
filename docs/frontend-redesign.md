# TransitOps Frontend Redesign

> Phase 1 evaluation + Phase 2 design direction for the visual/UX revamp.

---

## Phase 1 — Evaluation Report

### Architecture

| Area | Assessment | Priority |
|------|------------|----------|
| Frontend/backend separation | Clean REST API via Axios; JWT in localStorage + refresh cookie | — |
| API design | Consistent `{ success, data, message }` shape; role-gated endpoints | — |
| Auth flow | AuthContext + ProtectedRoute; token refresh queue in interceptor | Medium |
| Data fetching | Per-page `useState` + `useEffect`; no React Query | Medium |
| Mock fallback | Silent fallback on network/5xx; no user-visible demo indicator | **High** |

**Files:** `frontend/src/services/api.js`, `frontend/src/contexts/AuthContext.jsx`, `frontend/src/components/ProtectedRoute.jsx`

### Frontend Code Quality

| Finding | Priority | Files |
|---------|----------|-------|
| Monolithic page files (400–700+ lines) with inline forms | Medium | `TripsPage.jsx`, `UsersPage.jsx`, `FinancePage.jsx` |
| No shared hooks (`useVehicles`, etc.) | Low | All CRUD pages |
| Badge variant mismatch (`success`/`info` vs `emerald`/`blue`) | **High** | `Badge.jsx`, all list pages |
| LoginPage bypasses `Input` component | Low | `LoginPage.jsx` |
| No TypeScript, no frontend tests | Medium | Entire frontend |

### Visual Design

| Finding | Priority |
|---------|----------|
| Solid indigo brand + CSS custom properties already in place | — |
| Inconsistent page headers (some with icon box, some plain h1) | Medium |
| KPI cards use ad-hoc Tailwind color classes per page | Medium |
| Dark mode tokens exist but semantic colors don't adapt (success-bg stays light green) | **High** |
| No mono font for registration numbers / IDs | Low |

### UX Flows

| Finding | Priority |
|---------|----------|
| CRUD pattern is consistent: search + filter + table + modal + toast | — |
| Empty states exist but vary in quality | Medium |
| Loading uses spinners only — no skeletons | Medium |
| Remember-me checkbox is decorative (not wired) | Low |
| 404 redirects to dashboard (may confuse) | Low |

### Responsiveness

| Finding | Priority |
|---------|----------|
| Mobile drawer nav works; sidebar collapse on desktop | — |
| Tables scroll horizontally but no card fallback on mobile | Medium |
| Modals not full-screen on small viewports | Medium |
| Touch targets mostly ≥ 36px; some icon buttons are 32px | Low |

### Interactivity

| Finding | Priority |
|---------|----------|
| Hover states on table rows and buttons present | — |
| Modal has Escape close but no focus trap | **High** |
| Chart tooltips use CSS vars (good) | — |
| Dark mode not persisted across sessions | Medium |

### Accessibility

| Finding | Priority |
|---------|----------|
| Focus rings on buttons/inputs | — |
| Modal missing focus trap and `aria-labelledby` | **High** |
| Icon-only buttons mostly have `aria-label` | — |
| Semantic heading hierarchy inconsistent | Medium |

### Production Gaps

| Finding | Priority |
|---------|----------|
| No frontend tests; CI only lint + build | Medium |
| Mock login returns admin regardless of credentials | **High** |
| RBAC nav mismatch: Trips allows `safety_officer` at route but not in nav | **High** |
| Dashboard/reports lack backend RBAC enforcement | Medium (backend) |
| Node pinned at 20.20.2 in `.nvmrc` | Low |

---

## Phase 2 — Design Direction

### Design Principles

1. **Operational clarity** — Dense fleet data must scan in seconds; hierarchy beats decoration.
2. **Trust through restraint** — Professional B2B tone; no gratuitous gradients or motion.
3. **Dark mode as co-equal** — Surfaces, borders, and semantic colors designed for both themes.
4. **Actionable feedback** — Every mutation shows toast confirmation; destructive actions require explicit confirmation.
5. **Field-ready** — Tablet-friendly touch targets, readable tables, mobile nav that doesn't fight content.
6. **Distinct but familiar** — Indigo-teal fleet identity; patterns inspired by Linear/Stripe, not cloned.

### Visual System

#### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Brand 600 | `#4f46e5` | `#6366f1` | Primary actions, active nav |
| Accent 500 | `#14b8a6` | `#2dd4bf` | Success highlights, live indicators |
| Surface | `#ffffff` | `#111827` | Cards, sidebar |
| Base | `#f1f5f9` | `#0B0F19` | Page background |
| Border | `#e2e8f0` | `#1f2937` | Dividers, inputs |
| Text primary | `#0f172a` | `#f8fafc` | Headings, values |
| Text muted | `#94a3b8` | `#64748b` | Labels, captions |

Semantic colors adapt in dark mode (muted backgrounds, lighter text).

#### Typography

| Scale | Font | Size | Usage |
|-------|------|------|-------|
| Display | Outfit 700 | 2rem–3rem | Landing hero |
| H1 | Outfit 600 | 1.5rem | Page titles |
| H2/H3 | Outfit 600 | 1rem–1.125rem | Section/card headers |
| Body | Inter 400/500 | 0.875rem | Tables, forms |
| Label | Inter 600 | 0.6875rem uppercase | Table headers, KPI labels |
| Mono | JetBrains Mono | 0.8125rem | Registration numbers, IDs |

#### Spacing & Shape

- Base unit: 4px; page padding 24px mobile / 40px desktop
- Card radius: 12px (`rounded-xl`); buttons/inputs: 10px
- Shadows: `shadow-sm` default, `shadow-md` on hover; no heavy drop shadows
- Transitions: 200ms ease for color/transform; 300ms for layout (sidebar)

#### Icons

Lucide at 16px (inline), 20px (nav), 24px (page headers). Icon-only buttons require `aria-label`.

### Component Inventory

| Component | Action |
|-----------|--------|
| Button, Input, Card, Badge, Modal, Table, Toast | Refactor in place |
| PageHeader | **Add** — unified page title + action slot |
| EmptyState | **Add** — illustration + CTA |
| Skeleton | **Add** — loading placeholders |
| DemoModeBanner | **Add** — visible mock-data indicator |
| Select | Style via shared CSS class (no new component) |

### Page UX Notes

| Page | Notes |
|------|-------|
| Landing | Stronger hero contrast; refined stat strip; clearer CTA hierarchy |
| Auth | Use Input component; password toggle; centered card with subtle grid bg |
| Dashboard | KPI cards with accent left border; chart cards with consistent header |
| List pages | PageHeader + filter bar in Card; table density tuned; row actions on hover |
| Trips | Master-detail: selected row highlight; status badges with icons |
| Reports | Export CTA prominent; summary metrics above table |
| App shell | Breadcrumbs, user dropdown, persisted theme, demo banner |

### Interaction Patterns

- **Tables:** Sticky header, zebra optional, selected row ring, horizontal scroll on mobile
- **Filters:** Inline search + status dropdown in toolbar card
- **Modals:** Focus trap, Escape close, bottom-sheet on `<640px`
- **Toasts:** Bottom-right, 4s auto-dismiss, manual close
- **Destructive:** Confirm modal with red accent panel
- **Charts:** Theme-aware tooltips, muted grid lines, brand-colored series

---

## Phase 3 — Implementation Summary

See git diff for full file list. Key changes:

- Consolidated tokens in `index.css` with dark-mode semantic colors
- Upgraded all UI primitives + new shared components
- AppLayout: breadcrumbs, user menu, theme persistence, RBAC nav fix, demo banner
- Pages updated with PageHeader, Skeleton, EmptyState where applicable
- Badge aliases: `success`→`emerald`, `info`→`blue`, `warning`→`amber`, `danger`→`red`, `default`→`gray`

### Known Follow-ups (Jul 31, 2026)

- ✅ React Hook Form + Zod on CRUD forms — **Done**
- ✅ Retire / Set Off Duty delete alternatives — **Done**
- Extract shared CRUD hooks to reduce page duplication
- Add Vitest + RTL for auth redirect tests
- Mobile card fallback for tables
- Wire remember-me or remove checkbox
- Backend RBAC for dashboard/reports endpoints — see `backlog.md` #4
- Fix mock data schema alignment — see `backlog.md` #2
- Modal focus trap and `aria-labelledby`
