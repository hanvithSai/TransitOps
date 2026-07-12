require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Role = require("../models/Role");
const User = require("../models/User");

const roles = [
    {
        name: "admin",
        displayName: "Administrator",
        description: "Full system access — manage users, roles, and all resources.",
        permissions: ["*"],
    },
    {
        name: "fleet_manager",
        displayName: "Fleet Manager",
        description: "Manage vehicles, schedule maintenance, monitor fleet utilization.",
        permissions: ["vehicles:read", "vehicles:write", "maintenance:read", "maintenance:write", "dashboard:read"],
    },
    {
        name: "driver",
        displayName: "Driver",
        description: "Create trips, assign drivers and vehicles, dispatch trips.",
        permissions: ["trips:read", "trips:write", "vehicles:read", "drivers:read", "dashboard:read"],
    },
    {
        name: "safety_officer",
        displayName: "Safety Officer",
        description: "Manage drivers, monitor license expiry, review safety scores.",
        permissions: ["drivers:read", "drivers:write", "dashboard:read"],
    },
    {
        name: "financial_analyst",
        displayName: "Financial Analyst",
        description: "Track fuel, record expenses, review ROI, export reports.",
        permissions: ["fuel:read", "fuel:write", "expenses:read", "expenses:write", "reports:read", "dashboard:read"],
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📦 MongoDB connected for seeding...");

        // Upsert roles
        for (const roleData of roles) {
            await Role.findOneAndUpdate(
                { name: roleData.name },
                roleData,
                { upsert: true, returnDocument: "after", runValidators: true }
            );
            console.log(`✅ Role upserted: ${roleData.displayName}`);
        }

        // Create admin user if not exists
        const adminRole = await Role.findOne({ name: "admin" });
        const existingAdmin = await User.findOne({ email: "admin@transitops.com" });

        if (!existingAdmin) {
            await User.create({
                name: "System Admin",
                email: "admin@transitops.com",
                password: "Admin@123",
                role: adminRole._id,
                isActive: true,
            });
            console.log("✅ Admin user created: admin@transitops.com / Admin@123");
        } else {
            console.log("ℹ️  Admin user already exists, skipping.");
        }

        console.log("\n🎉 Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();
