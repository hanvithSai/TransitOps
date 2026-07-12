export const mockData = {
  auth: {
    login: {
      data: {
        accessToken: "mock_token",
        user: { _id: "u1", name: "Demo User", email: "demo@transitops.com", role: { name: "admin", displayName: "Administrator" } }
      }
    },
    refresh: {
      data: { accessToken: "mock_token" }
    }
  },
  dashboard: {
    stats: {
      data: {
        kpis: {
          vehicles: { total: 42, available: 28, onTrip: 10, inShop: 4, utilization: 76 },
          trips: { active: 10, pending: 5 },
          drivers: { onDuty: 15 },
          costs: { totalFuelCost: 125000, totalMaintenanceCost: 45000 }
        },
        charts: {
          tripsTrend: [
            { name: "Jan", count: 120 }, { name: "Feb", count: 150 }, { name: "Mar", count: 180 }, { name: "Apr", count: 170 }, { name: "May", count: 210 }, { name: "Jun", count: 250 }
          ],
          fleetStatus: [
            { name: "Available", value: 28 }, { name: "On Trip", value: 10 }, { name: "In Shop", value: 4 }
          ],
          fuelTrend: [
            { name: "Jan", cost: 18000 }, { name: "Feb", cost: 22000 }, { name: "Mar", cost: 21000 }, { name: "Apr", cost: 25000 }, { name: "May", cost: 27000 }, { name: "Jun", cost: 29000 }
          ],
          maintenanceTrend: [
            { name: "Jan", cost: 5000 }, { name: "Feb", cost: 8000 }, { name: "Mar", cost: 4000 }, { name: "Apr", cost: 9000 }, { name: "May", cost: 6000 }, { name: "Jun", cost: 10000 }
          ]
        }
      }
    }
  },
  vehicles: {
    list: {
      data: {
        vehicles: [
          { _id: "v1", registrationNumber: "MH-01-AB-1234", vehicleName: "Volvo FH16", type: "Truck", capacity: 40, status: "Available", odometer: 125000 },
          { _id: "v2", registrationNumber: "DL-04-XY-9876", vehicleName: "Tata Signa", type: "Truck", capacity: 35, status: "On Trip", odometer: 85000 },
          { _id: "v3", registrationNumber: "KA-05-MN-4567", vehicleName: "Mahindra Blazo", type: "Truck", capacity: 25, status: "In Shop", odometer: 210000 },
          { _id: "v4", registrationNumber: "TN-02-PQ-3321", vehicleName: "Ashok Leyland", type: "Trailer", capacity: 50, status: "Available", odometer: 45000 }
        ],
        total: 4
      }
    }
  },
  drivers: {
    list: {
      data: {
        drivers: [
          { _id: "d1", name: "Rajesh Kumar", licenseNumber: "DL-12345", licenseCategory: "Heavy", status: "Available", safetyScore: 95, licenseExpiry: new Date(Date.now() + 10000000000).toISOString() },
          { _id: "d2", name: "Suresh Singh", licenseNumber: "DL-67890", licenseCategory: "Heavy", status: "On Trip", safetyScore: 82, licenseExpiry: new Date(Date.now() + 5000000000).toISOString() },
          { _id: "d3", name: "Amit Patel", licenseNumber: "DL-11223", licenseCategory: "Light", status: "Off Duty", safetyScore: 98, licenseExpiry: new Date(Date.now() + 8000000000).toISOString() },
          { _id: "d4", name: "Vikram Sharma", licenseNumber: "DL-44556", licenseCategory: "Heavy", status: "Suspended", safetyScore: 45, licenseExpiry: new Date(Date.now() - 100000000).toISOString() }
        ],
        total: 4
      }
    }
  },
  trips: {
    list: {
      data: {
        trips: [
          { _id: "t1", source: "Mumbai Port", destination: "Pune Warehouse", status: "Dispatched", vehicle: { _id: "v2", registrationNumber: "DL-04-XY-9876", vehicleName: "Tata Signa", type: "Truck", capacity: 35, status: "On Trip" }, driver: { _id: "d2", name: "Suresh Singh", licenseNumber: "DL-67890", licenseCategory: "Heavy", safetyScore: 82 }, cargoWeight: 30, plannedDistance: 150, createdAt: new Date().toISOString() },
          { _id: "t2", source: "Delhi Hub", destination: "Jaipur Depot", status: "Draft", vehicle: { _id: "v1", registrationNumber: "MH-01-AB-1234", vehicleName: "Volvo FH16", type: "Truck", capacity: 40, status: "Available" }, driver: { _id: "d1", name: "Rajesh Kumar", licenseNumber: "DL-12345", licenseCategory: "Heavy", safetyScore: 95 }, cargoWeight: 25, plannedDistance: 280, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { _id: "t3", source: "Bangalore Hub", destination: "Chennai Port", status: "Completed", vehicle: { _id: "v4", registrationNumber: "TN-02-PQ-3321", vehicleName: "Ashok Leyland", type: "Trailer", capacity: 50, status: "Available" }, driver: { _id: "d3", name: "Amit Patel", licenseNumber: "DL-11223", licenseCategory: "Light", safetyScore: 98 }, cargoWeight: 45, plannedDistance: 350, actualDistance: 355, fuelUsed: 120, revenue: 45000, createdAt: new Date(Date.now() - 172800000).toISOString() }
        ],
        total: 3
      }
    }
  },
  maintenance: {
    list: {
      data: {
        records: [
          { _id: "m1", vehicle: { _id: "v3", registrationNumber: "KA-05-MN-4567" }, type: "Repair", description: "Engine overhaul", status: "Active", estimatedCost: 25000, startDate: new Date().toISOString() },
          { _id: "m2", vehicle: { _id: "v1", registrationNumber: "MH-01-AB-1234" }, type: "Routine", description: "Oil change and tire rotation", status: "Completed", actualCost: 5000, startDate: new Date(Date.now() - 400000000).toISOString(), completionDate: new Date(Date.now() - 300000000).toISOString() }
        ],
        total: 2
      }
    }
  },
  finance: {
    fuel: {
      data: {
        logs: [
          { _id: "f1", vehicle: { _id: "v2", registrationNumber: "DL-04-XY-9876" }, trip: "t1", quantity: 80, cost: 7200, odometer: 85000, date: new Date().toISOString() },
          { _id: "f2", vehicle: { _id: "v4", registrationNumber: "TN-02-PQ-3321" }, trip: "t3", quantity: 120, cost: 10800, odometer: 45000, date: new Date(Date.now() - 172800000).toISOString() }
        ],
        total: 2,
        stats: {
          totalCost: 18000,
          averageCostPerLiter: 90,
          totalLiters: 200
        }
      }
    },
    expenses: {
      data: {
        expenses: [
          { _id: "e1", category: "Toll", amount: 1500, description: "Mumbai-Pune Expressway", date: new Date().toISOString() },
          { _id: "e2", category: "Miscellaneous", amount: 500, description: "Driver food allowance", date: new Date(Date.now() - 86400000).toISOString() }
        ],
        total: 2,
        stats: {
          totalAmount: 2000,
          byCategory: [{ _id: "Toll", total: 1500 }, { _id: "Miscellaneous", total: 500 }]
        }
      }
    }
  },
  users: {
    list: {
      data: {
        users: [
          { _id: "u1", name: "Admin User", email: "admin@transitops.com", role: { name: "admin", displayName: "Administrator" }, isActive: true, lastLogin: new Date().toISOString() },
          { _id: "u2", name: "Fleet Manager", email: "fleet@transitops.com", role: { name: "fleet_manager", displayName: "Fleet Manager" }, isActive: true, lastLogin: new Date(Date.now() - 86400000).toISOString() }
        ],
        total: 2
      }
    }
  }
};
