const mongoose = require('mongoose');

const maintenanceScheduleSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        index: true,
    },
    serviceType: { type: String, required: true, trim: true },
    intervalKm: { type: Number, min: 0, default: 0 },
    intervalDays: { type: Number, min: 0, default: 0 },
    lastServiceOdometer: { type: Number, min: 0, default: 0 },
    lastServiceDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);
