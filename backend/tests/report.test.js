const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const reportService = require('../services/reportService');

const VEHICLE_ID = '507f1f77bcf86cd799439011';

describe('reportService.getVehicleROI', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('calculates ROI as revenue minus operational costs', async () => {
        jest.spyOn(Vehicle, 'find').mockReturnValue({
            lean: jest.fn().mockResolvedValue([{
                _id: VEHICLE_ID,
                registrationNumber: 'MH12AB1234',
                vehicleName: 'Truck 1',
            }]),
        });

        jest.spyOn(Trip, 'aggregate').mockResolvedValue([
            { _id: VEHICLE_ID, totalRevenue: 100000 },
        ]);
        jest.spyOn(Expense, 'aggregate').mockResolvedValue([
            { _id: VEHICLE_ID, totalExpense: 5000 },
        ]);
        jest.spyOn(FuelLog, 'aggregate').mockResolvedValue([
            { _id: VEHICLE_ID, totalFuelCost: 15000 },
        ]);
        jest.spyOn(MaintenanceLog, 'aggregate').mockResolvedValue([
            { _id: VEHICLE_ID, totalMaintenance: 3000 },
        ]);

        const [row] = await reportService.getVehicleROI();

        expect(row.revenue).toBe(100000);
        expect(row.expenses).toBe(5000);
        expect(row.fuel).toBe(15000);
        expect(row.maintenance).toBe(3000);
        expect(row.operationalCost).toBe(23000);
        expect(row.roi).toBe(77000);
    });

    it('returns zero ROI when vehicle has no financial activity', async () => {
        jest.spyOn(Vehicle, 'find').mockReturnValue({
            lean: jest.fn().mockResolvedValue([{
                _id: VEHICLE_ID,
                registrationNumber: 'MH12AB1234',
                vehicleName: 'Truck 1',
            }]),
        });

        jest.spyOn(Trip, 'aggregate').mockResolvedValue([]);
        jest.spyOn(Expense, 'aggregate').mockResolvedValue([]);
        jest.spyOn(FuelLog, 'aggregate').mockResolvedValue([]);
        jest.spyOn(MaintenanceLog, 'aggregate').mockResolvedValue([]);

        const [row] = await reportService.getVehicleROI();

        expect(row.revenue).toBe(0);
        expect(row.operationalCost).toBe(0);
        expect(row.roi).toBe(0);
    });
});

describe('reportService.generateCSV', () => {
    it('escapes string values and produces valid CSV rows', () => {
        const csv = reportService.generateCSV([
            { name: 'Truck "Alpha"', roi: 100 },
        ]);

        expect(csv).toContain('name,roi');
        expect(csv).toContain('"Truck ""Alpha"""');
        expect(csv).toContain('100');
    });

    it('returns empty string for empty data', () => {
        expect(reportService.generateCSV([])).toBe('');
        expect(reportService.generateCSV(null)).toBe('');
    });
});
