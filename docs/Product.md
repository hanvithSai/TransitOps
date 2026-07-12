# Product Documentation

## Product Features
* **Driver Management:** Keep track of driver details, status (Available, On Trip, Off Duty, Suspended), and automate license expiry tracking.
* **Vehicle Management:** Manage fleet inventory with details like capacity, odometer, and status. Supports soft deletion (Retirement) to maintain data integrity.
* **Trip Dispatch & Tracking:** Assign drivers and vehicles to trips, track cargo weight, planned vs. actual distances, fuel used, and revenue.
* **Maintenance Workflow:** Track vehicle maintenance logs, repair costs, and downtime.
* **Fuel & Expenses:** Record fuel consumption and operational expenses per trip or vehicle.
* **Dashboard & Analytics:** High-level overview of fleet utilization, active trips, and key performance indicators (KPIs).
* **Reports:** Generate and export operational cost and ROI reports in CSV format.

## User Stories
* **Fleet Manager:** "As a fleet manager, I want to see a dashboard with fleet utilization so I can optimize my resources."
* **Safety Officer:** "As a safety officer, I want the system to automatically suspend drivers with expired licenses so we remain compliant with regulations."
* **Finance Analyst:** "As a finance analyst, I want to export cost and revenue reports to CSV so I can calculate the ROI for each vehicle."
* **Driver (Future Phase):** "As a driver, I want to view my assigned trips and update the status when I complete them."

## User Experience (UX)
* **Clean & Modern UI:** Built with Tailwind CSS for a responsive, consistent, and clean aesthetic.
* **Role-Based Views:** UI elements and pages are accessible based on the user's role.
* **Interactive Data:** Utilization of Recharts for dynamic visual representations of fleet data on the dashboard.
* **Defensive Deletion:** When attempting to delete a vehicle with associated trips, the UI prevents it and suggests "Retiring" it instead.
* **Toasts & Modals:** Standardized components for providing non-intrusive feedback and confirming critical actions.
