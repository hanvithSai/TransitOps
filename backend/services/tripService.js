const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { AppError } = require('../utils/errorHandler');
const escapeRegex = require('../utils/escapeRegex');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isVehicleInActiveTrip = async (vehicleId, excludeTripId = null, session = null) => {
    const query = { vehicle: vehicleId, status: 'Dispatched' };
    if (excludeTripId) query._id = { $ne: excludeTripId };
    return Trip.exists(query).session(session);
};

const isDriverInActiveTrip = async (driverId, excludeTripId = null, session = null) => {
    const query = { driver: driverId, status: 'Dispatched' };
    if (excludeTripId) query._id = { $ne: excludeTripId };
    return Trip.exists(query).session(session);
};

/**
 * Core dispatch validation + state transitions (optionally within a transaction session).
 */
const applyDispatchRules = async (tripId, session = null) => {
    const trip = await Trip.findById(tripId).session(session);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.status !== 'Draft') {
        throw new AppError(
            `Cannot dispatch a trip that is already "${trip.status}". Only Draft trips can be dispatched.`,
            400
        );
    }

    const vehicle = await Vehicle.findById(trip.vehicle).session(session);
    if (!vehicle) throw new AppError('Assigned vehicle not found', 404);

    if (vehicle.status === 'Retired') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is Retired and cannot be dispatched.`,
            400
        );
    }

    if (vehicle.status === 'In Shop') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is currently In Shop for maintenance and cannot be dispatched.`,
            400
        );
    }

    if (vehicle.status !== 'Available') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is currently "${vehicle.status}" and is not available for dispatch.`,
            400
        );
    }

    if (await isVehicleInActiveTrip(trip.vehicle, tripId, session)) {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is already assigned to another active trip.`,
            400
        );
    }

    const driver = await Driver.findById(trip.driver).session(session);
    if (!driver) throw new AppError('Assigned driver not found', 404);

    if (driver.status === 'Suspended') {
        throw new AppError(
            `Driver "${driver.name}" is Suspended and cannot be assigned to a trip.`,
            400
        );
    }

    if (driver.status !== 'Available') {
        throw new AppError(
            `Driver "${driver.name}" is currently "${driver.status}" and is not available for dispatch.`,
            400
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(driver.expiryDate) < today) {
        throw new AppError(
            `Driver "${driver.name}" has an expired license (expired ${new Date(driver.expiryDate).toDateString()}). Cannot dispatch.`,
            400
        );
    }

    if (await isDriverInActiveTrip(trip.driver, tripId, session)) {
        throw new AppError(
            `Driver "${driver.name}" is already assigned to another active trip.`,
            400
        );
    }

    if (trip.cargoWeight > vehicle.capacity) {
        throw new AppError(
            `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg) for "${vehicle.registrationNumber}".`,
            400
        );
    }

    vehicle.status = 'On Trip';
    await vehicle.save({ session });

    driver.status = 'On Trip';
    await driver.save({ session });

    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();
    await trip.save({ session });

    return trip;
};

// ─── Service Methods ──────────────────────────────────────────────────────────

exports.getAllTrips = async ({
    page = 1,
    limit = 20,
    status = '',
    search = '',
} = {}) => {
    const query = {};

    if (status) query.status = status;

    if (search) {
        const safeSearch = escapeRegex(search.trim());
        if (safeSearch) {
            query.$or = [
                { source: { $regex: safeSearch, $options: 'i' } },
                { destination: { $regex: safeSearch, $options: 'i' } },
            ];
        }
    }

    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
        Trip.find(query)
            .populate('vehicle', 'registrationNumber vehicleName status capacity')
            .populate('driver', 'name licenseNumber licenseCategory expiryDate status safetyScore')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Trip.countDocuments(query),
    ]);

    return {
        trips,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

exports.getTripById = async (id) => {
    const trip = await Trip.findById(id)
        .populate('vehicle', 'registrationNumber vehicleName model type capacity status odometer')
        .populate('driver', 'name licenseNumber licenseCategory expiryDate contact status safetyScore')
        .populate('createdBy', 'name email');

    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
};

exports.createTrip = async (data, userId) => {
    const vehicle = await Vehicle.findById(data.vehicle);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const driver = await Driver.findById(data.driver);
    if (!driver) throw new AppError('Driver not found', 404);

    const trip = await Trip.create({ ...data, createdBy: userId });

    return Trip.findById(trip._id)
        .populate('vehicle', 'registrationNumber vehicleName status capacity')
        .populate('driver', 'name licenseNumber status');
};

exports.dispatchTrip = async (tripId) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            await exports._applyDispatchRules(tripId, session);
        });

        return Trip.findById(tripId)
            .populate('vehicle', 'registrationNumber vehicleName status capacity')
            .populate('driver', 'name licenseNumber status');
    } finally {
        await session.endSession();
    }
};

exports.completeTrip = async (tripId, { actualDistance, fuelUsed, revenue }) => {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.status !== 'Dispatched') {
        throw new AppError(
            `Cannot complete a trip that is "${trip.status}". Only Dispatched trips can be completed.`,
            400
        );
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
        if (actualDistance > 0) {
            const newOdometer = vehicle.odometer + actualDistance;
            if (newOdometer < vehicle.odometer) {
                throw new AppError('Completing this trip would decrease the vehicle odometer.', 400);
            }
            vehicle.odometer = newOdometer;
        }
        vehicle.status = 'Available';
        await vehicle.save();
    }

    const driver = await Driver.findById(trip.driver);
    if (driver) {
        driver.status = 'Available';
        await driver.save();
    }

    trip.status = 'Completed';
    trip.completedAt = new Date();
    trip.actualDistance = actualDistance;
    trip.fuelUsed = fuelUsed;
    if (revenue !== undefined && revenue !== null) {
        trip.revenue = revenue;
    }
    await trip.save();

    return Trip.findById(tripId)
        .populate('vehicle', 'registrationNumber vehicleName status capacity odometer')
        .populate('driver', 'name licenseNumber status');
};

exports.cancelTrip = async (tripId) => {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.status !== 'Draft') {
        throw new AppError(
            `Cannot cancel a trip that is "${trip.status}". Only Draft trips can be cancelled.`,
            400
        );
    }

    trip.status = 'Cancelled';
    trip.cancelledAt = new Date();
    await trip.save();

    return trip;
};

// Exported for tests
exports._applyDispatchRules = applyDispatchRules;
