const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: [true, 'Source location is required'],
            trim: true,
        },
        destination: {
            type: String,
            required: [true, 'Destination location is required'],
            trim: true,
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required'],
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: [true, 'Driver is required'],
        },
        cargoWeight: {
            type: Number,
            required: [true, 'Cargo weight is required'],
            min: [0, 'Cargo weight cannot be negative'],
        },
        plannedDistance: {
            type: Number,
            required: [true, 'Planned distance is required'],
            min: [0, 'Planned distance cannot be negative'],
        },
        revenue: {
            type: Number,
            min: [0, 'Revenue cannot be negative'],
            default: null,
        },
        actualDistance: {
            type: Number,
            min: [0, 'Actual distance cannot be negative'],
            default: null,
        },
        fuelUsed: {
            type: Number,
            min: [0, 'Fuel used cannot be negative'],
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
                message: '{VALUE} is not a valid trip status',
            },
            default: 'Draft',
        },
        dispatchedAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Fast lookup: "is this vehicle currently in an active (Dispatched) trip?"
tripSchema.index({ vehicle: 1, status: 1 });

// Fast lookup: "is this driver currently in an active (Dispatched) trip?"
tripSchema.index({ driver: 1, status: 1 });

// Fast list queries filtered by status, sorted by createdAt
tripSchema.index({ status: 1, createdAt: -1 });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
