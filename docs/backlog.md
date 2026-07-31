# TransitOps Backlog

**Last updated:** July 31, 2026 (P4 complete · CI green)  
**Scope:** Pending work only — MVP Phases 1–8 and production hardening (P0–P4) are complete.

**Recently shipped:** EmptyState on Maintenance, driver `Suspended` restricted to safety officers, expanded Jest coverage (8 suites / 53 tests), Docker Compose with MongoDB replica set, `/api/health`, SIGTERM graceful shutdown, env validation, Vitest + RTL smoke tests, audit log read API + admin UI tab, ESLint fixes restoring green CI on `main`.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P6** | Future product enhancements (PRD Phase 9+) |

---

# P6 — Future Enhancements (PRD Phase 9+)

| # | Feature | Notes |
|---|---------|-------|
| 1 | **PDF export** for reports | PRD Phase 8 bonus |
| 2 | **License expiry email reminders** | Cron suspends; no proactive notification |
| 3 | **Notifications collection & in-app alerts** | Expiring licenses, maintenance due |
| 4 | **User ↔ Driver record linking** | Connect auth users to driver profiles |
| 5 | **Vehicle document uploads** | Registration, insurance, inspection |
| 6 | **Recurring maintenance schedules** | Odometer/time-based reminders |
| 7 | **Receipt image uploads** | Fuel and expense attachments |
| 8 | **RBAC permissions array enforcement** | Use `Role.permissions` vs hardcoded roles |
| 9 | **Per-user refresh token cap** | Limit active sessions |
| 10 | **Rate limiting on non-auth routes** | Broader API protection |
| 11 | **Account lockout** | After N failed login attempts |
| 12 | **Live GPS / route optimization** | PRD future |
| 13 | **Mobile driver app** | PRD future |
| 14 | **AI cost forecasting** | PRD future |

---

## Optional Polish (non-blocking)

| Item | Notes |
|------|-------|
| Extract shared CRUD hooks | Reduce page duplication |
| Mobile card fallback for tables | Better small-screen list UX |
| Wire remember-me or remove checkbox | Login page cleanup |
| EmptyState on Trips list | Already on Vehicles, Drivers, Maintenance, Finance |
| Dark mode semantic colors | Success/warning tokens |

---

## Summary

| Area | Status |
|------|--------|
| MVP (Phases 1–8) | ✅ Complete |
| P0–P3 hardening | ✅ Complete |
| P4 (tests, Docker, audit UI) | ✅ Complete |
| P6 future product | 14 items in backlog |

**Bottom line:** The codebase is **production-ready** for demo/deploy with `docker compose up`. Remaining work is post-MVP product features (P6).
