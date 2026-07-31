# Database Documentation

**Last updated:** July 31, 2026 (production · Atlas database `transitops`)

## Collections

| Collection | Model | Purpose |
|------------|-------|---------|
| `users` | User | Accounts, hashed passwords, roles, active flag |
| `roles` | Role | RBAC roles with permissions array |
| `refreshtokens` | RefreshToken | HttpOnly refresh token storage (TTL index) |
| `vehicles` | Vehicle | Fleet registry — capacity (kg), odometer, status |
| `drivers` | Driver | License details, expiry, safety score, status |
| `trips` | Trip | Dispatch lifecycle, revenue, distances, fuel |
| `maintenancelogs` | MaintenanceLog | Service records linked to vehicles |
| `fuellogs` | FuelLog | Fuel purchases per vehicle/trip |
| `expenses` | Expense | Operational costs (Toll, Repair, etc.) |
| `auditlogs` | AuditLog | Mutation audit trail; admin read via `GET /api/audit-logs` |

## Status Enums

| Entity | Valid statuses |
|--------|----------------|
| Vehicle | `Available`, `On Trip`, `In Shop`, `Retired` |
| Driver | `Available`, `On Trip`, `Off Duty`, `Suspended` |
| Trip | `Draft`, `Dispatched`, `Completed`, `Cancelled` |
| MaintenanceLog | `Active`, `Completed` |

## Constraints

* **Unique:** `User.email`, `Vehicle.registrationNumber`, `Driver.licenseNumber`
* **Numeric bounds:** `Vehicle.capacity` > 0; `Trip.cargoWeight` ≥ 0; expense/fuel amounts > 0
* **Delete protection:** Vehicles and drivers with associated records cannot be hard-deleted (409 Conflict); use Retired / Off Duty instead
* **Referential integrity:** Trip dispatch validates vehicle/driver availability and license expiry at runtime

## Indexes

### Trip (`Trip.js`)

| Index | Purpose |
|-------|---------|
| `{ vehicle: 1, status: 1 }` | Active trip lookup per vehicle |
| `{ driver: 1, status: 1 }` | Active trip lookup per driver |
| `{ status: 1, createdAt: -1 }` | Status-filtered trip lists |
| `{ vehicle: 1, status: 1, revenue: 1 }` | ROI aggregation by vehicle |

### FuelLog (`FuelLog.js`)

| Index | Purpose |
|-------|---------|
| `{ vehicle: 1, date: -1 }` | Vehicle fuel history |
| `{ trip: 1 }` | Fuel logs per trip |

### Expense (`Expense.js`)

| Index | Purpose |
|-------|---------|
| `{ vehicle: 1, date: -1 }` | Vehicle expense history |
| `{ category: 1, date: -1 }` | Category-filtered reports |

### MaintenanceLog (`MaintenanceLog.js`)

| Index | Purpose |
|-------|---------|
| `{ vehicle: 1 }` | Per-vehicle maintenance lookup |
| `{ vehicle: 1, date: -1 }` | Chronological service history |
| `{ status: 1 }` | Active maintenance queries |

### AuditLog (`AuditLog.js`)

| Index | Purpose |
|-------|---------|
| `{ user: 1, createdAt: -1 }` | Per-user audit history |
| `{ resource: 1, action: 1 }` | Filter by entity and action |
| `{ createdAt: -1 }` | Chronological audit feed |

### Other

* `User.email`, `Vehicle.registrationNumber` — unique indexes via schema
* `RefreshToken.expiresAt` — TTL index for automatic expiry

## Seeder

**Command:** `cd backend && node seeders/seed.js` (or `npm run seed` if npm works)

Targets the database in `MONGO_URI` (local Docker, or Atlas `transitops`). Idempotent upsert of 5 roles, 5 demo users, 20 vehicles, 25 drivers, 60 trips, and associated fuel/expense/maintenance records. **Warning:** re-running clears and regenerates all operational data in that database.

See `mock_data.md` for credentials and `deployment.md` for Atlas setup.
