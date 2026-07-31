const cron = require('node-cron');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('./sendEmail');
const notificationService = require('../services/notificationService');
const maintenanceScheduleService = require('../services/maintenanceScheduleService');

const REMINDER_DAYS = 7;

const getAdminUserIds = async () => {
    const roles = await Role.find({ name: { $in: ['admin', 'fleet_manager', 'safety_officer'] } }).select('_id');
    const roleIds = roles.map((r) => r._id);
    const users = await User.find({ role: { $in: roleIds }, isActive: true }).select('_id email name');
    return users;
};

// Run everyday at midnight (00:00 IST)
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily cron job for license expiry check...');
        const currentDate = new Date();

        const driversOnActiveTrips = await Trip.distinct('driver', { status: 'Dispatched' });

        const expiredDrivers = await Driver.updateMany(
            {
                expiryDate: { $lt: currentDate },
                status: { $ne: 'Suspended' },
                _id: { $nin: driversOnActiveTrips },
            },
            { $set: { status: 'Suspended' } }
        );
        console.log(`License expiry check completed. Suspended ${expiredDrivers.modifiedCount} drivers.`);

        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS);

        const expiringSoon = await Driver.find({
            expiryDate: { $gte: currentDate, $lte: reminderDate },
            status: { $ne: 'Suspended' },
        }).select('name licenseNumber expiryDate');

        if (expiringSoon.length) {
            const admins = await getAdminUserIds();
            const adminIds = admins.map((u) => u._id);
            const lines = expiringSoon.map((d) =>
                `<li>${d.name} (${d.licenseNumber}) — expires ${new Date(d.expiryDate).toLocaleDateString()}</li>`
            ).join('');

            for (const admin of admins) {
                try {
                    await sendEmail({
                        email: admin.email,
                        subject: `[TransitOps] ${expiringSoon.length} driver license(s) expiring within ${REMINDER_DAYS} days`,
                        html: `<p>Hello ${admin.name},</p><p>The following driver licenses expire soon:</p><ul>${lines}</ul>`,
                    });
                } catch (err) {
                    console.error('License reminder email failed for', admin.email, err.message);
                }
            }

            await notificationService.createNotificationsForUsers(adminIds, {
                type: 'license_expiry',
                title: 'Driver licenses expiring soon',
                message: `${expiringSoon.length} driver license(s) expire within ${REMINDER_DAYS} days.`,
                metadata: { count: expiringSoon.length },
            });
        }

        const dueSchedules = await maintenanceScheduleService.findDueSchedules();
        if (dueSchedules.length) {
            const admins = await getAdminUserIds();
            const adminIds = admins.map((u) => u._id);
            await notificationService.createNotificationsForUsers(adminIds, {
                type: 'maintenance_due',
                title: 'Maintenance schedules due',
                message: `${dueSchedules.length} recurring maintenance schedule(s) are due.`,
                metadata: { scheduleIds: dueSchedules.map((s) => s._id) },
            });
        }
    } catch (error) {
        console.error('Error in daily cron job for license expiry:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
});
