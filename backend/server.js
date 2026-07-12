require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { errorHandler } = require("./utils/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const fuelRoutes = require("./routes/fuelRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,          // allow cookies (refresh token)
}));
app.use(express.json());
app.use(cookieParser());

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
require('./utils/cronJobs');

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "TransitOps API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));