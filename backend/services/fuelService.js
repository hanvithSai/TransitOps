const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const { AppError } = require('../utils/errorHandler');

/**
 * GET all fuel logs — paginated + filtered
 */
exports.getAllFuelLogs = async ({
    page = 1,
    limit = 20,
    vehicleId = '',
    tripId = '',
} = {}) => {
    const query = {};

    if (vehicleId) query.vehicle = vehicleId;
    if (tripId) query.trip = tripId;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        FuelLog.find(query)
            .populate('vehicle', 'registrationNumber vehicleName')
            .populate('trip', 'source destination status')
            .populate('createdBy', 'name')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        FuelLog.countDocuments(query),
    ]);

    return {
        logs,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

/**
 * GET single fuel log by ID
 */
exports.getFuelLogById = async (id) => {
    const log = await FuelLog.findById(id)
        .populate('vehicle', 'registrationNumber vehicleName')
        .populate('trip', 'source destination status')
        .populate('createdBy', 'name email');

    if (!log) throw new AppError('Fuel log not found', 404);
    return log;
};

/**
 * CREATE fuel log
 */
exports.createFuelLog = async (data, userId) => {
    // Verify vehicle exists
    const vehicle = await Vehicle.findById(data.vehicle);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    // Verify trip exists if provided
    if (data.trip) {
        const trip = await Trip.findById(data.trip);
        if (!trip) throw new AppError('Trip not found', 404);
        // Ensure the trip matches the vehicle (logical check)
        if (trip.vehicle.toString() !== data.vehicle.toString()) {
            throw new AppError('The specified trip does not belong to the selected vehicle', 400);
        }
    }

    const log = await FuelLog.create({ ...data, createdBy: userId });

    return FuelLog.findById(log._id)
        .populate('vehicle', 'registrationNumber vehicleName')
        .populate('trip', 'source destination');
};

/**
 * UPDATE fuel log
 */
exports.updateFuelLog = async (id, data) => {
    // If vehicle is being updated, verify it exists
    if (data.vehicle) {
        const vehicle = await Vehicle.findById(data.vehicle);
        if (!vehicle) throw new AppError('Vehicle not found', 404);
    }

    // If trip is being updated, verify it exists and matches vehicle
    if (data.trip) {
        const trip = await Trip.findById(data.trip);
        if (!trip) throw new AppError('Trip not found', 404);
        
        // We need to know which vehicle to compare against
        const currentLog = await FuelLog.findById(id);
        if (!currentLog) throw new AppError('Fuel log not found', 404);
        
        const vehicleId = data.vehicle || currentLog.vehicle.toString();
        
        if (trip.vehicle.toString() !== vehicleId.toString()) {
            throw new AppError('The specified trip does not belong to the selected vehicle', 400);
        }
    }

    const log = await FuelLog.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    )
    .populate('vehicle', 'registrationNumber vehicleName')
    .populate('trip', 'source destination');

    if (!log) throw new AppError('Fuel log not found', 404);
    return log;
};

/**
 * DELETE fuel log
 */
exports.deleteFuelLog = async (id) => {
    const log = await FuelLog.findByIdAndDelete(id);
    if (!log) throw new AppError('Fuel log not found', 404);
    return log;
};
