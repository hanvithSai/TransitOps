# Mock Data for TransitOps Demo

The platform has been populated with a comprehensive set of mock data to facilitate demonstrations and testing. 
All data has been updated to reflect realistic Indian operations, using Indian metric systems (INR for currency, Kilograms for weight, Kilometers for distance).

## User Accounts

You can use the following credentials to log in to the different roles on the platform. The password for all accounts is `Password@123`.

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **System Admin** | Rahul Sharma | `admin@transitops.com` | `Password@123` |
| **Fleet Manager** | Vikram Singh | `manager@transitops.com` | `Password@123` |
| **Driver** | Arjun Reddy | `driver@transitops.com` | `Password@123` |
| **Safety Officer** | Priya Patel | `safety@transitops.com` | `Password@123` |
| **Financial Analyst** | Ananya Iyer | `finance@transitops.com` | `Password@123` |

## Generated Data Overview

The mock script has successfully generated realistic records across all major modules:
- **Roles:** Base roles generated (Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst)
- **Users:** 5 specific user accounts linked to each role with realistic Indian names.
- **Vehicles:** 20 distinct commercial vehicles from top Indian brands (e.g., Tata Prima, Ashok Leyland Ecomet, Mahindra Blazo, Eicher Pro, BharatBenz). Capacities are measured in kg (3,000 - 40,000 kg). Vehicle acquisition costs are measured in INR.
- **Drivers:** 25 drivers with realistic Indian names, regional Driving License numbers, expiry dates, contact details (+91 format), and safety scores.
- **Trips:** 60 trips simulating actual transit operations across major Indian transport hubs (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, etc.). Contains different statuses, realistic distance metrics (km), fuel usage based on heavy vehicle mileage (3-8 kmpl), cargo weights (kg), and revenue generated in INR.
- **Expenses:** 100 randomized expenses categorized by type (`Toll`, `Repair`, `Parking`, `Insurance`, `Miscellaneous`) associated with various vehicles and trips, in INR.
- **Fuel Logs:** 80 fuel logs tied to vehicles and trips, calculating exact costs using current average Indian diesel rates (approx ₹90/liter).
- **Maintenance Logs:** 30 maintenance log entries covering varied service types (Engine Overhaul, Tire Replacements, etc.) with realistic INR costs.

Enjoy the demo!
