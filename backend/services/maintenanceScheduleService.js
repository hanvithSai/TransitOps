const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../utils/errorHandler');

exports.getSchedules = async ({ page = 1, limit = 20, vehicleId } = {}) => {
    const query = { isActive: true };
    if (vehicleId) query.vehicle = vehicleId;

    const skip = (page - 1) * limit;
    const [schedules, total] = await Promise.all([
        MaintenanceSchedule.find(query).populate('vehicle', 'registrationNumber vehicleName odometer status').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        MaintenanceSchedule.countDocuments(query),
    ]);

    return { schedules, total, page: Number(page), pages: Math.ceil(total / limit) || 1 };
};

exports.createSchedule = async (payload) => {
    const vehicle = await Vehicle.findById(payload.vehicle);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.status === 'Retired') throw new AppError('Cannot schedule maintenance for a retired vehicle.', 400);
    if (!payload.intervalKm && !payload.intervalDays) {
        throw new AppError('Provide intervalKm and/or intervalDays.', 400);
    }

    return MaintenanceSchedule.create({
        ...payload,
        lastServiceOdometer: payload.lastServiceOdometer ?? vehicle.odometer,
        lastServiceDate: payload.lastServiceDate ?? new Date(),
    });
};

exports.updateSchedule = async (id, updates) => {
    const schedule = await MaintenanceSchedule.findById(id);
    if (!schedule) throw new AppError('Schedule not found.', 404);

    Object.assign(schedule, updates);
    await schedule.save();
    return schedule.populate('vehicle', 'registrationNumber vehicleName odometer status');
};

exports.deleteSchedule = async (id) => {
    const schedule = await MaintenanceSchedule.findByIdAndDelete(id);
    if (!schedule) throw new AppError('Schedule not found.', 404);
    return schedule;
};

exports.findDueSchedules = async () => {
    const schedules = await MaintenanceSchedule.find({ isActive: true }).populate('vehicle');
    const now = new Date();
    const due = [];

    for (const schedule of schedules) {
        const vehicle = schedule.vehicle;
        if (!vehicle || vehicle.status === 'Retired') continue;

        let isDue = false;
        if (schedule.intervalDays > 0) {
            const nextDate = new Date(schedule.lastServiceDate);
            nextDate.setDate(nextDate.getDate() + schedule.intervalDays);
            if (nextDate <= now) isDue = true;
        }
        if (schedule.intervalKm > 0 && vehicle.odometer >= schedule.lastServiceOdometer + schedule.intervalKm) {
            isDue = true;
        }
        if (isDue) due.push(schedule);
    }

    return due;
};
