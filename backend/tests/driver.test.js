const driverService = require('../services/driverService');
const Driver = require('../models/Driver');

describe('driverService status restrictions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('blocks non–safety-officer from setting Suspended on update', async () => {
        await expect(
            driverService.updateDriver('507f1f77bcf86cd799439011', { status: 'Suspended' }, 'admin')
        ).rejects.toMatchObject({
            statusCode: 403,
            message: expect.stringContaining('Suspended'),
        });
    });

    it('allows safety_officer to set Suspended on update', async () => {
        const saved = { _id: '507f1f77bcf86cd799439011', status: 'Suspended' };
        jest.spyOn(Driver, 'findByIdAndUpdate').mockResolvedValue(saved);

        const result = await driverService.updateDriver(
            '507f1f77bcf86cd799439011',
            { status: 'Suspended' },
            'safety_officer'
        );

        expect(result.status).toBe('Suspended');
    });

    it('blocks non–safety-officer from creating Suspended drivers', async () => {
        await expect(
            driverService.createDriver(
                { licenseNumber: 'DL123', name: 'Test', status: 'Suspended' },
                'admin'
            )
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('blocks manual On Trip status', async () => {
        await expect(
            driverService.updateDriver('507f1f77bcf86cd799439011', { status: 'On Trip' }, 'safety_officer')
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});
