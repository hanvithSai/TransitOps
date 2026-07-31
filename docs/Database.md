# Database Documentation

**Last updated:** July 31, 2026

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
| `auditlogs` | AuditLog | Mutation audit trail (write-only from middleware) |

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

### Other

* `User.email`, `Vehicle.registrationNumber` — unique indexes via schema
* `RefreshToken.expiresAt` — TTL index for automatic expiry

## Seeder

**Command:** `cd backend && npm run seed`

Idempotent upsert of 5 roles, 5 demo users, 20 vehicles, 25 drivers, 60 trips, and associated fuel/expense/maintenance records. **Warning:** re-running clears and regenerates all operational data.

See `mock_data.md` for credentials and data volumes.
