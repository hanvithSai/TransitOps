const cron = require('node-cron');
const Driver = require('../models/Driver');

// Run everyday at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily cron job for license expiry check...');
        const currentDate = new Date();
        const expiredDrivers = await Driver.updateMany(
            {
                expiryDate: { $lt: currentDate },
                status: { $ne: 'Suspended' }
            },
            {
                $set: { status: 'Suspended' }
            }
        );
        console.log(`License expiry check completed. Suspended ${expiredDrivers.modifiedCount} drivers.`);
    } catch (error) {
        console.error('Error in daily cron job for license expiry:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // IST timezone
});
