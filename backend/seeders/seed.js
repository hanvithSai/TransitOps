require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker, fakerEN_IN } = require("@faker-js/faker");

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

const indianCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"];
const vehicleBrands = ["Tata Prima", "Ashok Leyland Ecomet", "Mahindra Blazo", "Eicher Pro", "BharatBenz", "Tata Signa"];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📦 MongoDB connected for seeding...");

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

        const createdRoles = await Role.insertMany(roles);
        const roleMap = {};
        createdRoles.forEach(r => roleMap[r.name] = r._id);
        console.log("✅ Roles seeded.");

        const usersToCreate = [
            { name: "Rahul Sharma", email: "admin@transitops.com", password: "Password@123", roleName: "admin" },
            { name: "Vikram Singh", email: "manager@transitops.com", password: "Password@123", roleName: "fleet_manager" },
            { name: "Arjun Reddy", email: "driver@transitops.com", password: "Password@123", roleName: "driver" },
            { name: "Priya Patel", email: "safety@transitops.com", password: "Password@123", roleName: "safety_officer" },
            { name: "Ananya Iyer", email: "finance@transitops.com", password: "Password@123", roleName: "financial_analyst" },
        ];
        
        const createdUsers = [];
        for (const u of usersToCreate) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: u.password,
                role: roleMap[u.roleName],
                isActive: true
            });
            createdUsers.push(user);
        }
        console.log("✅ Users seeded.");

        const adminId = createdUsers[0]._id;

        const vehicles = [];
        for (let i = 0; i < 20; i++) {
            const brand = faker.helpers.arrayElement(vehicleBrands);
            vehicles.push({
                registrationNumber: `MH${faker.number.int({min: 10, max: 49})}AB${faker.number.int({min: 1000, max: 9999})}`,
                vehicleName: `${brand} - Unit ${i+1}`,
                model: brand,
                type: faker.helpers.arrayElement(['Heavy Truck', 'Medium Commercial', 'Light Commercial']),
                capacity: faker.number.int({ min: 3000, max: 40000 }), // capacity in kg
                odometer: faker.number.int({ min: 15000, max: 350000 }),
                acquisitionCost: faker.number.int({ min: 1500000, max: 5000000 }), // INR
                status: faker.helpers.arrayElement(['Available', 'Available', 'On Trip', 'In Shop'])
            });
        }
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log("✅ Vehicles seeded.");

        const drivers = [];
        for (let i = 0; i < 25; i++) {
            drivers.push({
                name: fakerEN_IN.person.fullName(),
                licenseNumber: `DL${faker.number.int({min: 10, max: 99})}20${faker.number.int({min: 10, max: 24})}${faker.number.int({min: 1000000, max: 9999999})}`,
                licenseCategory: faker.helpers.arrayElement(['HMV', 'LMV', 'MCWG']),
                expiryDate: faker.date.future({ years: 5 }),
                contact: `+91 ${faker.string.numeric(10)}`,
                safetyScore: faker.number.int({ min: 75, max: 100 }),
                status: faker.helpers.arrayElement(['Available', 'Available', 'On Trip', 'Off Duty'])
            });
        }
        const createdDrivers = await Driver.insertMany(drivers);
        console.log("✅ Drivers seeded.");

        const trips = [];
        for (let i = 0; i < 60; i++) {
            const v = faker.helpers.arrayElement(createdVehicles);
            const d = faker.helpers.arrayElement(createdDrivers);
            const status = faker.helpers.arrayElement(['Draft', 'Dispatched', 'Completed', 'Completed', 'Cancelled']);
            
            let dispatchedAt = null, completedAt = null, cancelledAt = null;
            let actualDistance = null, fuelUsed = null, revenue = null;

            if (status === 'Dispatched') {
                dispatchedAt = faker.date.recent();
            } else if (status === 'Completed') {
                dispatchedAt = faker.date.past({ years: 0.5 });
                completedAt = faker.date.recent();
                actualDistance = faker.number.int({ min: 300, max: 2500 }); // km
                fuelUsed = actualDistance / faker.number.float({ min: 3, max: 8 }); // avg 3-8 kmpl for trucks
                revenue = actualDistance * faker.number.int({ min: 50, max: 150 }); // approx Rs 100 per km
            } else if (status === 'Cancelled') {
                cancelledAt = faker.date.recent();
            }

            let source = faker.helpers.arrayElement(indianCities);
            let dest = faker.helpers.arrayElement(indianCities);
            while(source === dest) {
                dest = faker.helpers.arrayElement(indianCities);
            }

            trips.push({
                source: source,
                destination: dest,
                vehicle: v._id,
                driver: d._id,
                cargoWeight: faker.number.int({ min: 1000, max: v.capacity }), // kg
                plannedDistance: faker.number.int({ min: 300, max: 2500 }), // km
                revenue: revenue,
                actualDistance: actualDistance,
                fuelUsed: fuelUsed,
                status: status,
                dispatchedAt: dispatchedAt,
                completedAt: completedAt,
                cancelledAt: cancelledAt,
                notes: faker.helpers.arrayElement(["Fragile goods", "Priority delivery", "Standard routing", ""]),
                createdBy: adminId
            });
        }
        const createdTrips = await Trip.insertMany(trips);
        console.log("✅ Trips seeded.");

        const expenses = [];
        for (let i = 0; i < 100; i++) {
            expenses.push({
                vehicle: faker.helpers.arrayElement(createdVehicles)._id,
                trip: faker.helpers.maybe(() => faker.helpers.arrayElement(createdTrips)._id, { probability: 0.5 }),
                amount: faker.number.int({ min: 500, max: 15000 }), // INR
                category: faker.helpers.arrayElement(['Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous']),
                notes: faker.helpers.arrayElement(['NHAI Toll plaza', 'Routine repair', 'Overnight parking', 'Annual insurance premium']),
                date: faker.date.recent({ days: 90 }),
                createdBy: adminId
            });
        }
        await Expense.insertMany(expenses);
        console.log("✅ Expenses seeded.");

        const fuelLogs = [];
        for (let i = 0; i < 80; i++) {
            const v = faker.helpers.arrayElement(createdVehicles);
            const liters = faker.number.int({ min: 50, max: 300 });
            fuelLogs.push({
                vehicle: v._id,
                trip: faker.helpers.maybe(() => faker.helpers.arrayElement(createdTrips)._id, { probability: 0.7 }),
                liters: liters,
                cost: liters * faker.number.float({ min: 88, max: 96, fractionDigits: 2 }), // current approx diesel price
                odometer: v.odometer - faker.number.int({ min: 100, max: 10000 }),
                date: faker.date.recent({ days: 90 }),
                createdBy: adminId
            });
        }
        await FuelLog.insertMany(fuelLogs);
        console.log("✅ FuelLogs seeded.");

        const maintenanceLogs = [];
        for (let i = 0; i < 30; i++) {
            const service = faker.helpers.arrayElement(['Oil Change', 'Tire Replacement', 'Engine Overhaul', 'Brake Inspection']);
            let cost = 0;
            if(service === 'Engine Overhaul') cost = faker.number.int({min: 25000, max: 80000});
            else if(service === 'Tire Replacement') cost = faker.number.int({min: 15000, max: 40000});
            else cost = faker.number.int({min: 2000, max: 10000});

            maintenanceLogs.push({
                vehicle: faker.helpers.arrayElement(createdVehicles)._id,
                serviceType: service,
                description: `Regular scheduled ${service.toLowerCase()} performed at authorized service center.`,
                cost: cost,
                date: faker.date.recent({ days: 120 }),
                closeDate: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.8 }),
                status: faker.helpers.arrayElement(['Active', 'Completed'])
            });
        }
        await MaintenanceLog.insertMany(maintenanceLogs);
        console.log("✅ MaintenanceLogs seeded.");

        console.log("\n🎉 Database successfully populated with realistic Indian mock data!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seed();
