# Product Documentation

**Last updated:** July 31, 2026  
**MVP status:** Phases 1–8 complete

## Product Features

| Feature | Status | Notes |
|---------|--------|-------|
| Driver Management | ✅ | CRUD, expiry warnings, daily cron suspension |
| Vehicle Management | ✅ | CRUD, Retire action, delete protection |
| Trip Dispatch & Tracking | ✅ | Draft → Dispatched → Completed/Cancelled with 9+ business rules |
| Maintenance Workflow | ✅ | Auto-syncs vehicle to In Shop / Available |
| Fuel & Expenses | ✅ | Tabbed Finance page, linked to vehicles/trips |
| Dashboard & Analytics | ✅ | Live KPIs + Recharts trend charts |
| Reports & CSV Export | ✅ | Per-vehicle ROI including fuel, expenses, and maintenance |
| User Management | ✅ | Admin CRUD, role assignment, approval workflow |
| Audit Logging | ⚠️ Partial | Written on mutations; no admin read UI yet |

## User Stories

* **Fleet Manager:** "As a fleet manager, I want to see a dashboard with fleet utilization so I can optimize my resources." — **Done** (`/dashboard`)
* **Safety Officer:** "As a safety officer, I want the system to automatically suspend drivers with expired licenses so we remain compliant." — **Done** (daily cron + dispatch validation)
* **Finance Analyst:** "As a finance analyst, I want to export cost and revenue reports to CSV so I can calculate ROI per vehicle." — **Done** (`/reports`)
* **Driver:** "As a driver, I want to create and dispatch trips and view fuel/expense records." — **Partial** (trip create/dispatch; no dedicated driver mobile view)

## User Experience (UX)

* **Design system v2.1:** Tokens, UI primitives, dark mode, marketing landing page
* **Role-based views:** Nav and routes filtered by role; some backend endpoints still need RBAC hardening (see `backlog.md`)
* **Interactive analytics:** Recharts on dashboard; ROI summary cards on reports
* **Defensive deletion:** Delete blocked when history exists; Retire (vehicles) and Set Off Duty (drivers) offered as alternatives
* **Form validation:** React Hook Form + Zod on all major CRUD forms
* **Feedback patterns:** Toast notifications, confirm modals for destructive actions

## Future Enhancements

Tracked in `docs/backlog.md` (P6) and `docs/prd.md` §14:

* PDF export, license expiry email reminders, in-app notifications
* User ↔ Driver profile linking, vehicle document uploads
* Live GPS, route optimization, mobile driver app, AI forecasting
