# TransitOps Backlog

**Last updated:** July 31, 2026  
**Scope:** Pending work only — original MVP phases (1–8) are complete.

This backlog is derived from `docs/audit-report.md`, `docs/prd.md`, and a live codebase review. Items already shipped recently (license cron mid-trip guard, ROI maintenance costs, Retire/Off Duty UX, React Hook Form + Zod) are **not** repeated here.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Broken user flows — fix before any demo or deploy |
| **P1** | Security / authorization — fix before production |
| **P2** | Data integrity & business logic correctness |
| **P3** | UX, accessibility, and frontend polish |
| **P4** | Testing, CI, and infrastructure |
| **P5** | Documentation alignment |
| **P6** | Future product enhancements (PRD Phase 9+) |

---

# P0 — Critical Bugs

## 1. Fix Password Reset HTTP Method Mismatch

### Priority
P0

### Problem
Frontend sends `PUT` to reset password; backend expects `POST`. Password reset is completely broken against a live API.

### Required Implementation
- Change `ResetPasswordPage.jsx` to use `api.post('/auth/reset-password/:token', ...)`
- Verify end-to-end with a real reset token

### Files Likely To Change
- `frontend/src/pages/auth/ResetPasswordPage.jsx`

### Acceptance Criteria
- User can set a new password via email link and log in with it

### Estimated Complexity
Small

---

## 2. Fix Demo / Mock Mode

### Priority
P0

### Problem
Two issues make offline demo mode unreliable:
1. Failed login (wrong password, 401) falls back to mock admin — masks real auth errors
2. `mockData.js` field names don't match API schemas — breaks Drivers, Maintenance, Finance, and Reports pages

### Required Implementation
1. Restrict mock fallback to network errors only (not 401/403/404)
2. Align mock schemas with real API responses:
   - `licenseExpiry` → `expiryDate`
   - `records` → `logs`; `type`/`estimatedCost` → `serviceType`/`cost`/`date`
   - `quantity` → `liters`; `description` → `notes`
   - Populate `trip` as object (not string ID)
   - Flatten Reports response shape to match `response.data.data`

### Files Likely To Change
- `frontend/src/services/api.js`
- `frontend/src/services/mockData.js`

### Acceptance Criteria
- Wrong password shows an error, not mock login
- All app pages render correctly when backend is unreachable

### Estimated Complexity
Medium

---

## 3. Transaction-Wrap Trip Dispatch

### Priority
P0

### Problem
Vehicle/driver availability checks and status updates are not atomic. Concurrent dispatches can double-book the same vehicle or driver.

### Required Implementation
1. Use MongoDB session/transaction in `tripService.dispatchTrip`
2. Re-check vehicle and driver availability inside the transaction before updating statuses
3. Add integration test for concurrent dispatch attempts

### Files Likely To Change
- `backend/services/tripService.js`
- `backend/tests/` (new trip dispatch test)

### Acceptance Criteria
- Two simultaneous dispatch requests for the same vehicle: one succeeds, one fails with a clear error

### Estimated Complexity
Medium

---

# P1 — Security & Authorization

## 4. RBAC on Dashboard and Reports

### Priority
P1

### Problem
Any authenticated user (including drivers) can access financial ROI data and fleet-wide KPIs.

### Required Implementation
- `GET /api/dashboard/stats` — restrict to `admin`, `fleet_manager`, `financial_analyst`
- `GET /api/reports/roi` and `/roi/download` — restrict to `admin`, `financial_analyst`
- Hide `/reports` nav item for unauthorized roles on frontend

### Files Likely To Change
- `backend/routes/dashboardRoutes.js`
- `backend/routes/reportRoutes.js`
- `frontend/src/layouts/AppLayout.jsx`

### Acceptance Criteria
- Driver role receives 403 on reports endpoints
- Dashboard accessible only to roles with operational oversight

### Estimated Complexity
Small

---

## 5. Block Admin Self-Registration

### Priority
P1

### Problem
`/api/auth/register` accepts `"admin"` as a role name. An attacker can queue admin accounts pending approval.

### Required Implementation
- Reject `admin` role in `authService.register` and/or `authValidator`
- Ensure register UI cannot submit admin role

### Files Likely To Change
- `backend/services/authService.js`
- `backend/validators/authValidator.js`

### Acceptance Criteria
- Registering with role `admin` returns 400 regardless of client

### Estimated Complexity
Small

---

## 6. Security Hardening Bundle

### Priority
P1

### Problem
Multiple medium-severity gaps: no rate limiting, no security headers, ReDoS via unescaped regex search, user enumeration on forgot-password, debug email logging.

### Required Implementation
1. Add `helmet` middleware
2. Add `express-rate-limit` on auth routes (login, register, forgot/reset password)
3. Escape special regex characters in search filters (vehicles, drivers, trips, maintenance)
4. Return generic 200 for forgot-password regardless of email existence
5. Remove debug logs from `authController.forgotPassword`
6. Add `FRONTEND_URL` to `.env.example` (auth uses it; example only has `CLIENT_URL`)

### Files Likely To Change
- `backend/server.js`
- `backend/controllers/authController.js`
- `backend/services/*Service.js` (search queries)
- `backend/.env.example`

### Acceptance Criteria
- Security headers present on API responses
- Auth endpoints rate-limited
- Regex search with `.*` does not hang the server
- Forgot-password response identical for valid and invalid emails

### Estimated Complexity
Medium

---

## 7. Session Invalidation on Password Reset

### Priority
P1

### Problem
`passwordUpdatedAt` exists on User but is not checked during authentication. Resetting a password does not invalidate existing sessions.

### Required Implementation
- On password reset, delete all refresh tokens for the user
- During `authenticate` middleware, reject tokens issued before `passwordUpdatedAt`

### Files Likely To Change
- `backend/services/authService.js`
- `backend/middlewares/authenticate.js`

### Acceptance Criteria
- After password reset, existing refresh tokens no longer work

### Estimated Complexity
Small

---

# P2 — Data Integrity & Business Logic

## 8. Roll Forward Vehicle Odometer on Trip Completion

### Priority
P2

### Problem
`completeTrip` records `actualDistance` on the trip but never updates `vehicle.odometer`.

### Required Implementation
- In `tripService.completeTrip`, add `actualDistance` to vehicle odometer (or set to completion reading if fuel log provides it)
- Validate odometer doesn't decrease

### Files Likely To Change
- `backend/services/tripService.js`

### Acceptance Criteria
- Completing a trip updates the vehicle's odometer reading

### Estimated Complexity
Small

---

## 9. Capture Revenue on Trip Completion

### Priority
P2

### Problem
ROI report only counts trips where `revenue` was set at creation. Trips completed without upfront revenue are excluded from financial reports.

### Required Implementation
- Option A: Add optional `revenue` field to complete-trip payload
- Option B: Prompt for revenue in the Complete Trip modal on frontend
- Update ROI aggregation to include completed-trip revenue regardless of when it was set

### Files Likely To Change
- `backend/services/tripService.js`
- `backend/validators/tripValidator.js`
- `frontend/src/pages/app/TripsPage.jsx`
- `backend/services/reportService.js`

### Acceptance Criteria
- Revenue entered at completion appears in ROI report

### Estimated Complexity
Medium

---

## 10. Set `closeDate` on Maintenance Completion

### Priority
P2

### Problem
`MaintenanceLog.closeDate` exists in schema but is never populated when status changes to Completed.

### Required Implementation
- Set `closeDate = new Date()` when maintenance log status transitions to Completed
- Clear or preserve on re-open if business rules allow

### Files Likely To Change
- `backend/services/maintenanceService.js`

### Acceptance Criteria
- Completed maintenance logs have a populated `closeDate`

### Estimated Complexity
Small

---

## 11. Validate Entity References on Trip Create

### Priority
P2

### Problem
Creating a trip with invalid vehicle/driver IDs succeeds but fails later at dispatch with confusing errors.

### Required Implementation
- Verify vehicle and driver exist and are in valid states at trip creation (or at minimum, that IDs exist)
- Return 404/400 with clear messages

### Files Likely To Change
- `backend/services/tripService.js`

### Acceptance Criteria
- Invalid vehicle/driver ID on create returns immediate validation error

### Estimated Complexity
Small

---

## 12. Prevent Manual Driver Status Override

### Priority
P2

### Problem
`PUT /api/drivers/:id` allows manually setting `status: "On Trip"` without an associated dispatched trip.

### Required Implementation
- Mirror vehicle status rules: block manual override of `On Trip` and `Suspended` (when set by cron)
- Only allow Safety Officer to set `Suspended` explicitly; system manages `On Trip`

### Files Likely To Change
- `backend/services/driverService.js`

### Acceptance Criteria
- Cannot manually set driver to On Trip via API

### Estimated Complexity
Small

---

## 13. Fix Pagination and ObjectId Error Handling

### Priority
P2

### Problem
- Vehicles/drivers pass raw query strings to `limit()` → NaN pagination
- Invalid MongoDB ObjectIds in `:id` params throw unhandled CastError → generic 500

### Required Implementation
1. Parse and validate `page`/`limit` with defaults in all list endpoints
2. Add CastError handler in `errorHandler.js` → return 400 Bad Request

### Files Likely To Change
- `backend/services/vehicleService.js`
- `backend/services/driverService.js`
- `backend/utils/errorHandler.js`

### Acceptance Criteria
- `?limit=abc` falls back to default limit, not NaN
- `GET /api/vehicles/notanid` returns 400, not 500

### Estimated Complexity
Small

---

## 14. Fix Seed Data Status Consistency

### Priority
P2

### Problem
Seeder creates trips with Dispatched/On Trip statuses without syncing linked vehicle and driver statuses.

### Required Implementation
- After seeding trips, update vehicle/driver statuses to match active trip assignments
- Align capacity unit messaging (dispatch says "tons", model uses kg)

### Files Likely To Change
- `backend/seeders/seed.js`
- `backend/services/tripService.js` (error message only)

### Acceptance Criteria
- Fresh seed: no vehicle marked Available while on a Dispatched trip

### Estimated Complexity
Small

---

# P3 — UX, Accessibility & Frontend Polish

## 15. Auth Flow UX Fixes

### Priority
P3

### Problem
- Post-login always redirects to `/dashboard` — ignores `state.from` saved by ProtectedRoute
- Register success doesn't mention pending admin approval
- 404 catch-all redirects to `/dashboard` — loses URL context

### Required Implementation
1. LoginPage: redirect to `location.state?.from?.pathname || '/dashboard'`
2. RegisterPage: show "Pending admin approval" success message
3. Add dedicated 404 page or preserve attempted URL in redirect

### Files Likely To Change
- `frontend/src/pages/auth/LoginPage.jsx`
- `frontend/src/pages/auth/RegisterPage.jsx`
- `frontend/src/App.jsx`

### Acceptance Criteria
- Deep-link to `/trips` → login → lands on `/trips`
- Register shows approval-pending messaging

### Estimated Complexity
Small

---

## 16. Modal Accessibility & Focus Trap

### Priority
P3

### Problem
Modal component lacks focus trap and `aria-labelledby` — flagged in redesign docs as high priority a11y gap.

### Required Implementation
- Trap focus inside open modal
- Return focus to trigger on close
- Wire `aria-labelledby` to modal title

### Files Likely To Change
- `frontend/src/components/ui/Modal.jsx`

### Acceptance Criteria
- Tab key cycles within modal only
- Screen reader announces modal title

### Estimated Complexity
Medium

---

## 17. Frontend Consistency Pass

### Priority
P3

### Problem
Multiple UI inconsistencies across app pages.

### Required Implementation
1. Add search debouncing (300ms) on Vehicles, Drivers, Trips, Maintenance
2. Replace `window.confirm` delete in FinancePage with confirm Modal
3. Fix invalid `Badge variant="outline"` — add variant or use existing
4. Adopt shared `EmptyState` component instead of inline empty states
5. Extend Skeleton loading to list pages (currently spinners only)
6. Remove hardcoded default password display on UsersPage edit UI

### Files Likely To Change
- `frontend/src/pages/app/*.jsx`
- `frontend/src/components/ui/Badge.jsx`
- `frontend/src/hooks/useDebounce.js` (new)

### Acceptance Criteria
- Search doesn't refetch on every keystroke
- Finance delete uses same modal pattern as other pages

### Estimated Complexity
Medium

---

## 18. Remove Dev-Only Routes Before Production

### Priority
P3

### Problem
`/dev/components` is publicly accessible. `PlaceholderPage.jsx` is dead code.

### Required Implementation
- Gate `/dev/components` behind `import.meta.env.DEV` or remove route
- Delete unused `PlaceholderPage.jsx`

### Files Likely To Change
- `frontend/src/App.jsx`
- Delete `frontend/src/components/PlaceholderPage.jsx`

### Acceptance Criteria
- Dev components page unreachable in production build

### Estimated Complexity
Small

---

# P4 — Testing, CI & Infrastructure

## 19. Expand Backend Test Coverage

### Priority
P4

### Problem
Only `rbac.test.js` exists with mocked controllers. Trip business rules, ROI math, auth flows, and pagination are untested.

### Required Implementation
1. Integration tests for trip dispatch rules (9+ validations)
2. Unit tests for ROI calculation in `reportService`
3. Auth flow tests (register, login, refresh, reset password)
4. Transaction/concurrency test for dispatch

### Files Likely To Change
- `backend/tests/trip.test.js` (new)
- `backend/tests/report.test.js` (new)
- `backend/tests/auth.test.js` (new)

### Acceptance Criteria
- CI runs ≥3 test suites covering core business logic

### Estimated Complexity
Large

---

## 20. Production Infrastructure

### Priority
P4

### Problem
No deployment config, health checks, graceful shutdown, or startup env validation.

### Required Implementation
1. `docker-compose.yml` for MongoDB + backend + frontend
2. `GET /api/health` readiness endpoint (DB ping)
3. SIGTERM handler for graceful shutdown
4. Startup validation: fail fast if `JWT_SECRET` is placeholder or `MONGO_URI` missing
5. Frontend test setup (Vitest + React Testing Library) with smoke tests for auth and routing

### Files Likely To Change
- `docker-compose.yml` (new)
- `backend/Dockerfile` (new)
- `backend/server.js`
- `frontend/vite.config.js`
- `.github/workflows/ci.yml`

### Acceptance Criteria
- `docker compose up` starts full stack locally
- Health endpoint returns 503 when DB is down

### Estimated Complexity
Large

---

## 21. Audit Log Read API & Admin UI

### Priority
P4

### Problem
Audit logs are written on mutations but there is no API or UI to query them.

### Required Implementation
1. `GET /api/audit-logs` with pagination, filter by user/action/date (admin only)
2. Admin audit log viewer page or section in UsersPage

### Files Likely To Change
- `backend/controllers/auditController.js` (new)
- `backend/routes/auditRoutes.js` (new)
- `frontend/src/pages/app/` (new or extend UsersPage)

### Acceptance Criteria
- Admin can view recent mutation audit trail

### Estimated Complexity
Medium

---

# 5. Documentation Sync

## 22. Align Stale Documentation

### Priority
P5

### Status
**Complete** (July 31, 2026)

### What was synced
- `readme.md` — credentials, stack versions, doc index, MVP status
- `technical.md` — Phases 1–8, routing, API routes, RHF/Zod, env vars
- `Engineering.md`, `Product.md`, `Database.md` — rewritten to current state
- `validation.md`, `mock_data.md`, `audit-report.md`, `frontend-redesign.md`, `prd.md`
- `backend/.env.example` — added `FRONTEND_URL`

---

# P6 — Future Enhancements (PRD Phase 9+)

These are product expansions, not blockers for MVP/demo readiness.

| # | Feature | Notes |
|---|---------|-------|
| 23 | **PDF export** for reports | PRD Phase 8 bonus |
| 24 | **License expiry email reminders** | Cron suspends; no proactive notification |
| 25 | **Notifications collection & in-app alerts** | Expiring licenses, maintenance due, trip delays |
| 26 | **User ↔ Driver record linking** | Connect auth users to driver profiles |
| 27 | **Vehicle document uploads** | Registration, insurance, inspection certs |
| 28 | **Recurring maintenance schedules** | Odometer/time-based service reminders |
| 29 | **Receipt image uploads** | Fuel and expense attachments |
| 30 | **Refresh token rotation** | Security enhancement beyond MVP |
| 31 | **RBAC permissions array enforcement** | Use `Role.permissions` instead of hardcoded role names |
| 32 | **Live GPS / route optimization** | PRD future |
| 33 | **Mobile driver app** | PRD future |
| 34 | **AI cost forecasting** | PRD future |

---

## Recommended Sprint Order

| Sprint | Items | Goal |
|--------|-------|------|
| **Sprint 1** | #1, #2, #4, #5, #6 | Demo-ready: auth works, security baseline |
| **Sprint 2** | #3, #8, #9, #10, #13 | Data integrity: trips and reports trustworthy |
| **Sprint 3** | #11, #12, #14, #15, #17 | Polish and consistency |
| **Sprint 4** | #19, #20, #21, #22 | Production path: tests, Docker, docs |
| **Backlog** | #6–7, #16, #18, P6 items | As capacity allows |

---

## Summary

| Area | Open Items | Highest Priority |
|------|------------|------------------|
| Critical bugs | 3 | Password reset, mock mode, dispatch race |
| Security | 4 | RBAC on financial endpoints, registration hardening |
| Data integrity | 7 | Odometer, revenue, validation gaps |
| UX / Frontend | 4 | Auth redirects, a11y, consistency |
| Testing / DevOps | 3 | Test coverage, Docker, health checks |
| Documentation | 0 | ✅ Synced Jul 31, 2026 |
| Future product | 12 | Post-MVP enhancements |

**Bottom line:** MVP features are done. The path to demo-ready is Sprint 1 (P0 + core P1). The path to production-ready adds Sprints 2–4.
