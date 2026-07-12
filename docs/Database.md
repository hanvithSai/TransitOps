# Database Documentation

## Database Schemas
* **User (`User`):** Stores user accounts, hashed passwords, roles, and password reset tokens.
* **Role (`Role`):** Defines roles (e.g., Admin, FleetManager) with associated permission levels.
* **Vehicle (`Vehicle`):** Stores vehicle details, capacity, odometer, acquisition cost, and current status (`Available`, `On Trip`, `In Shop`, `Retired`).
* **Driver (`Driver`):** Stores driver info, license details, expiry dates, and status.
* **Trip (`Trip`):** Links a `Vehicle` and `Driver` to a specific route (source/destination). Tracks status (`Draft`, `Dispatched`, `Completed`, `Cancelled`), revenue, distances, and timestamps.
* **MaintenanceLog (`MaintenanceLog`):** Tracks maintenance activities performed on vehicles.
* **FuelLog (`FuelLog`):** Logs fuel purchases, quantity, and cost associated with vehicles/trips.
* **Expense (`Expense`):** General operational expenses linked to trips or vehicles.
* **AuditLog (`AuditLog`):** Tracks system changes and activities for security and compliance.

## Constraints
* **Unique Constraints:** Applied to `User.email` and `Vehicle.registrationNumber` to prevent duplicates.
* **Validation:** 
  * `Vehicle.capacity` and `Trip.cargoWeight` must be > 0.
  * Status enums enforce valid states (e.g., Vehicle status must be one of `Available`, `On Trip`, `In Shop`, `Retired`).
  * `User.email` validated with regex to ensure correct format.

## Indexes
* **Trip Indexes:**
  * `{ vehicle: 1, status: 1 }`: Fast lookup to check if a vehicle is currently in an active trip.
  * `{ driver: 1, status: 1 }`: Fast lookup to check if a driver is currently in an active trip.
  * `{ status: 1, createdAt: -1 }`: Optimizes queries fetching recent trips by status.
* **Other Optimizations:** Mongoose adds indexes automatically for fields with `unique: true` (e.g., `User.email`).
