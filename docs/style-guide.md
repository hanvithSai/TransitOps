# TransitOps Design System & Style Guide

| | |
|---|---|
| **Version** | 2.1 |
| **Status** | Active — mandatory reference for all UI work |
| **Audience** | Product, design, engineering |
| **Code source of truth** | `frontend/src/index.css` (tokens + layout utilities), `frontend/src/components/ui/` (React primitives) |
| **Last updated** | July 31, 2026 — post frontend UX polish (searchable selects, trips/maintenance layouts, app shell) |

---

## Document purpose

This guide defines the visual language, interaction patterns, and content standards for **TransitOps** — an enterprise B2B fleet operations platform used by dispatchers, fleet managers, safety officers, and finance teams.

Every screen, component, and revision must conform to this document. For open UX polish and future work, see [`backlog.md`](./backlog.md). For audit history, see [`audit-report.md`](./audit-report.md).

### Implementation status (v2.1)

The following are **implemented and in production use**:

| Area | Status |
|------|--------|
| Design tokens & typography utilities | `index.css` |
| Marketing landing page | `LandingPage.jsx` + `.mkt-*` utilities |
| Auth pages | `AuthLayout` + `.auth-*` utilities |
| App shell | `AppLayout.jsx` + `.app-*` utilities |
| UI primitives | `components/ui/*` (Button, Input, Card, Badge, Modal, Table, Toast, PageHeader, EmptyState, Skeleton, StatCard, ClampedText) |
| Shared form controls | `components/common/*` (Modal, Toast, SelectField, SearchableSelectField, SearchInput) |
| Option helpers | `lib/selectOptions.js` — vehicle/driver/trip labels for searchable selects |
| App pages | `pages/app/*` — Dashboard, Vehicles, Drivers, Trips, Maintenance, Finance, Reports, Users (incl. Audit tab) |
| Dev token reference | `/dev/components` — `DevComponentsPage.jsx` + `.ds-*` utilities (remove before production merge) |

**Dual styling pattern:** App and auth pages use **React components** from `components/ui/`. The marketing landing page also exposes matching **CSS classes** (`.btn`, `.badge-*`) for static markup — prefer React components when adding interactive app UI.

---

## Table of contents

1. [Product context & users](#1-product-context--users)
2. [Brand identity](#2-brand-identity)
3. [Design principles](#3-design-principles)
4. [Color system](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing & layout](#6-spacing--layout)
7. [Shape, elevation & depth](#7-shape-elevation--depth)
8. [Iconography](#8-iconography)
9. [Components](#9-components)
10. [Domain patterns (B2B)](#10-domain-patterns-b2b)
11. [Marketing site](#11-marketing-site)
12. [App shell](#12-app-shell)
13. [Motion & interaction](#13-motion--interaction)
14. [Accessibility](#14-accessibility)
15. [Responsive design](#15-responsive-design)
16. [Dark mode](#16-dark-mode)
17. [Content & voice](#17-content--voice)
18. [Governance & checklist](#18-governance--checklist)
19. [File reference](#19-file-reference)

---

## 1. Product context & users

TransitOps is a **business-to-business (B2B) SaaS platform** for managing fleet operations at scale. Users work in high-stakes, data-dense environments — often under time pressure, on desktop or tablet, during live dispatch.

### Primary personas

| Persona | Primary tasks | UI priorities |
|---------|---------------|---------------|
| **Fleet manager** | Vehicle registry, maintenance, utilisation | Dense tables, KPIs, filter toolbars |
| **Dispatcher / driver** | Trip assignment, status updates | Clear status badges, quick actions |
| **Safety officer** | Driver compliance, licence expiry | Warning states, audit-friendly data |
| **Financial analyst** | Fuel, expenses, ROI reports | Export CTAs, chart readability |
| **Administrator** | User management, RBAC | Role clarity, destructive-action guards |

### Design implications for B2B

- **Scannability over spectacle** — users process tables and KPIs in seconds.
- **Operational honesty** — UI reflects real backend states; no fake metrics or decorative data.
- **Role-aware navigation** — show only routes the user's role can access.
- **Audit-ready clarity** — labels, statuses, and timestamps must be unambiguous.
- **Enterprise trust** — restrained visuals signal reliability to procurement and IT stakeholders.

---

## 2. Brand identity

### Brand essence

| Attribute | What it means in UI |
|-----------|---------------------|
| **Reliable** | Stable layouts, consistent spacing, no layout shift |
| **Precise** | Mono font for IDs/plates, aligned columns, explicit labels |
| **Efficient** | Minimal clicks for CRUD; one clear primary action per region |
| **Professional** | Restrained color, semantic badges, no hype language |

### Wordmark

```
TransitOps
─────── ───
 primary  brand indigo
```

| Element | Specification |
|---------|---------------|
| **Name** | Transit**Ops** — "Transit" in `--text-primary`, "Ops" in `--color-brand-600` |
| **Weight** | Bold (`font-bold`), tight tracking (`tracking-tight`) |
| **Size** | 15px in app sidebar; scale proportionally in marketing |

### Logo mark

| Element | Specification |
|---------|---------------|
| **Icon** | Lucide `Bus` inside a rounded square |
| **Container** | 36×36px (sidebar) or 36–40px (marketing); `rounded-xl` (12px) |
| **Background** | `--color-brand-600`; hover → `--color-brand-700` |
| **Icon color** | White; 20px (`h-5 w-5`) |
| **Clear space** | Minimum = height of the logo mark on all sides |

### Brand palette at a glance

| Role | Color | Token |
|------|-------|-------|
| **Primary brand** | Indigo | `--color-brand-600` (light), `--color-brand-500` (dark) |
| **Secondary accent** | Teal | `--color-accent-500` — live indicators, utilisation |
| **Neutrals** | Slate scale | `--bg-*`, `--text-*`, `--border-*` |

**Rule:** Indigo owns primary actions and navigation. Teal complements — it never replaces indigo for CTAs.

---

## 3. Design principles

These six principles govern every design decision. When in doubt, prioritize the higher-numbered constraint.

| # | Principle | In practice |
|---|-----------|-------------|
| 1 | **Clarity first** | Hierarchy and spacing carry meaning — not decoration, gradients, or animation |
| 2 | **Corporate restraint** | Professional B2B tone; no consumer-app playfulness or startup hype |
| 3 | **Predictable structure** | Header → toolbar → content; primary action always visible; destructive actions confirmed |
| 4 | **Theme parity** | Light and dark mode are co-equal; every token works in both |
| 5 | **Operational honesty** | Copy and previews reflect real capabilities; badges match backend enums |
| 6 | **Accessible by default** | WCAG AA contrast, visible focus rings, keyboard navigation, semantic HTML |

### What TransitOps is not

| Avoid | Why |
|-------|-----|
| Startup landing pages with gradient heroes | Undermines enterprise credibility |
| Playful consumer UI (oversized radius, emoji) | Wrong audience; reduces trust |
| Dark mode as an afterthought | Enterprise users expect both themes |
| Component-library demos | Every element must serve fleet operations |

---

## 4. Color system

All colors are CSS custom properties in `frontend/src/index.css`.

> **Critical rule:** Never hardcode hex values in components. Always use tokens so dark mode and future theme changes stay correct.

### 4.1 Brand — Indigo

Primary brand color for actions, navigation, links, and focus.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-50` | `#eef2ff` | Subtle tinted backgrounds |
| `--color-brand-500` | `#6366f1` | Focus rings, chart series, dark-mode primary |
| `--color-brand-600` | `#4f46e5` | Primary buttons, logo mark, key links (light) |
| `--color-brand-700` | `#4338ca` | Button hover (light) |
| `--nav-active-bg` | `#eef2ff` / `rgba(99,102,241,0.15)` | Active nav background |
| `--nav-active-text` | `#4338ca` / `#a5b4fc` | Active nav text |

**Usage rule:** One primary indigo action per viewport region. Secondary actions use `outline` or `ghost`.

### 4.2 Accent — Teal

Secondary accent for live status, success highlights, and utilisation metrics.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-400` | `#2dd4bf` | Dark-mode accent highlights |
| `--color-accent-500` | `#14b8a6` | Live dots, utilisation KPI borders, positive metrics |

**Usage rule:** Teal signals *live* or *positive operational* states — not primary CTAs.

### 4.3 Surfaces & borders

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg-base` | `#f1f5f9` | `#0B0F19` | Page background |
| `--bg-surface` | `#ffffff` | `#111827` | Cards, sidebar, modals |
| `--bg-surface-hover` | `#f8fafc` | `#1a2234` | Row hover, input hover |
| `--bg-elevated` | `#ffffff` | `#161e2e` | Dropdowns, popovers |
| `--border-base` | `#e2e8f0` | `#1f2937` | Card borders, dividers, inputs |
| `--border-subtle` | `#f1f5f9` | `#161e2e` | Low-emphasis separators |

**Surface hierarchy:**

```
--bg-base          ← page canvas
  └── --bg-surface ← cards, panels, sidebar
        └── --bg-elevated ← dropdowns, popovers
```

Cards always sit on `--bg-surface` over `--bg-base`. Never place identical surface colors adjacent without a border.

### 4.4 Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--text-primary` | `#0f172a` | `#f1f5f9` | Headings, table values, KPI numerals |
| `--text-secondary` | `#475569` | `#94a3b8` | Body copy, descriptions, subtitles |
| `--text-muted` | `#94a3b8` | `#64748b` | Labels, captions, placeholders, table headers |

**Hierarchy rule:** Default body text is `--text-secondary`. Reserve `--text-primary` for headings and data values.

### 4.5 Semantic colors

Used for status badges, alerts, toasts, and validation. Always use the trio:

```
--color-{name}       ← border / icon accent
--color-{name}-bg    ← background fill
--color-{name}-text  ← label text
```

| Meaning | Tokens | Badge variant |
|---------|--------|---------------|
| Success / available | `--color-success*` | `emerald` |
| Info / in progress | `--color-info*` | `blue` |
| Warning / attention | `--color-warning*` | `amber` |
| Error / danger | `--color-error*` | `red` |
| Neutral / default | surface tokens | `gray` |

Semantic backgrounds adapt in dark mode (muted rgba fills, lighter text). Never use light-only green/red tints in dark mode.

### 4.6 Chart colors

Approved series palette for Recharts and data visualizations:

| Color | Hex | Usage |
|-------|-----|-------|
| Teal | `#14b8a6` | Primary series, utilisation |
| Indigo | `#6366f1` | Secondary series |
| Amber | `#f59e0b` | Warning / cost trends |
| Rose | `#f43f5e` | Negative / retired |
| Violet | `#8b5cf6` | Tertiary breakdown |

Use CSS variables or these approved hex values in chart config only — not in component styling.

### 4.7 Color restrictions

| Do not use | Use instead |
|------------|-------------|
| Full-bleed gradient heroes | Solid surfaces + contained accent wash |
| Gradient text on headlines | Solid `--color-brand-600` accent phrase |
| `animate-ping` / pulsing dots | Single static live indicator (teal dot) |
| Purple-to-teal rainbow button gradients | Solid `--color-brand-600` primary |
| Raw Tailwind color classes (`bg-green-50`) | Semantic tokens (`--color-success-bg`) |
| Hardcoded hex in JSX/CSS modules | `var(--token)` references |

---

## 5. Typography

### Font families

| Role | Family | Token | Usage |
|------|--------|-------|-------|
| Body | Inter | `--font-sans` | Paragraphs, table cells, labels, buttons |
| Display | Outfit | `--font-display` | Headings (`h1`–`h6`), page titles, marketing headlines |
| Data | JetBrains Mono | `--font-mono` | Registration numbers, licence IDs, trip IDs, plates |

Loaded via Google Fonts in `index.css`. Do not add font families without updating this guide.

### Type scale

| Level | Size | Weight | Font | Line height | Usage |
|-------|------|--------|------|-------------|-------|
| Display | `clamp(2rem, 5vw, 3.25rem)` | 600 | Outfit | 1.1 | Marketing hero |
| H1 | `1.25rem`–`2rem` | 600 | Outfit | 1.2 | App page title (`PageHeader`) |
| H2 | `1.5rem`–`1.875rem` | 600 | Outfit | 1.25 | Marketing section titles |
| H3 | `1rem` | 600 | Outfit | 1.3 | Card titles, modal titles |
| Body | `0.875rem` (14px) | 400–500 | Inter | 1.6 | Default UI text |
| Body large | `1rem` (16px) | 400 | Inter | 1.6 | Auth descriptions, marketing subheads |
| Label | `0.6875rem` (11px) | 600 | Inter | 1.4 | Table headers, KPI labels — **uppercase, tracking-wider** |
| Caption | `0.8125rem` (13px) | 500 | Inter | 1.4 | Helper text, errors, meta |
| Mono data | `0.75rem`–`0.8125rem` | 400–500 | JetBrains Mono | 1.4 | Plates, IDs, codes |

### Typography rules

- Headings: `-0.02em` letter-spacing (set globally in `index.css`)
- One **H1 per page** — app pages use `PageHeader`; marketing sections use H2
- Table headers: **uppercase 11px** — never sentence case
- Marketing body max width: `max-w-lg` (~32rem)
- Font weight 800 / extrabold: KPI numerals only
- Data identifiers always use `--font-mono`

---

## 6. Spacing & layout

### Base unit

**4px grid.** All spacing is a multiple of 4 (Tailwind: `1` = 4px).

### Standard spacing

| Context | Value | Tailwind |
|---------|-------|----------|
| Component internal padding | 16–24px | `p-4` – `p-6` |
| Card padding | 20–24px | `p-5` / `p-6` |
| Marketing section rhythm | 64–112px | `py-16` – `py-28` |
| Related item gap | 12–16px | `gap-3` / `gap-4` |
| Section gap | 24–32px | `gap-6` / `gap-8` |
| Page horizontal padding | 16px mobile → 32px desktop | `px-4 sm:px-6 lg:px-8` |

### Content width

| Context | Max width | Class |
|---------|-----------|-------|
| Marketing page | 1152px | `max-w-6xl` |
| App content | 1280px | `max-w-7xl` |
| Auth card | 448px | `.auth-card` (`max-width: 28rem`) |
| Modal (default) | 512px | `max-w-lg` on `Modal` component |
| Modal (confirm) | 384px | `max-w-sm` |

### CSS utility layers (`index.css`)

Layout and spacing are centralized in named utility prefixes. **Do not mix ad-hoc Tailwind spacing on marketing/auth pages** — extend the relevant prefix instead.

| Prefix | Scope | Key classes |
|--------|-------|-------------|
| `.ds-*` | Design-system doc page (`/dev/components`) | `.ds-page`, `.ds-shell`, `.ds-stack`, `.ds-panel`, `.ds-data-table` |
| `.mkt-*` | Marketing site (`LandingPage.jsx`) | `.mkt-container`, `.mkt-section`, `.mkt-hero-grid`, `.mkt-feature-card`, `.mkt-nav` |
| `.auth-*` | Auth pages (`AuthLayout`) | `.auth-page`, `.auth-card`, `.auth-form`, `.auth-alert`, `.auth-shake` |
| `.app-*` | Authenticated app pages & shell | `.app-shell`, `.app-page-stack`, `.app-page-header`, `.app-table-*`, `.app-modal`, `.app-kpi-grid` |

Shared cross-cutting utilities: `.surface-card`, `.kpi-card`, `.select-field`, `.btn` / `.badge-*` (marketing), `.text-display` … `.text-kpi-value` (typography), `.page-enter`, `.table-row-selected`.

### App page structure

Every authenticated list/detail page follows this vertical rhythm:

```
┌──────────────────────────────────────────────┐
│ App shell: sidebar + header (breadcrumb)     │
├──────────────────────────────────────────────┤
│ PageHeader — icon + title + subtitle + action│
├──────────────────────────────────────────────┤
│ Summary KPI row (optional)                   │
├──────────────────────────────────────────────┤
│ Toolbar card — search + filters              │
├──────────────────────────────────────────────┤
│ Primary content — table / charts / forms     │
└──────────────────────────────────────────────┘
```

### Marketing page structure

```
Fixed navbar (64px)
  → Hero (copy left, product preview right on lg+)
  → Trust strip (icons + factual labels)
  → Feature grid (3 columns on lg)
  → Stats row (4 KPI cards with accent borders)
  → Workflow steps (4 columns on lg)
  → CTA card (contained, not full-bleed)
  → Footer
```

---

## 7. Shape, elevation & depth

### Border radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small chips, inner elements |
| `--radius-md` | 10px | Buttons, inputs, nav items |
| `--radius-lg` | 12px | Cards, modals, icon containers |
| `--radius-xl` | 16px | Mobile modal top corners |

Corporate B2B UI uses **moderate radius** — never pill-shaped cards or bubble buttons.

### Shadows

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Default card resting state |
| `--shadow-md` | Card hover, floating elements |
| `--shadow-lg` | Modals, mobile drawer, hero preview |

No `shadow-2xl`, colored glows, or heavy drop shadows. Elevation is subtle and functional.

### Borders & selection states

| State | Treatment |
|-------|-----------|
| Default | `1px solid var(--border-base)` |
| Active / selected | `--nav-active-bg` + `ring-1 ring-brand/10` |
| KPI accent | 3px left bar via `.kpi-card` (set `--kpi-accent` inline) |
| Selected table row | `.table-row-selected` — inset 3px left brand bar |
| Focus | `focus-visible:ring-2` on `--color-brand-500` |

### Background patterns

| Allowed | Not allowed |
|---------|-------------|
| Subtle grid overlays (`.ds-page-grid`, `.auth-page-grid`, `.mkt` contexts) at low opacity | Large blurred gradient orbs |
| Contained radial wash inside `.mkt-cta` | Full-viewport gradient heroes |
| `--bg-base` + `--bg-surface` layering | Stacked glassmorphism |

---

## 8. Iconography

**Library:** [Lucide React](https://lucide.dev/) only — outline style throughout.

| Context | Size | Example |
|---------|------|---------|
| Inline with body text | 16px (`h-4 w-4`) | Checkmarks, inline indicators |
| Buttons & nav | 16–20px (`h-4`–`h-5`) | Sidebar, header actions |
| Page header icon box | 20px (`h-5 w-5`) | Inside 44px tinted container |
| Feature / empty state | 20–28px | Card icons, empty illustrations |

### Icon rules

- Icon-only buttons **must** have `aria-label`
- Decorative icons: `aria-hidden="true"`
- Do not mix filled and outline styles in the same navigation
- Icon containers: tinted `--nav-active-bg` — not solid brand fill (except logo mark)

---

## 9. Components

Use primitives from `frontend/src/components/ui/`. Do not duplicate styles inline.

### 9.1 Button

| Variant | When to use |
|---------|-------------|
| `primary` | One main action per region — Save, Submit, Register |
| `outline` | Secondary — Cancel, Export, View demo |
| `secondary` | Alternative emphasis without primary weight |
| `ghost` | Tertiary / icon-only row actions |
| `danger` | Delete, cancel trip — always paired with confirm modal |

| Size | Height | When to use |
|------|--------|-------------|
| `sm` | 36px | Toolbar, compact areas |
| `md` | 40px+ | Standard forms |
| `lg` | 48px+ | Auth submit, marketing CTAs |
| `icon` | 44×44px | Table row actions (`size="icon"`) |

**Props:** `loading`, `fullWidth`, `icon` + `iconPosition` (`left` | `right`).

**Marketing-only CSS:** Landing page links use `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg` from `index.css` — same visual spec, no React wrapper.

### 9.2 Input

| Property | Value |
|----------|-------|
| Height | 44px (`h-11`) |
| Radius | `--radius-md` |
| Focus | 2px ring `--color-brand-500` |
| Error | Border + ring `--color-error`; 13px message below |
| Label | Always visible; required fields show red asterisk |

Use the shared `Input` component — do not hand-roll form fields. Auth pages use `AuthLayout` + `Input`; password visibility toggles may use a local wrapper around a native `<input>` when an trailing icon button is required.

### 9.2a AuthLayout

All auth routes (`LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`) wrap content in `components/layout/AuthLayout.jsx`:

```
.auth-page          ← full-viewport centered layout + subtle grid
  .auth-brand       ← wordmark link to /
  .auth-card         ← surface-card form container
    .auth-card-header
    .auth-alert      ← error / success banners
    .auth-form
    .auth-footer
```

Pass `shake={true}` to trigger `.auth-shake` on validation failure (500ms, one-time).

### 9.3 Select

**Native dropdown (`SelectField`):** Use for short fixed lists (status filters, roles, categories). Styled via `.select-field` in `index.css` — same height, radius, focus treatment, and optional left icon adornment as `Input`.

**Searchable combobox (`SearchableSelectField`):** Use when an option list is large or grows over time (vehicles, drivers, trips). Type to filter; falls back to native `SelectField` when fewer than six options (`minSearchOptions`). Used on Trips (assign vehicle/driver), Maintenance (vehicle), Finance modal (vehicle/trip), Users (linked driver profile).

| Property | Rule |
|----------|------|
| Options shape | `{ value, label, keywords?, disabled? }` |
| Placeholder row | `withPlaceholder()` from `lib/selectOptions.js` |
| React Hook Form | Spread `{...register('field')}` — emits synthetic `onChange({ target: { value, name } })` |
| Empty filter | Show `emptyMessage` (default "No matches found") |

Do not hand-roll `<select>` styling on app pages — use `SelectField` or `SearchableSelectField`.

### 9.4 Card

| Property | Value |
|----------|-------|
| Background | `--bg-surface` via `.surface-card` |
| Border | `1px var(--border-base)` |
| Padding | `p-5 sm:p-6` (use `noPadding` for embedded tables) |
| Hover | Optional `hover` prop — `shadow-md` + border tint only |

KPI / stat cards: use `.kpi-card` with inline `style={{ '--kpi-accent': 'var(--color-brand-500)' }}`. The 3px left accent bar reads from `--kpi-accent`.

### 9.5 Badge

Pill shape, 11px uppercase semibold. Approved variants:

| Variant | Aliases |
|---------|---------|
| `gray` | `default` |
| `emerald` | `success` |
| `blue` | `info` |
| `amber` | `warning` |
| `red` | `danger` |
| `purple` | — (admin/special states only) |

Do not invent new badge colors. Map domain statuses via aliases in `Badge.jsx`.

### 9.6 Table

Implemented via `Table`, `TableHead`, `TableRow`, `TableHeader`, `TableCell` in `components/ui/Table.jsx`, styled with `.app-table-*` utilities:

- Sticky header (`.app-table-head`)
- Header cells: 11px uppercase `--text-muted` (`.app-table-th`)
- Row hover: `--bg-surface-hover` (`.app-table-row`)
- Selected row: `.table-row-selected`
- Identifier columns: `mono` prop on `TableCell` → `.text-mono-data`
- Row actions: `.app-row-actions` — visible on hover (desktop), always visible on mobile
- Mobile: horizontal scroll via `.app-table-wrap` (`min-width: 640px` on table)

Landing product preview uses `.ds-data-table` (CSS grid rows) — not the React `Table` component.

### 9.7 Modal

Implemented in `components/ui/Modal.jsx`, styled with `.app-modal-overlay` / `.app-modal`:

- Escape to close; body scroll locked while open
- Mobile: bottom-sheet (`.app-modal-overlay` aligns `flex-end`; rounded top corners)
- Desktop: centered dialog (`sm:items-center`)
- Header: `.app-modal-header` — title + 44px close button (`.app-modal-close`)
- Body: `.app-modal-body` — scrollable, max 92vh
- Destructive modals: red accent panel with explicit consequence copy (see Vehicles delete confirm)

### 9.8 Toast

Implemented in `components/ui/Toast.jsx`, styled with `.app-toast`:

- Position: bottom-right; full width on mobile (`max-width: 24rem` on `sm+`)
- Auto-dismiss: 4 seconds
- Types: `success`, `error`, `info` — semantic color tokens
- Every successful mutation shows a toast

### 9.9 PageHeader

Standard app page title block — **always use this component**:

```
[ Icon box 44px ]  Title (H1)
                   Subtitle              [ Primary action ]
```

Import from `components/ui/PageHeader.jsx`. Styled with `.app-page-header` utilities. Do not hand-roll page headers.

Wrap page content in `.app-page-stack` for consistent vertical rhythm (`gap: 1.5rem` → `2rem` on desktop).

### 9.10 EmptyState & Skeleton

| Component | When to use |
|-----------|-------------|
| `EmptyState` | Lists return zero rows — icon + title + description + optional CTA |
| `Skeleton` / `SkeletonTable` / `SkeletonKpiGrid` | Initial page/chart loads — prefer over spinners |

### 9.11 DemoModeBanner

Component: `components/DemoModeBanner.jsx`. Rendered at the top of `AppLayout` (above header).

**When it appears:** The axios interceptor in `services/api.js` sets demo mode when:

1. The backend is **unreachable** (network error, connection refused)
2. The backend returns **5xx** on non-auth endpoints

Auth endpoints (`/auth/*`) never use mock fallback. Failed login (401) shows the real error message.

When any API call succeeds against the live backend, demo mode clears and the banner hides on next response.

> "Demo mode — backend unavailable. Showing mock data; changes are not persisted."

Dismissible per session via the close button; reappears on reload if fallback is still active. **Operational honesty:** never hide demo mode while mock data is being served.

---

## 10. Domain patterns (B2B)

Enterprise fleet operations require consistent mapping between backend enums and UI treatment.

### Status badge mapping

| Domain | Status | Badge variant |
|--------|--------|---------------|
| **Vehicle** | Available | `emerald` |
| | On Trip | `blue` |
| | In Shop | `amber` |
| | Retired | `red` |
| **Trip** | Draft | `gray` |
| | Dispatched | `emerald` |
| | Completed | `blue` |
| | Cancelled | `red` |
| **Driver** | Active | `emerald` |
| | Suspended | `red` |
| | Off Duty | `gray` |
| **Maintenance** | Scheduled | `blue` |
| | In Progress | `amber` |
| | Completed | `emerald` |
| **User** | Admin | `purple` |
| | Active | `emerald` |
| | Inactive | `gray` |

### CRUD page pattern

Every entity list page (Vehicles, Drivers, Trips, Users, etc.) follows:

1. `PageHeader` with entity-specific icon and create action
2. Optional KPI summary row
3. Toolbar: `.app-toolbar-card` — `SearchInput` + status filter (`SelectField`)
4. Forms with many entities: `SearchableSelectField` for vehicle/driver/trip pickers (see §9.3)
5. Data table in a `Card` with `noPadding` — wraps `.app-table-wrap` (`.table-comfortable` spacing on finance/maintenance)
5. Create/edit modal with validated form
6. Toast on success; confirm modal on delete

### Data density guidelines

| Element | Guideline |
|---------|-----------|
| Table rows | 44–48px row height; no excessive whitespace |
| KPI cards | 4–6 per row on desktop; accent left border for scanability |
| Filters | Inline in toolbar card — never hidden behind extra clicks |
| Row actions | Icon buttons on hover; always 44px touch target on mobile |
| Numeric data | Right-align in tables; mono font for identifiers |

### Trust & safety patterns

| Pattern | Requirement |
|---------|-------------|
| Destructive actions | Confirm modal with red accent + consequence copy |
| Demo / mock data | `DemoModeBanner` visible at all times |
| RBAC | Nav items filtered by role; routes protected server-side |
| Export | Label format explicitly ("Export CSV") |
| Errors | Inline field errors + toast for API failures |

---

## 11. Marketing site

Rules for `LandingPage.jsx` and future public pages. Marketing must feel like the same product users log into.

**Implementation:** All section spacing, hero layout, nav, and footer rhythm live in `.mkt-*` classes in `index.css` — not ad-hoc Tailwind on the page. Navbar uses `.mkt-nav`; full desktop nav appears at **`lg` (1024px)+**; hamburger + mobile menu below that breakpoint.

### Hero

| Element | Rule |
|---------|------|
| Headline | `.text-display` — one phrase in solid `--color-brand-600` |
| Subhead | `.text-body-lg` — one sentence, factual product description |
| Layout | `.mkt-hero-grid` — stacked + centered on mobile; 2-column at `lg+` |
| CTAs | `.mkt-hero-actions` — full-width buttons on mobile; row at `sm+` |
| Trust bullets | `.mkt-hero-bullets` — left-aligned list in centered block on mobile |
| Product preview | `.mkt-preview` — KPI row + `.ds-data-table`; table scrolls horizontally on narrow viewports |

### Feature cards

- `.mkt-grid-features` — 1 col mobile → 2 col `sm` → 3 col `lg`
- `.mkt-feature-card` inside `.ds-panel` — icon box + category badge + title + description
- No hover scale or icon color inversion

### Trust strip

- `.mkt-trust-strip` — 2×2 grid on mobile; flex row at `sm+`
- Factual capability labels with Lucide icons (JWT, RBAC, audit, workflows)

### Stats row

- `.mkt-grid-stats` — responsive KPI grid using `.kpi-card` with `--kpi-accent` per metric
- Numeral: `.text-kpi-value`; label: `.text-label`

### Workflow steps

- `.mkt-grid-steps` — 1 → 2 → 4 columns by breakpoint
- `.mkt-step-card` — numbered index + icon + title + body

### CTA section

- `.mkt-cta` — contained card with subtle gradient wash (not full-bleed hero gradient)
- `.mkt-cta-actions` — stacked full-width buttons on mobile
- Trial terms in `.mkt-cta-note` (`.text-caption`)

### Footer

- `.mkt-footer` — brand column + link columns; stacks on mobile
- Logo + product description + operational status dot
- Privacy / Terms in `.mkt-footer-bar`

---

## 12. App shell

Implemented in `frontend/src/layouts/AppLayout.jsx` with `.app-shell` utilities.

### Sidebar

| Property | Value |
|----------|-------|
| Width | 260px expanded (`.app-sidebar`) / 72px collapsed (`.app-sidebar-collapsed`) |
| Breakpoint | Visible `md+`; mobile drawer below `md` |
| Active item | `.app-sidebar-link-active` — `--nav-active-bg` + `--nav-active-text` |
| Navigation | Role-filtered via `NAV_ITEMS` RBAC array — **must match** `ProtectedRoute` permissions |
| User block | `.app-sidebar-user` — initials avatar (`.app-sidebar-avatar`) + name + role label |
| Collapse toggle | `.app-sidebar-toggle` — chevron on desktop sidebar edge |

**RBAC nav roles (must stay in sync with routes):** Dashboard (all roles), Vehicles (admin, fleet_manager, driver), Drivers (admin, driver, safety_officer), Trips (admin, fleet_manager, driver, **safety_officer**), Maintenance (admin, fleet_manager), Fuel/Expenses (admin, fleet_manager, driver, financial_analyst), Reports (admin, fleet_manager, financial_analyst), Users (admin only).

### Header

| Element | Behavior |
|---------|----------|
| Breadcrumb | `.app-breadcrumb` — Home → current page label |
| Mobile menu | `.app-header-menu-btn` — **visible only below `768px`** when sidebar is off-canvas; hidden on laptop/desktop via CSS (not Tailwind alone — avoids conflict with `.app-header-icon-btn`) |
| Theme toggle | `.app-header-icon-btn` — persists to `localStorage` key `transitops-theme` |
| Sign out | Logout icon button (`.app-header-logout`) — redirects to `/login` |
| Demo banner | `.demo-banner` rendered **above** header when API fallback is active |

### Main content

- `.app-content` — scrollable region with responsive padding
- `.app-content-inner` — `max-width: 80rem` centered outlet for page routes
- Page enter animation: `.page-enter` on `<main>`

---

## 13. Motion & interaction

Motion indicates **state change**, not decoration.

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Color / border hover | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Page enter | 350ms | fade + 6px translateY (`.page-enter`) |
| Modal open | 200ms | fade + zoom/slide |
| Sidebar collapse | 300ms | width transition |
| Form error shake | 500ms | `.auth-shake` on auth card (one-time) |
| Skeleton shimmer | 1.5s | infinite (`.skeleton` loading only) |

Use `.transition-smooth` (200ms) on interactive elements — defined in `index.css`.

### Motion restrictions

- No continuous animations (ping, bounce, float)
- No hover `translate-y` on cards or primary buttons
- No parallax scrolling
- KPI stat cards on list pages may use subtle hover shadow only — no lift animation

---

## 14. Accessibility

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG AA — 4.5:1 body text, 3:1 large text |
| Focus | Visible `focus-visible:ring-2` on all interactive elements |
| Keyboard | Modals trap focus; Escape closes overlays |
| Semantics | One H1 per page; `aria-label` on icon buttons; `role="alert"` on errors |
| Touch targets | Minimum 44×44px on mobile |
| Forms | Labels via `htmlFor`; errors via `aria-describedby` |

---

## 15. Responsive design

### Marketing site breakpoints

| Breakpoint | Width | Layout changes |
|------------|-------|----------------|
| Mobile | `< 640px` | Single column hero; centered copy; full-width CTAs; 2×2 trust grid; hamburger nav |
| Tablet | `640px–1023px` | 2-col feature/stats grids; side-by-side hero CTAs; hamburger nav |
| Desktop | `1024px+` | Full nav bar; 2-column hero; 3/4-column grids |

Marketing container: `.mkt-container` with `safe-area-inset` padding for notched devices.

### App breakpoints

| Breakpoint | Width | Layout changes |
|------------|-------|----------------|
| Mobile | `< 768px` | Sidebar hidden; mobile drawer; table horizontal scroll; full-width toast |
| Tablet / desktop | `768px+` | Sidebar visible; collapse toggle; row actions on hover |
| Wide | `1280px+` | KPI grids up to 5 columns (dashboard) |

**Test every change at:** 375px · 768px · 1024px · 1440px

---

## 16. Dark mode

| Property | Value |
|----------|-------|
| Toggle | Marketing navbar (`.mkt-theme-toggle`) + app header (`.app-header-icon-btn`) |
| Storage | `localStorage.transitops-theme` → `"light"` \| `"dark"` |
| Default | `prefers-color-scheme` when no saved preference |
| Implementation | `.dark` class on `<html>` |
| Rule | Never use Tailwind `dark:` with hardcoded colors that bypass CSS variables |
| Rule | Always use `var(--token)` for backgrounds, text, borders, semantic colors |

Both themes must be designed simultaneously — not "designed for light, adapted for dark."

---

## 17. Content & voice

TransitOps speaks like a **professional operations tool**, not a marketing startup.

### Tone attributes

| Attribute | Example |
|-----------|---------|
| Direct | "Register vehicle" not "Add your awesome new ride" |
| Specific | "Export CSV" not "Get your data" |
| Operational | "Fleet utilisation" not "Supercharge your fleet" |
| Honest | "Demo mode — changes are not persisted" |

### UI copy — do / don't

| Do | Don't |
|----|-------|
| "Dispatch trip" | "Launch your journey!" |
| "Licence expires in 14 days" | "Uh oh — time's running out!" |
| "Export CSV" | "Download magic report" |
| "Fleet utilisation: 98%" | "You're crushing it at 98%!" |
| "Confirm deletion" | "Are you sure? This can't be undone!!!" |

### Label conventions

- Buttons: verb-first ("Save changes", "Add driver")
- Empty states: state + action ("No vehicles yet" + "Register vehicle" CTA)
- Errors: what happened + how to fix
- Status badges: match backend enum strings (uppercase in badge component)

---

## 18. Governance & checklist

### Before merging any UI change

- [ ] Uses CSS custom properties from `index.css` — no stray hex in components
- [ ] Works in both light and dark mode
- [ ] Uses shared UI primitives (`Button`, `Card`, `Badge`, `PageHeader`, etc.)
- [ ] App pages wrapped in `.app-page-stack`; marketing uses `.mkt-*`; auth uses `AuthLayout`
- [ ] Page follows app or marketing structure (§6)
- [ ] Typography uses utility classes (`.text-h1`, `.text-body`, `.text-label`, etc.)
- [ ] Only one primary button per logical section
- [ ] Status badges use approved semantic variants (§10)
- [ ] Icon-only controls have `aria-label`
- [ ] Touch targets ≥ 44px on mobile
- [ ] No banned patterns (§4.7, §13)
- [ ] Tested at 375 / 768 / 1024 / 1440 px
- [ ] `npm run lint` and `npm run build` pass (Node **20.20.2** per `frontend/.nvmrc`)

### When to update this guide

Update this document when:

- Adding new design tokens to `index.css`
- Introducing a new shared UI primitive
- Changing brand colors, typography, or logo treatment
- Adding new domain status types that need badge mapping

---

## 19. File reference

| Purpose | Path |
|---------|------|
| Design tokens & utilities | `frontend/src/index.css` |
| UI primitives | `frontend/src/components/ui/` |
| Auth layout shell | `frontend/src/components/layout/AuthLayout.jsx` |
| App shell | `frontend/src/layouts/AppLayout.jsx` |
| Demo mode indicator | `frontend/src/components/DemoModeBanner.jsx` |
| API client + demo fallback | `frontend/src/services/api.js` |
| Mock data (demo only) | `frontend/src/services/mockData.js` |
| Marketing page | `frontend/src/pages/LandingPage.jsx` |
| Auth pages | `frontend/src/pages/auth/` |
| App pages | `frontend/src/pages/app/` |
| Unauthorized | `frontend/src/pages/UnauthorizedPage.jsx` |
| Dev token reference (remove before merge) | `frontend/src/pages/dev/DevComponentsPage.jsx` |
| Routing | `frontend/src/App.jsx` |
| Shared form controls | `frontend/src/components/common/` (SelectField, SearchableSelectField, SearchInput) |
| Select option helpers | `frontend/src/lib/selectOptions.js` |
| Class name helper | `frontend/src/lib/utils.js` (`cn()`, fuel display formatters) |
| **This guide** | `docs/style-guide.md` |
| Open polish / backlog | `docs/backlog.md` |
| Audit report | `docs/audit-report.md` |

### Page map

| Route | Page component |
|-------|----------------|
| `/` | `LandingPage` |
| `/login`, `/register`, `/forgot-password`, `/reset-password/:token` | Auth pages |
| `/dashboard` | `DashboardPage` |
| `/trips`, `/maintenance` | Entity pages — Trips uses 50/50 master-detail; Maintenance uses sidebar + scrollable history |
| `/fuel`, `/expenses` | `FinancePage` (tabbed by route) |
| `/reports` | `ReportsPage` |
| `/users` | `UsersPage` |
| `/unauthorized` | `UnauthorizedPage` |
| `/dev/components` | `DevComponentsPage` (dev only) |

---

## Quick reference — CSS variables

```css
/* Surfaces */
var(--bg-base)              /* Page background */
var(--bg-surface)           /* Cards, panels, sidebar */
var(--bg-surface-hover)     /* Row hover, input hover */
var(--bg-elevated)          /* Dropdowns, popovers */
var(--border-base)          /* Borders, dividers */

/* Text */
var(--text-primary)         /* Headings, data values */
var(--text-secondary)       /* Body copy */
var(--text-muted)           /* Labels, captions */

/* Brand */
var(--color-brand-600)      /* Primary actions (light) */
var(--color-brand-500)      /* Focus rings, dark primary */
var(--color-accent-500)     /* Live / utilisation accent */

/* Navigation */
var(--nav-active-bg)        /* Active nav background */
var(--nav-active-text)      /* Active nav text */

/* Semantic */
var(--color-success) / var(--color-success-bg) / var(--color-success-text)
var(--color-warning) / var(--color-warning-bg) / var(--color-warning-text)
var(--color-error)   / var(--color-error-bg)   / var(--color-error-text)
var(--color-info)    / var(--color-info-bg)    / var(--color-info-text)

/* Shape */
var(--radius-md)            /* Buttons, inputs */
var(--radius-lg)            /* Cards, modals */
var(--shadow-sm)            /* Default elevation */

/* Typography */
var(--font-sans)            /* Inter — body */
var(--font-display)         /* Outfit — headings */
var(--font-mono)            /* JetBrains Mono — IDs */
```

---

*TransitOps Design System v2.1 — Enterprise B2B fleet operations platform*
