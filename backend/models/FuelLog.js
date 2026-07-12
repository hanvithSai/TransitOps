const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
    {
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required for a fuel log'],
        },
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            default: null, // Optional: fuel might not be tied to a specific trip
        },
        liters: {
            type: Number,
            required: [true, 'Liters of fuel is required'],
            min: [0.1, 'Liters must be greater than 0'],
        },
        cost: {
            type: Number,
            required: [true, 'Cost of fuel is required'],
            min: [0.1, 'Cost must be greater than 0'],
        },
        odometer: {
            type: Number,
            required: [true, 'Odometer reading is required'],
            min: [0, 'Odometer cannot be negative'],
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Fast lookups for vehicle history and chronological sorting
fuelLogSchema.index({ vehicle: 1, date: -1 });
// Lookup logs for a specific trip
fuelLogSchema.index({ trip: 1 });

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);

module.exports = FuelLog;
