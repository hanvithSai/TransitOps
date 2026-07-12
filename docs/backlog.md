# 1 Driver Management

## License Expiry Enforcement

### Priority
High

### Current Status
Driver CRUD is implemented. `expiryDate` is collected, but no background checks enforce license expiration proactively. Runtime checks exist during Trip Dispatch, but the driver remains marked as "Available".

### Problem
Drivers with expired licenses might still show as 'Available' and could be manually missed by the Safety Officer, violating business rules and reporting accuracy.

### Required Implementation
- Add a mechanism (cron job or scheduled task) to automatically flag or suspend drivers when their license expires.

### Implementation Plan
1. Install `node-cron`.
2. Create `utils/cronJobs.js`.
3. Implement a daily cron job to find all drivers where `expiryDate` < `new Date()` and `status` != 'Suspended'.
4. Update their status to 'Suspended'.
5. Import and start the cron job in `server.js`.

### Files Likely To Change
Backend
- server.js
- utils/cronJobs.js

### Dependencies
- Driver Management

### Acceptance Criteria
- Drivers with expired licenses are automatically suspended on a daily basis.

### Estimated Complexity
Small

### Notes
- Ensure the cron job timezone aligns with the business operating timezone.

---

# 2 Vehicle Management

## Prevent Unsafe Vehicle and Driver Deletion

### Priority
High

### Current Status
Vehicle and Driver CRUD is implemented. Deletion is allowed unconditionally in `vehicleService.js` and `driverService.js` despite having relational links to Trips, Maintenance Logs, Fuel Logs, and Expenses.

### Problem
Entities can currently be hard-deleted even if they have associated trips or maintenance logs. This will cause orphaned records and data integrity issues across the platform.

### Required Implementation
- Prevent hard deletion of vehicles if they have associated trips, maintenance logs, fuel logs, or expenses.
- Prevent hard deletion of drivers if they have associated trips.
- Provide a "Retire" action as a soft-delete alternative for vehicles with historical data.

### Implementation Plan
1. Update `vehicleService.deleteVehicle` to check `Trip`, `MaintenanceLog`, `FuelLog`, and `Expense` collections for existing records referencing the vehicle.
2. If records exist, throw an `AppError` suggesting the vehicle be "Retired" instead.
3. Update `driverService.deleteDriver` to check `Trip` collection for referencing records.
4. If records exist, throw an `AppError` suggesting the driver be set to 'Off Duty' or another inactive state.
5. Ensure frontend UI handles the error gracefully.

### Files Likely To Change
Backend
- services/vehicleService.js
- services/driverService.js

### Dependencies
- Trip Engine
- Maintenance Workflow
- Fuel & Expenses

### Acceptance Criteria
- Cannot hard-delete a vehicle or driver with associated records.
- Proper error message returned advising retirement or status change.

### Estimated Complexity
Medium

### Notes
- This is a proactive fix to ensure relational data integrity.

---

# 3 Dashboard

## Dashboard Analytics API & UI Integration

### Priority
Medium

### Current Status
`DashboardPage.jsx` exists but uses hardcoded placeholder data and indicates "Coming in Phase 2+". No backend API for dashboard KPIs exists.

### Problem
Users have no high-level overview of fleet operations, utilization, or active trips.

### Required Implementation
- Create `/api/dashboard/stats` endpoint using MongoDB aggregations.
- Fetch real KPI counts (Total Vehicles, Available, On Trip, In Shop, Active Trips, Drivers on Duty).
- Integrate API into frontend `DashboardPage.jsx`.

### Implementation Plan
1. Create `controllers/dashboardController.js` and `routes/dashboardRoutes.js`.
2. Write MongoDB aggregation queries to count documents across Vehicles, Drivers, and Trips collections.
3. Calculate Fleet Utilization percentage.
4. Update `server.js` to mount `/api/dashboard`.
5. Update `DashboardPage.jsx` to fetch and display this data on mount.

### Files Likely To Change
Backend
- controllers/dashboardController.js
- routes/dashboardRoutes.js
- server.js

Frontend
- src/pages/DashboardPage.jsx
- src/services/api.js

### Dependencies
- Vehicle, Driver, Trip, and Maintenance Modules

### Acceptance Criteria
- Dashboard displays real-time data from the database.
- Dashboard updates on refresh.
- Fleet Utilization is calculated correctly.

### Estimated Complexity
Medium

### Notes
- Aggregation queries should be optimized. Caching (e.g., Redis) could be considered for future scalability if the dataset grows large.

---

# 4 Reports

## Operational Cost & ROI Reports with CSV Export

### Priority
Medium

### Current Status
Missing entirely. Frontend `App.jsx` points to a `ComingSoon` component for `/reports`.

### Problem
No way to export data for financial analysis or view aggregate return on investment per vehicle.

### Required Implementation
- Aggregation endpoints to calculate total expenses, fuel costs, and revenue per vehicle.
- CSV Export functionality for reports.
- Create Reports frontend page.

### Implementation Plan
1. Create `services/reportService.js` with aggregation pipelines to calculate costs and revenue.
2. Create `controllers/reportController.js` and `routes/reportRoutes.js`.
3. Use a library like `json2csv` on the backend to generate CSV files.
4. Build `ReportsPage.jsx` frontend with data tables and download buttons.
5. Update `App.jsx` to route to `ReportsPage`.

### Files Likely To Change
Backend
- services/reportService.js
- controllers/reportController.js
- routes/reportRoutes.js
- server.js

Frontend
- src/pages/ReportsPage.jsx
- src/App.jsx

### Dependencies
- Trips, Fuel, and Expenses modules

### Acceptance Criteria
- Users can view aggregate cost vs revenue data.
- Users can download reports as CSV.

### Estimated Complexity
Medium

### Notes
- Data aggregation can be heavy; ensure proper indexing on date and vehicle references.

---

# 5 Technical Debt

## Reusable UI Components Extraction

### Priority
Low

### Current Status
Pages like `VehiclesPage.jsx`, `DriversPage.jsx`, `TripsPage.jsx`, `MaintenancePage.jsx`, and `FinancePage.jsx` contain duplicated implementations of `Modal` and `Toast` components. Forms are built using standard React state instead of a robust form library.

### Problem
Violates the DRY principle. Makes future UI updates error-prone and time-consuming. Raw forms lack advanced validation and error handling on the client side, leading to massive file sizes (e.g., `TripsPage.jsx` is over 34KB).

### Required Implementation
- Extract `Modal` and `Toast` into a `src/components/common/` directory.
- Refactor existing pages to import and use these shared components.
- Refactor forms to use React Hook Form for state management and Zod for validation.

### Implementation Plan
1. Create `src/components/common/Modal.jsx` and `src/components/common/Toast.jsx`.
2. Refactor all pages to remove inline component definitions.
3. Install `react-hook-form` and `@hookform/resolvers/zod`.
4. Rewrite form logic across all pages to use schemas that mirror backend validation.

### Files Likely To Change
Frontend
- src/components/common/Modal.jsx
- src/components/common/Toast.jsx
- src/pages/VehiclesPage.jsx
- src/pages/DriversPage.jsx
- src/pages/TripsPage.jsx
- src/pages/MaintenancePage.jsx
- src/pages/FinancePage.jsx

### Dependencies
- None

### Acceptance Criteria
- No duplicate `Modal` or `Toast` definitions in page files.
- Forms use React Hook Form for state and Zod for validation.
- Behavior and styling remain identical.

### Estimated Complexity
Large

### Notes
- Refactoring will significantly improve code maintainability and reduce bundle size.