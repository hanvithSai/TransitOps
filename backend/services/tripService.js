const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { AppError } = require('../utils/errorHandler');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if a vehicle is currently locked in a Dispatched trip.
 * Uses the compound index {vehicle, status} for efficient lookup.
 */
const isVehicleInActiveTrip = async (vehicleId, excludeTripId = null) => {
    const query = { vehicle: vehicleId, status: 'Dispatched' };
    if (excludeTripId) query._id = { $ne: excludeTripId };
    return Trip.exists(query);
};

/**
 * Check if a driver is currently locked in a Dispatched trip.
 * Uses the compound index {driver, status} for efficient lookup.
 */
const isDriverInActiveTrip = async (driverId, excludeTripId = null) => {
    const query = { driver: driverId, status: 'Dispatched' };
    if (excludeTripId) query._id = { $ne: excludeTripId };
    return Trip.exists(query);
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * GET all trips — paginated + filtered
 */
exports.getAllTrips = async ({
    page = 1,
    limit = 20,
    status = '',
    search = '',
} = {}) => {
    const query = {};

    if (status) query.status = status;

    if (search) {
        query.$or = [
            { source: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } },
        ];
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

/**
 * GET single trip by ID — fully populated
 */
exports.getTripById = async (id) => {
    const trip = await Trip.findById(id)
        .populate('vehicle', 'registrationNumber vehicleName model type capacity status odometer')
        .populate('driver', 'name licenseNumber licenseCategory expiryDate contact status safetyScore')
        .populate('createdBy', 'name email');

    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
};

/**
 * CREATE trip — status starts as Draft.
 * No business rule checks here; eligibility is enforced at dispatch time.
 */
exports.createTrip = async (data, userId) => {
    const trip = await Trip.create({ ...data, createdBy: userId });

    return Trip.findById(trip._id)
        .populate('vehicle', 'registrationNumber vehicleName status capacity')
        .populate('driver', 'name licenseNumber status');
};

/**
 * DISPATCH trip: Draft → Dispatched
 * Enforces all 10 PRD §8 mandatory business rules sequentially.
 */
exports.dispatchTrip = async (tripId) => {
    // ── 0. Fetch trip ────────────────────────────────────────────────────────
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    // ── Rule 0: Trip must be in Draft state ──────────────────────────────────
    if (trip.status !== 'Draft') {
        throw new AppError(
            `Cannot dispatch a trip that is already "${trip.status}". Only Draft trips can be dispatched.`,
            400
        );
    }

    // ── Fetch vehicle ────────────────────────────────────────────────────────
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (!vehicle) throw new AppError('Assigned vehicle not found', 404);

    // ── Rule 1: Vehicle must not be Retired ──────────────────────────────────
    if (vehicle.status === 'Retired') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is Retired and cannot be dispatched.`,
            400
        );
    }

    // ── Rule 2: Vehicle must not be In Shop (maintenance block) ──────────────
    if (vehicle.status === 'In Shop') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is currently In Shop for maintenance and cannot be dispatched.`,
            400
        );
    }

    // ── Rule 3: Vehicle must be Available ────────────────────────────────────
    if (vehicle.status !== 'Available') {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is currently "${vehicle.status}" and is not available for dispatch.`,
            400
        );
    }

    // ── Rule 4: Vehicle must not be in another active trip ───────────────────
    if (await isVehicleInActiveTrip(trip.vehicle, tripId)) {
        throw new AppError(
            `Vehicle "${vehicle.registrationNumber}" is already assigned to another active trip.`,
            400
        );
    }

    // ── Fetch driver ─────────────────────────────────────────────────────────
    const driver = await Driver.findById(trip.driver);
    if (!driver) throw new AppError('Assigned driver not found', 404);

    // ── Rule 5: Driver must not be Suspended ─────────────────────────────────
    if (driver.status === 'Suspended') {
        throw new AppError(
            `Driver "${driver.name}" is Suspended and cannot be assigned to a trip.`,
            400
        );
    }

    // ── Rule 6: Driver must be Available ─────────────────────────────────────
    if (driver.status !== 'Available') {
        throw new AppError(
            `Driver "${driver.name}" is currently "${driver.status}" and is not available for dispatch.`,
            400
        );
    }

    // ── Rule 7: Driver license must not be expired ───────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(driver.expiryDate) < today) {
        throw new AppError(
            `Driver "${driver.name}" has an expired license (expired ${new Date(driver.expiryDate).toDateString()}). Cannot dispatch.`,
            400
        );
    }

    // ── Rule 8: Driver must not be in another active trip ────────────────────
    if (await isDriverInActiveTrip(trip.driver, tripId)) {
        throw new AppError(
            `Driver "${driver.name}" is already assigned to another active trip.`,
            400
        );
    }

    // ── Rule 9: Cargo weight must not exceed vehicle capacity ────────────────
    if (trip.cargoWeight > vehicle.capacity) {
        throw new AppError(
            `Cargo weight (${trip.cargoWeight} tons) exceeds vehicle capacity (${vehicle.capacity} tons) for "${vehicle.registrationNumber}".`,
            400
        );
    }

    // ── All rules passed — commit state transitions ───────────────────────────
    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();
    await trip.save();

    return Trip.findById(tripId)
        .populate('vehicle', 'registrationNumber vehicleName status capacity')
        .populate('driver', 'name licenseNumber status');
};

/**
 * COMPLETE trip: Dispatched → Completed
 * Restores vehicle and driver to Available.
 */
exports.completeTrip = async (tripId, { actualDistance, fuelUsed }) => {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.status !== 'Dispatched') {
        throw new AppError(
            `Cannot complete a trip that is "${trip.status}". Only Dispatched trips can be completed.`,
            400
        );
    }

    // Restore vehicle
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
        vehicle.status = 'Available';
        await vehicle.save();
    }

    // Restore driver
    const driver = await Driver.findById(trip.driver);
    if (driver) {
        driver.status = 'Available';
        await driver.save();
    }

    // Update trip
    trip.status = 'Completed';
    trip.completedAt = new Date();
    trip.actualDistance = actualDistance;
    trip.fuelUsed = fuelUsed;
    await trip.save();

    return Trip.findById(tripId)
        .populate('vehicle', 'registrationNumber vehicleName status capacity')
        .populate('driver', 'name licenseNumber status');
};

/**
 * CANCEL trip: Draft → Cancelled (PRD lifecycle)
 * Only Draft trips can be cancelled — dispatched trips must be completed.
 */
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
