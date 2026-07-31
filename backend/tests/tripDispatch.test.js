const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const tripService = require('../services/tripService');

describe('tripService.createTrip', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('rejects create when vehicle does not exist', async () => {
        jest.spyOn(Vehicle, 'findById').mockResolvedValue(null);

        await expect(
            tripService.createTrip(
                {
                    source: 'A',
                    destination: 'B',
                    vehicle: '507f1f77bcf86cd799439011',
                    driver: '507f1f77bcf86cd799439012',
                    cargoWeight: 1000,
                    plannedDistance: 100,
                },
                '507f1f77bcf86cd799439013'
            )
        ).rejects.toMatchObject({ message: 'Vehicle not found', statusCode: 404 });
    });

    it('rejects create when driver does not exist', async () => {
        jest.spyOn(Vehicle, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
        jest.spyOn(Driver, 'findById').mockResolvedValue(null);

        await expect(
            tripService.createTrip(
                {
                    source: 'A',
                    destination: 'B',
                    vehicle: '507f1f77bcf86cd799439011',
                    driver: '507f1f77bcf86cd799439012',
                    cargoWeight: 1000,
                    plannedDistance: 100,
                },
                '507f1f77bcf86cd799439013'
            )
        ).rejects.toMatchObject({ message: 'Driver not found', statusCode: 404 });
    });
});
