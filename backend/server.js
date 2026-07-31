require('dotenv').config();

const mongoose = require('mongoose');
const validateEnv = require('./utils/validateEnv');
const connectDB = require('./config/db');
const app = require('./app');

validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    require('./utils/cronJobs');

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`${signal} received — shutting down gracefully`);
        server.close(async () => {
            try {
                await mongoose.connection.close(false);
                console.log('MongoDB connection closed');
            } catch (err) {
                console.error('Error closing MongoDB connection:', err.message);
            }
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
