require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const Role = require("../models/Role");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const FuelLog = require("../models/FuelLog");
const MaintenanceLog = require("../models/MaintenanceLog");

const roles = [
    {
        name: "admin",
        displayName: "Administrator",
        description: "Full system access.",
        permissions: ["*"],
    },
    {
        name: "fleet_manager",
        displayName: "Fleet Manager",
        description: "Manage vehicles.",
        permissions: ["vehicles:read", "vehicles:write", "maintenance:read", "maintenance:write", "dashboard:read"],
    },
    {
        name: "driver",
        displayName: "Driver",
        description: "Driver access.",
        permissions: ["trips:read", "trips:write", "vehicles:read", "drivers:read", "dashboard:read"],
    },
    {
        name: "safety_officer",
        displayName: "Safety Officer",
        description: "Safety compliance.",
        permissions: ["drivers:read", "drivers:write", "dashboard:read"],
    },
    {
        name: "financial_analyst",
        displayName: "Financial Analyst",
        description: "Finance operations.",
        permissions: ["fuel:read", "fuel:write", "expenses:read", "expenses:write", "reports:read", "dashboard:read"],
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📦 MongoDB connected for seeding...");

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Role.deleteMany({}),
            Vehicle.deleteMany({}),
            Driver.deleteMany({}),
            Trip.deleteMany({}),
            Expense.deleteMany({}),
            FuelLog.deleteMany({}),
            MaintenanceLog.deleteMany({})
        ]);
        console.log("🗑️ Cleared existing data.");

        // Insert roles
        const createdRoles = await Role.insertMany(roles);
        const roleMap = {};
        createdRoles.forEach(r => roleMap[r.name] = r._id);
        console.log("✅ Roles seeded.");

        // Create Users
        const usersToCreate = [
            { name: "Admin User", email: "admin@transitops.com", password: "Password@123", roleName: "admin" },
            { name: "Manager John", email: "manager@transitops.com", password: "Password@123", roleName: "fleet_manager" },
            { name: "Driver Bob", email: "driver@transitops.com", password: "Password@123", roleName: "driver" },
            { name: "Safety Sarah", email: "safety@transitops.com", password: "Password@123", roleName: "safety_officer" },
            { name: "Finance Alice", email: "finance@transitops.com", password: "Password@123", roleName: "financial_analyst" },
        ];
        
        const createdUsers = [];
        for (const u of usersToCreate) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: u.password, // Schema hook hashes this
                role: roleMap[u.roleName],
                isActive: true
            });
            createdUsers.push(user);
        }
        console.log("✅ Users seeded.");

        const adminId = createdUsers[0]._id;

        // Create Vehicles
        const vehicles = [];
        for (let i = 0; i < 15; i++) {
            vehicles.push({
                registrationNumber: faker.vehicle.vrm().toUpperCase(),
                vehicleName: `Truck ${i+1}`,
                model: faker.vehicle.model(),
                type: faker.helpers.arrayElement(['Truck', 'Van', 'Car', 'Bus']),
                capacity: faker.number.int({ min: 1000, max: 20000 }),
                odometer: faker.number.int({ min: 10000, max: 200000 }),
                acquisitionCost: faker.number.int({ min: 20000, max: 150000 }),
                status: faker.helpers.arrayElement(['Available', 'Available', 'Available', 'On Trip', 'In Shop'])
            });
        }
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log("✅ Vehicles seeded.");

        // Create Drivers
        const drivers = [];
        for (let i = 0; i < 15; i++) {
            drivers.push({
                name: faker.person.fullName(),
                licenseNumber: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
                licenseCategory: faker.helpers.arrayElement(['CDL-A', 'CDL-B', 'Class C']),
                expiryDate: faker.date.future({ years: 3 }),
                contact: faker.phone.number(),
                safetyScore: faker.number.int({ min: 60, max: 100 }),
                status: faker.helpers.arrayElement(['Available', 'Available', 'On Trip', 'Off Duty'])
            });
        }
        const createdDrivers = await Driver.insertMany(drivers);
        console.log("✅ Drivers seeded.");

        // Create Trips
        const trips = [];
        for (let i = 0; i < 30; i++) {
            const v = faker.helpers.arrayElement(createdVehicles);
            const d = faker.helpers.arrayElement(createdDrivers);
            const status = faker.helpers.arrayElement(['Draft', 'Dispatched', 'Completed', 'Cancelled']);
            
            let dispatchedAt = null, completedAt = null, cancelledAt = null;
            let actualDistance = null, fuelUsed = null, revenue = null;

            if (status === 'Dispatched') {
                dispatchedAt = faker.date.recent();
            } else if (status === 'Completed') {
                dispatchedAt = faker.date.past();
                completedAt = faker.date.recent();
                actualDistance = faker.number.int({ min: 100, max: 1500 });
                fuelUsed = actualDistance / faker.number.float({ min: 5, max: 15 });
                revenue = actualDistance * faker.number.float({ min: 2, max: 5 });
            } else if (status === 'Cancelled') {
                cancelledAt = faker.date.recent();
            }

            trips.push({
                source: faker.location.city(),
                destination: faker.location.city(),
                vehicle: v._id,
                driver: d._id,
                cargoWeight: faker.number.int({ min: 100, max: v.capacity }),
                plannedDistance: faker.number.int({ min: 100, max: 1500 }),
                revenue: revenue,
                actualDistance: actualDistance,
                fuelUsed: fuelUsed,
                status: status,
                dispatchedAt: dispatchedAt,
                completedAt: completedAt,
                cancelledAt: cancelledAt,
                notes: faker.lorem.sentence(),
                createdBy: adminId
            });
        }
        const createdTrips = await Trip.insertMany(trips);
        console.log("✅ Trips seeded.");

        // Create Expenses
        const expenses = [];
        for (let i = 0; i < 40; i++) {
            expenses.push({
                vehicle: faker.helpers.arrayElement(createdVehicles)._id,
                trip: faker.helpers.maybe(() => faker.helpers.arrayElement(createdTrips)._id, { probability: 0.5 }),
                amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
                category: faker.helpers.arrayElement(['Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous']),
                notes: faker.lorem.words(3),
                date: faker.date.recent({ days: 30 }),
                createdBy: adminId
            });
        }
        await Expense.insertMany(expenses);
        console.log("✅ Expenses seeded.");

        // Create FuelLogs
        const fuelLogs = [];
        for (let i = 0; i < 20; i++) {
            const v = faker.helpers.arrayElement(createdVehicles);
            fuelLogs.push({
                vehicle: v._id,
                trip: faker.helpers.maybe(() => faker.helpers.arrayElement(createdTrips)._id, { probability: 0.5 }),
                liters: faker.number.float({ min: 20, max: 150, fractionDigits: 2 }),
                cost: faker.number.float({ min: 50, max: 300, fractionDigits: 2 }),
                odometer: v.odometer - faker.number.int({ min: 0, max: 5000 }),
                date: faker.date.recent({ days: 30 }),
                createdBy: adminId
            });
        }
        await FuelLog.insertMany(fuelLogs);
        console.log("✅ FuelLogs seeded.");

        // Create MaintenanceLogs
        const maintenanceLogs = [];
        for (let i = 0; i < 15; i++) {
            maintenanceLogs.push({
                vehicle: faker.helpers.arrayElement(createdVehicles)._id,
                serviceType: faker.helpers.arrayElement(['Oil Change', 'Tire Replacement', 'Engine Tune-up', 'Brake Inspection']),
                cost: faker.number.float({ min: 100, max: 2000, fractionDigits: 2 }),
                date: faker.date.recent({ days: 60 }),
                status: faker.helpers.arrayElement(['Active', 'Completed'])
            });
        }
        await MaintenanceLog.insertMany(maintenanceLogs);
        console.log("✅ MaintenanceLogs seeded.");

        console.log("\n🎉 Database successfully populated with mock data!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seed();
