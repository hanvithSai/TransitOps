# TransitOps Repository Audit Report

**Date:** July 30, 2026  
**Scope:** Full repository review — backend, frontend, documentation, infrastructure

---

## Executive Summary

**TransitOps** is a fleet operations platform built for the ODOO Hiring Hackathon. It replaces spreadsheet-based transport management with a centralized system for vehicles, drivers, trips, maintenance, fuel/expenses, and financial reporting.

The codebase is **substantially complete for an MVP** — Phases 1–8 from the PRD are largely implemented, including auth/RBAC, full CRUD modules, trip dispatch with business rules, dashboard KPIs, ROI reports with CSV export, license-expiry cron, audit logging, and a polished frontend redesign.

However, there are **meaningful bugs, security gaps, data-consistency issues, and documentation drift** that should be addressed before treating this as production-ready.

---

## 1. Use Case & Problem Being Solved

### Business Problem

Organizations running fleet operations on spreadsheets face:

- No enforcement of dispatch rules (vehicle availability, driver license validity, cargo capacity)
- No real-time fleet visibility
- Fragmented cost tracking across fuel, maintenance, tolls, and trips
- No ROI visibility per vehicle

### Target Users & Roles

| Role | Primary Responsibilities |
|------|-------------------------|
| **Admin** | User management, full system access |
| **Fleet Manager** | Vehicles, maintenance, trip completion |
| **Driver** | Trip creation, dispatch, fuel/expense viewing |
| **Safety Officer** | Driver management, compliance |
| **Financial Analyst** | Fuel, expenses, ROI reports |

### Core Workflows

1. Register vehicles and drivers with status tracking
2. Create trip drafts → dispatch (with 9+ validation rules) → complete/cancel
3. Log maintenance (auto-syncs vehicle to "In Shop")
4. Record fuel and expenses linked to vehicles/trips
5. View dashboard KPIs and export ROI reports

---

## 2. Architecture Overview

```
┌─────────────┐     REST/JSON      ┌──────────────────────────────────┐
│  React SPA  │ ◄────────────────► │  Express 5 API                   │
│  (Vite 8)   │   JWT + cookies    │  routes → controllers → services │
└─────────────┘                    └──────────────┬───────────────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────┐
                                       │  MongoDB         │
                                       │  (Mongoose 9)    │
                                       └──────────────────┘
```

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 8, Tailwind v4, React Router v7, Recharts, Axios |
| Backend | Node.js, Express 5, Mongoose 9 |
| Auth | JWT access tokens + httpOnly refresh cookies, bcrypt (12 rounds) |
| Automation | `node-cron` — daily license expiry suspension (IST) |
| Email | `nodemailer` — password reset only |
| CI | GitHub Actions — backend tests, frontend lint + build |
| Deployment | **None** — no Docker, K8s, or cloud config |

### Repository Structure

```
TransitOps/
├── readme.md
├── backend/                     # Express REST API
│   ├── config/db.js
│   ├── controllers/             # auth, users, vehicles, drivers, trips, maintenance, fuel, expenses, dashboard, reports
│   ├── middlewares/             # authenticate, authorize, auditMiddleware
│   ├── models/                  # User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, AuditLog, RefreshToken
│   ├── routes/                  # All /api/* route modules
│   ├── services/                # Business logic layer
│   ├── validators/              # express-validator rules
│   ├── utils/                   # errorHandler, cronJobs, sendEmail
│   ├── seeders/seed.js          # Roles + admin + mock Indian fleet data
│   └── tests/rbac.test.js       # RBAC integration tests
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/            # Login, Register, Forgot/Reset Password
│   │   │   └── app/             # Dashboard, Vehicles, Drivers, Trips, Maintenance, Finance, Reports, Users
│   │   ├── components/ui/       # Button, Card, Modal, Table, Toast, Skeleton, etc.
│   │   ├── layouts/AppLayout.jsx
│   │   ├── contexts/AuthContext.jsx
│   │   └── services/api.js + mockData.js
│   └── vite.config.js
├── docs/                        # Project documentation
└── .github/workflows/ci.yml     # CI pipeline
```

---

## 3. Implementation Status

### Fully Implemented

| Module | Backend | Frontend | Notes |
|--------|---------|----------|-------|
| Auth & RBAC | ✅ | ✅ | Login, register, refresh, logout, forgot/reset password |
| User Management | ✅ | ✅ | Admin CRUD, role assignment, active toggle |
| Vehicle Registry | ✅ | ✅ | CRUD, search, status, delete protection |
| Driver Management | ✅ | ✅ | CRUD, expiry warnings, cron suspension |
| Trip Engine | ✅ | ✅ | Draft → Dispatched → Completed/Cancelled with business rules |
| Maintenance | ✅ | ✅ | Vehicle status sync (In Shop ↔ Available) |
| Fuel & Expenses | ✅ | ✅ | Tabbed Finance page |
| Dashboard KPIs | ✅ | ✅ | 10 KPI cards + 4 Recharts charts |
| Reports & CSV | ✅ | ✅ | Per-vehicle ROI + fleet metrics |
| Audit Logging | ✅ (write-only) | — | Middleware logs mutations; no read API |
| Marketing Landing | — | ✅ | Full landing page with theme toggle |
| Design System v2.1 | — | ✅ | Tokens, UI primitives, app shell |

### Partially Implemented

| Feature | Status | Gap |
|---------|--------|-----|
| RBAC permissions array | Stored in DB | Never enforced — only role names checked |
| Demo/mock mode | Frontend fallback | Schema mismatches break several pages |
| Password reset emails | Backend works | Uses `CLIENT_URL` for reset links |
| Dark mode | Landing + app shell | Inconsistent across all pages |
| Audit logs | Written on mutations | No admin UI or API to query them |
| License expiry cron | Suspends drivers | No email notifications; can suspend mid-trip |

### Not Implemented (PRD / Future)

| Feature | PRD Reference |
|---------|---------------|
| PDF export | Phase 8 bonus |
| Vehicle documents upload | Future |
| License expiry email reminders | Future |
| Notifications collection | Future |
| User ↔ Driver record linking | Implied but missing |
| Live GPS / route optimization | Future |
| Mobile app | Future |
| AI forecasting | Future |
| Production deployment config | Missing entirely |
| Frontend tests | CI only lints + builds |

### PRD Phase Roadmap vs. Code

| Phase | Module | Docs Status | Actual Code Status |
|-------|--------|-------------|---------------------|
| 1 | Auth & RBAC | Complete | **Complete** |
| 2 | Vehicle Registry | Complete | **Complete** |
| 3 | Driver Management | Complete | **Complete** |
| 4 | Trip Engine | Complete | **Complete** |
| 5 | Maintenance | Complete | **Complete** |
| 6 | Fuel & Expenses | Complete | **Complete** |
| 7 | Dashboard KPIs | Pending in docs | **Implemented** |
| 8 | Reports & CSV | Pending in docs | **Implemented** |

---

## 4. Critical Bugs (Fix First)

### P0 — Broken Flows

#### 1. Password reset HTTP method mismatch — **FIXED**

Frontend now sends `POST` to match the backend route.

- **Frontend:** `frontend/src/pages/auth/ResetPasswordPage.jsx` — `api.post('/auth/reset-password/:token', ...)`
- **Backend:** `backend/routes/authRoutes.js` — `router.post('/reset-password/:token', ...)`

#### 2. Mock login bypasses credential validation — **FIXED**

Failed login responses (401 wrong password, inactive user) now propagate to the UI instead of falling back to a mock admin session.

#### 3. Auth mutations fake success in demo mode — **FIXED**

Register, login, forgot-password, reset-password, and other `/auth/*` requests no longer receive mock `{ success: true }` responses when the backend is unreachable or returns 5xx. Auth errors surface to the UI instead.

#### 4. Forgot-password silent failure without SMTP — **FIXED**

Production now requires SMTP configuration and throws a clear error if missing. In development without SMTP, Ethereal test mail is used and the API returns a `previewUrl` link shown on the forgot-password page.

#### 5. Mock data schema mismatches break demo mode

| Mock field | App expects | Affected page |
|------------|-------------|---------------|
| `licenseExpiry` | `expiryDate` | Drivers — expiry dates blank |
| `records` | `logs` | Maintenance — empty table |
| `type`, `estimatedCost` | `serviceType`, `cost`, `date` | Maintenance — wrong fields |
| `quantity` | `liters` | Finance — shows `undefined L` |
| `description` | `notes` | Expenses — empty notes column |
| `trip: "t1"` (string) | populated object | Finance — crash on `.source` access |
| Nested `{ data: { data, metrics } }` | flat `response.data.data` | Reports — wrong table data |

#### 6. Race condition on trip dispatch

Vehicle/driver availability checks and status updates are **not wrapped in a MongoDB transaction**. Two concurrent dispatches can double-book the same vehicle or driver.

---

### P1 — Security Issues

| Issue | Severity | Details |
|-------|----------|---------|
| **Admin role on public registration** | High | ~~`/api/auth/register` accepts `"admin"`~~ **FIXED** — admin role rejected with 403 |
| **Dashboard/reports lack RBAC** | High | ~~Any authenticated user can access financial ROI data~~ **FIXED** — `authorize()` on dashboard + reports routes |
| **User enumeration on forgot-password** | Medium | ~~Returns 404 when email not found~~ **FIXED** — always 200 with generic message |
| **No rate limiting** | Medium | ~~Login, register, forgot-password unprotected~~ **FIXED** — `authLimiter` on `/api/auth/*` |
| **No security headers** | Medium | ~~No `helmet` middleware~~ **FIXED** — `helmet()` in `server.js` |
| **Debug logging in production code** | Medium | `authController.forgotPassword` logs raw email addresses |
| **ReDoS via unescaped `$regex`** | Medium | ~~Search filters pass raw user input into regex~~ **FIXED** — `escapeRegex()` on vehicle, driver, trip, maintenance search |
| **Refresh tokens never rotate** | Low | Same token reused; no per-user token limit |
| **Password reset doesn't invalidate sessions** | Low | `passwordUpdatedAt` exists but isn't checked during auth |

---

### P2 — Logic & Data Consistency Bugs

| Bug | Impact |
|-----|--------|
| **`completeTrip` doesn't update vehicle odometer** | `actualDistance` recorded on trip but never rolls forward `vehicle.odometer` |
| **Revenue never set on completion** | ROI report filters `revenue: { $ne: null }` — trips completed without upfront revenue excluded from ROI |
| **ROI excludes maintenance log costs** | Only Expense + FuelLog counted; `MaintenanceLog.cost` ignored despite dashboard tracking maintenance separately |
| **`closeDate` never set on maintenance completion** | Field exists in schema but `maintenanceService.updateLog` never populates it |
| **Cron auto-suspends drivers mid-trip** | License expiry job sets status to Suspended without checking active Dispatched trips |
| **Driver status can be manually overridden** | PUT `/api/drivers/:id` allows setting `status: "On Trip"` without an actual trip |
| **Trip create doesn't verify vehicle/driver exist** | Invalid IDs create orphan references; fails later at dispatch with confusing errors |
| **Seed data inconsistency** | Seeds trips with Dispatched/On Trip statuses without syncing vehicle/driver statuses |
| **Capacity unit confusion** | Dispatch error says "tons" but seed/model treat capacity as raw number |
| **Invalid ObjectId → generic 500** | CastError for bad `:id` params not handled |
| **Pagination NaN** | Users parse ints; vehicles/drivers pass raw query strings → `limit(undefined)` = NaN |

---

## 5. Frontend Issues

### Routing Map

| Path | Component | Status |
|------|-----------|--------|
| `/` | LandingPage | Implemented |
| `/login`, `/register`, `/forgot-password`, `/reset-password/:token` | Auth pages | Implemented |
| `/dashboard` | DashboardPage | Implemented |
| `/vehicles` | VehiclesPage | Implemented |
| `/drivers` | DriversPage | Implemented |
| `/trips` | TripsPage | Implemented |
| `/maintenance` | MaintenancePage | Implemented |
| `/fuel`, `/expenses` | FinancePage (tabbed) | Implemented |
| `/reports` | ReportsPage | Implemented |
| `/users` | UsersPage | Implemented |
| `/dev/components` | DevComponentsPage | Public — remove before production |
| `*` (404) | Redirect to `/dashboard` | Loses URL context |

### Routing & Auth Issues

- **404 catch-all** redirects to `/dashboard` — loses URL context
- **No post-login redirect** — `ProtectedRoute` saves `state.from` but `LoginPage` always goes to `/dashboard`
- **Register success omits pending-approval message** — **FIXED** (`RegisterPage` shows backend message)
- **Auth validation errors show generic "Validation failed"** — **FIXED** (`getApiErrorMessage` surfaces field errors; register validates min 6 chars client-side)
- **CORS blocks frontend when Vite uses non-5173 port** — **FIXED** (dev allows any localhost port)

### Auth Logic & Data Consistency — **FIXED**

| Issue | Fix |
|-------|-----|
| Stale role in AuthContext after admin changes | User synced on token refresh + window focus via `/auth/me` |
| Admin create had no `isActive` control | UsersPage create form includes active toggle; backend accepts `isActive` |
| Register returned unpopulated role | `authService.register` returns populated role object |
| User delete left orphaned refresh tokens | `RefreshToken.deleteMany` on delete; revoke on deactivate |
| `CLIENT_URL` vs `FRONTEND_URL` mismatch | Unified on `CLIENT_URL`; removed unused `JWT_REFRESH_SECRET` from `.env.example` |
| Password length inconsistent across forms | Aligned to min 6 chars on backend validators and frontend auth/admin forms |
- **`/dev/components` route is public** — should be removed before production

### UX / Accessibility

- **Modal lacks focus trap** — keyboard/a11y gap flagged in redesign docs
- **No search debouncing** — refetches on every keystroke across Vehicles, Drivers, Trips, Maintenance
- **Badge `variant="outline"` invalid** — used in FinancePage + MaintenancePage; falls back to gray
- **`EmptyState` component built but never used** — pages use ad-hoc inline empty states
- **Skeleton loading inconsistent** — only Dashboard KPIs + Reports; other pages use spinners
- **Finance delete uses `window.confirm`** instead of confirm Modal pattern
- **UsersPage hardcodes default password** `TransitOps2026!` in edit UI

### Dead Code

- `PlaceholderPage.jsx` — not routed anywhere
- `components/domain/` — empty
- `components/charts/` — empty
- `hooks/` — empty (`.gitkeep` only)

---

## 6. Backend Issues

### API Design

- **Inconsistent validation error format** — auth returns `{ errors: [...] }`, others throw joined string messages
- **Report/dashboard errors lose detail** — controllers always return generic 500 messages, discarding root cause
- **`fleet_manager` excluded from trip creation** — can complete trips but not create/dispatch/cancel (may be intentional but surprising)
- **Hard deletes everywhere** — no soft delete despite README claiming "soft deletion (retirement)" for vehicles
- **`JWT_REFRESH_SECRET` env var unused** — refresh tokens are random bytes, not JWTs
- **`CLIENT_URL` vs `FRONTEND_URL` mismatch** — `.env.example` has `CLIENT_URL`; auth controller uses `FRONTEND_URL` for reset links

### RBAC Gaps

| Route | Current | Expected |
|-------|---------|----------|
| `GET /api/dashboard/stats` | ~~Any authenticated user~~ **FIXED** — all app roles via `authorize()` | Matches frontend nav |
| `GET /api/reports/roi` | ~~Any authenticated user~~ **FIXED** | admin + financial_analyst + fleet_manager |
| `GET /api/reports/roi/download` | ~~Any authenticated user~~ **FIXED** | admin + financial_analyst + fleet_manager |

**Permissions array never enforced:** `Role.permissions` is populated and returned to clients but `authorize` middleware ignores it entirely.

### Testing Gaps

- **Single test file** — `tests/rbac.test.js` only; mocks auth/controllers/models
- **Not tested:** auth flows, trip business rules, maintenance sync, ROI math, pagination, validation, DB integration, dashboard, reports, cron
- **Trip RBAC tests absent** — trips route mounted but never tested in test file
- **Tests may fail locally** due to Watchman issue (may pass in CI on Ubuntu)

---

## 7. Documentation Drift

| Document | Says | Reality |
|----------|------|---------|
| `technical.md` | Phases 7–8 pending | **Implemented** in code |
| `backlog.md` | Cron, delete protection, dashboard, reports missing | **All implemented** |
| `validation.md` | Password reset missing | **Exists** in authService + frontend |
| `readme.md` | Admin password `Admin@123` | Seeder uses `Password@123` |
| `technical.md` | Admin password `Admin@123` | Seeder uses `Password@123` |
| `readme.md` | "Soft deletion (retirement)" | Vehicles use status `Retired`, but DELETE is hard delete with association check |
| Docs mention `json2csv` | Library for CSV | Hand-rolled CSV in `reportService.js` |

### Demo Credentials (actual seeder values)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@transitops.com` | `Password@123` |
| Fleet Manager | `manager@transitops.com` | `Password@123` |
| Driver | `driver@transitops.com` | `Password@123` |
| Safety Officer | `safety@transitops.com` | `Password@123` |
| Financial Analyst | `finance@transitops.com` | `Password@123` |

---

## 8. Infrastructure & DevOps Gaps

| Gap | Impact |
|-----|--------|
| No Docker / docker-compose | Manual setup only |
| No health/readiness endpoint | Only `GET /` returns a message |
| No graceful shutdown | Server doesn't handle SIGTERM |
| No API versioning | Breaking changes would affect all clients |
| No startup env validation | Server starts with placeholder JWT secrets |
| Frontend has zero tests | CI only lints + builds |
| Seeder wipes all data | Dangerous if run against production |

---

## 9. Recommended Fix Priority

### Immediate (before demo/production)

1. ~~Fix reset-password HTTP method (`PUT` → `POST`)~~ **Done**
2. ~~Add RBAC to `/api/dashboard/stats` and `/api/reports/*`~~ **Done**
3. ~~Blocklist `admin` role on public registration~~ **Done**
4. Align mock data schemas with real API responses
5. Restrict login mock fallback to network errors only (not 401)
6. Remove debug logs from `authController.forgotPassword`
7. ~~Add `FRONTEND_URL` to `.env.example` (or unify with `CLIENT_URL`)~~ **Done**

### Short-term (data integrity)

8. Wrap trip dispatch in MongoDB transaction
9. Update vehicle odometer on trip completion
10. Include maintenance costs in ROI calculation
11. Set `closeDate` when maintenance log is completed
12. Check active trips before cron-suspending drivers
13. ~~Escape user input in `$regex` search queries~~ **Done**
14. Handle CastError for invalid ObjectIds

### Medium-term (quality & security)

15. ~~Add rate limiting + helmet~~ **Done** (auth rate limit + helmet; forgot-password enumeration fixed)
16. Implement refresh token rotation
17. Invalidate sessions on password reset
18. Add audit log read API for admins
19. Expand test coverage (trip rules, ROI math, auth flows)
20. Remove `/dev/components` route
21. Adopt `EmptyState`, fix Badge variants, add modal focus trap
22. Add search debouncing
23. Update stale documentation

### Long-term (PRD future items)

24. PDF export
25. License expiry email notifications
26. User ↔ Driver record linking
27. Docker/deployment config
28. Frontend test suite

---

## 10. What's Working Well

Despite the issues above, several areas are solid:

- **Clean layered architecture** — routes → controllers → services → models with consistent patterns
- **Trip dispatch business rules** — 9 validation rules well-implemented in `tripService.js`
- **Maintenance ↔ vehicle status coupling** — opening/closing logs correctly syncs vehicle status
- **Admin safeguards** — can't delete/modify the last active admin
- **JWT + httpOnly refresh cookie auth** — proper token flow with refresh queue on frontend
- **Comprehensive seeder** — realistic Indian fleet data (20 vehicles, 25 drivers, 60 trips)
- **Design system v2.1** — polished UI with tokens, components, dark mode, marketing site
- **RBAC on core CRUD** — 7 of 11 route modules have role checks (tested in CI)
- **Delete protection** — vehicles/drivers blocked if associated records exist

---

## Summary Scorecard

| Area | Score | Notes |
|------|-------|-------|
| Feature completeness | **85%** | All PRD phases done; future items pending |
| Code quality | **75%** | Clean architecture; some inconsistencies |
| Security | **60%** | Auth works; RBAC gaps, no rate limiting |
| Data integrity | **65%** | Business rules good; race conditions, ROI gaps |
| Frontend UX | **80%** | Polished UI; mock mode broken, a11y gaps |
| Testing | **30%** | RBAC mocks only; no integration or frontend tests |
| Documentation | **55%** | Comprehensive but stale in several places |
| DevOps | **40%** | CI only; no deployment config |

---

## Bottom Line

TransitOps is a strong hackathon MVP with a complete feature set and polished UI. The main risks for production are the broken password reset, misleading demo mode, RBAC gaps on financial endpoints, and data-consistency bugs in trip completion and ROI reporting. Fixing the P0/P1 items above would bring it to a demo-ready state; the medium-term items would make it production-viable.
