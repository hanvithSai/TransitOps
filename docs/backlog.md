# TransitOps Backlog

**Last updated:** July 31, 2026 (post frontend UX polish · redesign doc consolidated)  
**Scope:** Remaining post-MVP work after P6 implementation and cloud deployment.

**Recently shipped (P6 batch):** PDF ROI export, license expiry email reminders + in-app notifications, user↔driver linking, recurring maintenance schedules, RBAC `permissions` array enforcement, API rate limiting, account lockout, refresh token cap, notification bell UI, Trips EmptyState, mobile vehicle cards, `useEntityList` hook.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P6** | Future product enhancements (PRD Phase 9+) |

---

# P6 — Remaining (needs human / external services)

| # | Feature | Notes |
|---|---------|-------|
| 5 | **Vehicle document uploads** | Needs file storage (S3/local policy) |
| 7 | **Receipt image uploads** | Needs file storage |
| 12 | **Live GPS / route optimization** | External maps/GPS APIs |
| 13 | **Mobile driver app** | Separate client |
| 14 | **AI cost forecasting** | ML / external API |

---

## Optional Polish (non-blocking)

| Item | Notes |
|------|-------|
| Adopt `useEntityList` across all CRUD pages | Hook added; refactor pages incrementally |
| Mobile card fallback on remaining tables | Vehicles done; Drivers, Users, Finance, Reports pending |
| Dark mode semantic colors on all pages | Tokens exist; migrate hardcoded Tailwind |
| Extract shared CRUD hooks | Reduce 400–700 line page files |
| Expand Vitest coverage | Beyond `ProtectedRoute` smoke tests |
| Wire remember-me or remove checkbox | Login checkbox is decorative |
| Monospace font for registration numbers / IDs | Optional typography polish |

**Recently completed (frontend UX):** SearchableSelectField on vehicle/driver/trip pickers · Maintenance workspace redesign · Trips KPI alignment with other pages · Hamburger menu mobile-only · ESLint unused-import fixes for CI

---

## Summary

| Area | Status |
|------|--------|
| MVP (Phases 1–8) | ✅ Complete |
| P0–P4 hardening | ✅ Complete |
| P6 automatable batch | ✅ Complete |
| Cloud deployment (Vercel + Render + Atlas) | ✅ Live — `docs/deployment.md` |
| P6 external/deferred | 5 items |

**Bottom line:** Core P6 and deployment are complete. Remaining items need file storage, GPS, mobile app, or AI services.
