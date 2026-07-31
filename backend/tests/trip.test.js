const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const tripService = require('../services/tripService');

const TRIP_ID = '507f1f77bcf86cd799439011';
const VEHICLE_ID = '507f1f77bcf86cd799439012';
const DRIVER_ID = '507f1f77bcf86cd799439013';

const mockFindById = (Model, result) => {
    jest.spyOn(Model, 'findById').mockReturnValue({
        session: jest.fn().mockResolvedValue(result),
    });
};

const mockExists = (vehicleResult, driverResult = null) => {
    jest.spyOn(Trip, 'exists').mockReturnValue({
        session: jest.fn()
            .mockResolvedValueOnce(vehicleResult)
            .mockResolvedValueOnce(driverResult),
    });
};

const freshFixtures = () => ({
    trip: {
        _id: TRIP_ID,
        status: 'Draft',
        vehicle: VEHICLE_ID,
        driver: DRIVER_ID,
        cargoWeight: 5000,
        save: jest.fn().mockResolvedValue(true),
    },
    vehicle: {
        _id: VEHICLE_ID,
        registrationNumber: 'MH12AB1234',
        status: 'Available',
        capacity: 10000,
        save: jest.fn().mockResolvedValue(true),
    },
    driver: {
        _id: DRIVER_ID,
        name: 'Test Driver',
        status: 'Available',
        expiryDate: new Date(Date.now() + 86400000 * 365),
        save: jest.fn().mockResolvedValue(true),
    },
});

describe('tripService._applyDispatchRules', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('dispatches when all rules pass', async () => {
        const { trip, vehicle, driver } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, vehicle);
        mockFindById(Driver, driver);
        mockExists(null, null);

        const result = await tripService._applyDispatchRules(TRIP_ID);

        expect(result.status).toBe('Dispatched');
        expect(vehicle.status).toBe('On Trip');
        expect(driver.status).toBe('On Trip');
    });

    it('rejects non-Draft trips', async () => {
        const { trip } = freshFixtures();
        mockFindById(Trip, { ...trip, status: 'Dispatched' });

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it('rejects retired vehicles', async () => {
        const { trip, vehicle } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, { ...vehicle, status: 'Retired' });

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            message: expect.stringContaining('Retired'),
            statusCode: 400,
        });
    });

    it('rejects vehicles in shop', async () => {
        const { trip, vehicle } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, { ...vehicle, status: 'In Shop' });

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            message: expect.stringContaining('In Shop'),
            statusCode: 400,
        });
    });

    it('rejects unavailable vehicles', async () => {
        const { trip, vehicle } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, { ...vehicle, status: 'On Trip' });

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it('rejects vehicles already on another active trip', async () => {
        const { trip, vehicle, driver } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, vehicle);
        mockExists({ _id: 'other-trip' });

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            message: expect.stringContaining('already assigned'),
            statusCode: 400,
        });
    });

    it('rejects suspended drivers', async () => {
        const { trip, vehicle, driver } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, vehicle);
        mockFindById(Driver, { ...driver, status: 'Suspended' });
        mockExists(null, null);

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            message: expect.stringContaining('Suspended'),
            statusCode: 400,
        });
    });

    it('rejects drivers with expired licenses', async () => {
        const { trip, vehicle, driver } = freshFixtures();
        mockFindById(Trip, trip);
        mockFindById(Vehicle, vehicle);
        mockFindById(Driver, { ...driver, expiryDate: new Date('2020-01-01') });
        mockExists(null, null);

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it('rejects cargo exceeding vehicle capacity', async () => {
        const { trip, vehicle, driver } = freshFixtures();
        mockFindById(Trip, { ...trip, cargoWeight: 15000 });
        mockFindById(Vehicle, vehicle);
        mockFindById(Driver, driver);
        mockExists(null, null);

        await expect(tripService._applyDispatchRules(TRIP_ID)).rejects.toMatchObject({
            message: expect.stringContaining('capacity'),
            statusCode: 400,
        });
    });
});

describe('tripService.dispatchTrip', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('wraps dispatch in a MongoDB transaction', async () => {
        const withTransaction = jest.fn(async (fn) => fn());
        const endSession = jest.fn();

        jest.spyOn(mongoose, 'startSession').mockResolvedValue({
            withTransaction,
            endSession,
        });

        jest.spyOn(tripService, '_applyDispatchRules').mockResolvedValue({ _id: TRIP_ID });

        const populatedTrip = { _id: TRIP_ID, status: 'Dispatched' };
        jest.spyOn(Trip, 'findById').mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(populatedTrip),
            }),
        });

        await tripService.dispatchTrip(TRIP_ID);

        expect(withTransaction).toHaveBeenCalled();
        expect(endSession).toHaveBeenCalled();
        expect(tripService._applyDispatchRules).toHaveBeenCalledWith(TRIP_ID, expect.anything());
    });
});
