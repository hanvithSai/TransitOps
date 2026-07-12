const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { createFuelValidator, updateFuelValidator } = require('../validators/financeValidator');

// Protect all routes
router.use(authenticate);

// GET /api/fuel
router.get(
    '/',
    authorize('admin', 'fleet_manager', 'dispatcher'),
    fuelController.getAllFuelLogs
);

// GET /api/fuel/:id
router.get(
    '/:id',
    authorize('admin', 'fleet_manager', 'dispatcher'),
    fuelController.getFuelLogById
);

// POST /api/fuel
router.post(
    '/',
    authorize('admin', 'fleet_manager'),
    createFuelValidator,
    fuelController.createFuelLog
);

// PUT /api/fuel/:id
router.put(
    '/:id',
    authorize('admin', 'fleet_manager'),
    updateFuelValidator,
    fuelController.updateFuelLog
);

// DELETE /api/fuel/:id
router.delete(
    '/:id',
    authorize('admin', 'fleet_manager'),
    fuelController.deleteFuelLog
);

module.exports = router;
