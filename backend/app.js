const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const auditLogger = require('./middlewares/auditMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const maintenanceScheduleRoutes = require('./routes/maintenanceScheduleRoutes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// Render (and similar hosts) terminate TLS at a reverse proxy and set X-Forwarded-For.
// Required for express-rate-limit to identify clients correctly.
if (!isDev) {
    app.set('trust proxy', 1);
}

const getAllowedOrigins = () => {
    const origins = new Set(['http://localhost:5173']);
    for (const key of ['CLIENT_URL', 'FRONTEND_URL']) {
        const value = process.env[key];
        if (!value) continue;
        value.split(',').forEach((entry) => {
            const trimmed = entry.trim();
            if (trimmed) origins.add(trimmed);
        });
    }
    return origins;
};

const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.has(origin)) return callback(null, true);

        if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'TransitOps API is running' }));

app.get('/api/health', (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    if (dbReady) {
        return res.status(200).json({
            success: true,
            status: 'ok',
            database: 'connected',
        });
    }

    return res.status(503).json({
        success: false,
        status: 'unavailable',
        database: 'disconnected',
    });
});

app.use('/api', apiLimiter);
app.use(auditLogger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/maintenance-schedules', maintenanceScheduleRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
