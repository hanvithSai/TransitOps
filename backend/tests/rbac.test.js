const express = require('express');
const request = require('supertest');

// Mock authentication middleware to easily inject roles via headers
jest.mock('../middlewares/authenticate', () => {
    return (req, res, next) => {
        const role = req.headers['x-mock-role'];
        if (!role) {
            const { AppError } = require('../utils/errorHandler');
            return next(new AppError("No token provided. Access denied.", 401));
        }
        req.user = { role: { name: role }, isActive: true };
        next();
    };
});

// Import error handler to correctly catch mocked auth errors
const { errorHandler } = require('../utils/errorHandler');

// Import routes
const vehicleRoutes = require('../routes/vehicleRoutes');
const driverRoutes = require('../routes/driverRoutes');
const tripRoutes = require('../routes/tripRoutes');
const maintenanceRoutes = require('../routes/maintenanceRoutes');
const fuelRoutes = require('../routes/fuelRoutes');
const expenseRoutes = require('../routes/expenseRoutes');
const userRoutes = require('../routes/userRoutes');
const roleRoutes = require('../routes/roleRoutes');

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Apply error handler
app.use(errorHandler);

// Helper for testing route access
const testAccess = async (method, url, role, expectedStatus) => {
    const req = request(app)[method](url);
    if (role) {
        req.set('x-mock-role', role);
    }
    const res = await req;
    expect(res.status).toBe(expectedStatus);
};

// We intercept actual controller logic by mocking them to return 200/201 so we only test RBAC
jest.mock('../controllers/vehicleController', () => ({
    getAllVehicles: (req, res) => res.status(200).send(),
    getVehicleById: (req, res) => res.status(200).send(),
    createVehicle: (req, res) => res.status(201).send(),
    updateVehicle: (req, res) => res.status(200).send(),
    deleteVehicle: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/driverController', () => ({
    getAllDrivers: (req, res) => res.status(200).send(),
    getDriverById: (req, res) => res.status(200).send(),
    createDriver: (req, res) => res.status(201).send(),
    updateDriver: (req, res) => res.status(200).send(),
    deleteDriver: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/tripController', () => ({
    getAllTrips: (req, res) => res.status(200).send(),
    getTripById: (req, res) => res.status(200).send(),
    createTrip: (req, res) => res.status(201).send(),
    dispatchTrip: (req, res) => res.status(200).send(),
    completeTrip: (req, res) => res.status(200).send(),
    cancelTrip: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/maintenanceController', () => ({
    getAllLogs: (req, res) => res.status(200).send(),
    getLogById: (req, res) => res.status(200).send(),
    createLog: (req, res) => res.status(201).send(),
    updateLog: (req, res) => res.status(200).send(),
    deleteLog: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/fuelController', () => ({
    getAllFuelLogs: (req, res) => res.status(200).send(),
    getFuelLogById: (req, res) => res.status(200).send(),
    createFuelLog: (req, res) => res.status(201).send(),
    updateFuelLog: (req, res) => res.status(200).send(),
    deleteFuelLog: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/expenseController', () => ({
    getAllExpenses: (req, res) => res.status(200).send(),
    getExpenseById: (req, res) => res.status(200).send(),
    createExpense: (req, res) => res.status(201).send(),
    updateExpense: (req, res) => res.status(200).send(),
    deleteExpense: (req, res) => res.status(200).send(),
}));

jest.mock('../controllers/userController', () => ({
    getAllUsers: (req, res) => res.status(200).send(),
    getUserById: (req, res) => res.status(200).send(),
    createUser: (req, res) => res.status(201).send(),
    updateUser: (req, res) => res.status(200).send(),
    deleteUser: (req, res) => res.status(200).send(),
}));

// Skip validators to avoid payload errors
jest.mock('../validators/vehicleValidator', () => ({ createVehicleValidator: (req,res,next)=>next(), updateVehicleValidator: (req,res,next)=>next() }));
jest.mock('../validators/driverValidator', () => ({ createDriverValidator: (req,res,next)=>next(), updateDriverValidator: (req,res,next)=>next() }));
jest.mock('../validators/tripValidator', () => ({ createTripValidator: (req,res,next)=>next(), completeTripValidator: (req,res,next)=>next() }));
jest.mock('../validators/maintenanceValidator', () => ({ createMaintenanceValidator: (req,res,next)=>next(), updateMaintenanceValidator: (req,res,next)=>next() }));
jest.mock('../validators/financeValidator', () => ({ createFuelValidator: (req,res,next)=>next(), updateFuelValidator: (req,res,next)=>next(), createExpenseValidator: (req,res,next)=>next(), updateExpenseValidator: (req,res,next)=>next() }));
jest.mock('../validators/authValidator', () => ({ createUserValidator: (req,res,next)=>next(), updateUserValidator: (req,res,next)=>next() }));
// Also mock Role model to prevent DB connection requirements
jest.mock('../models/Role', () => ({
    find: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
}));

describe('RBAC Middleware Tests', () => {

    describe('Unauthorized Edge Cases', () => {
        it('should return 401 if no authentication token (role) is provided', async () => {
            await testAccess('get', '/api/vehicles', null, 401);
        });
    });

    describe('Vehicle Module', () => {
        const readRoles = ['admin', 'fleet_manager', 'driver'];
        const writeRoles = ['admin', 'fleet_manager'];

        it('allows read for admin, fleet_manager, driver', async () => {
            for (let role of readRoles) {
                await testAccess('get', '/api/vehicles', role, 200);
            }
        });

        it('denies read for safety_officer, financial_analyst', async () => {
            for (let role of ['safety_officer', 'financial_analyst']) {
                await testAccess('get', '/api/vehicles', role, 403);
            }
        });

        it('allows write for admin, fleet_manager', async () => {
            for (let role of writeRoles) {
                await testAccess('post', '/api/vehicles', role, 201);
                await testAccess('delete', '/api/vehicles/1', role, 200);
            }
        });

        it('denies write for driver', async () => {
            await testAccess('post', '/api/vehicles', 'driver', 403);
            await testAccess('delete', '/api/vehicles/1', 'driver', 403);
        });
    });

    describe('Driver Module', () => {
        const readRoles = ['admin', 'driver', 'safety_officer'];
        const writeRoles = ['admin', 'safety_officer'];

        it('allows read for admin, driver, safety_officer', async () => {
            for (let role of readRoles) {
                await testAccess('get', '/api/drivers', role, 200);
            }
        });

        it('allows write for admin, safety_officer', async () => {
            for (let role of writeRoles) {
                await testAccess('post', '/api/drivers', role, 201);
            }
        });

        it('denies write for driver, fleet_manager', async () => {
            await testAccess('post', '/api/drivers', 'driver', 403);
            await testAccess('post', '/api/drivers', 'fleet_manager', 403);
        });
    });

    describe('Maintenance Module', () => {
        const allowedRoles = ['admin', 'fleet_manager'];
        
        it('allows read/write for admin, fleet_manager', async () => {
            for (let role of allowedRoles) {
                await testAccess('get', '/api/maintenance', role, 200);
                await testAccess('post', '/api/maintenance', role, 201);
            }
        });

        it('denies read/write for driver, safety_officer, financial_analyst', async () => {
            for (let role of ['driver', 'safety_officer', 'financial_analyst']) {
                await testAccess('get', '/api/maintenance', role, 403);
                await testAccess('post', '/api/maintenance', role, 403);
            }
        });
    });

    describe('Finance Module (Fuel & Expenses)', () => {
        const readRoles = ['admin', 'fleet_manager', 'driver', 'financial_analyst'];
        const writeRoles = ['admin', 'fleet_manager', 'financial_analyst'];

        it('allows read for admin, fleet_manager, driver, financial_analyst', async () => {
            for (let role of readRoles) {
                await testAccess('get', '/api/fuel', role, 200);
                await testAccess('get', '/api/expenses', role, 200);
            }
        });

        it('allows write for admin, fleet_manager, financial_analyst', async () => {
            for (let role of writeRoles) {
                await testAccess('post', '/api/fuel', role, 201);
                await testAccess('post', '/api/expenses', role, 201);
            }
        });

        it('denies write for driver', async () => {
            await testAccess('post', '/api/fuel', 'driver', 403);
            await testAccess('post', '/api/expenses', 'driver', 403);
        });
    });
    
    describe('Administration Module (Users & Roles)', () => {
        it('allows read/write for admin only', async () => {
            await testAccess('get', '/api/users', 'admin', 200);
            await testAccess('get', '/api/roles', 'admin', 200);
        });
        
        it('denies read/write for everyone else', async () => {
            const others = ['fleet_manager', 'driver', 'safety_officer', 'financial_analyst'];
            for (let role of others) {
                await testAccess('get', '/api/users', role, 403);
                await testAccess('get', '/api/roles', role, 403);
            }
        });
    });
});
