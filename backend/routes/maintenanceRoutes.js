const express = require('express');
const router = require('express').Router();
const maintenanceController = require('../controllers/maintenanceController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { createMaintenanceValidator, updateMaintenanceValidator } = require('../validators/maintenanceValidator');

// Apply authentication to all maintenance routes
router.use(authenticate);

// All maintenance routes are restricted to admin and fleet_manager
router.use(authorize('admin', 'fleet_manager'));

// GET /api/maintenance
router.get('/', maintenanceController.getAllLogs);

// GET /api/maintenance/:id
router.get('/:id', maintenanceController.getLogById);

// POST /api/maintenance
router.post('/', createMaintenanceValidator, maintenanceController.createLog);

// PUT /api/maintenance/:id
router.put('/:id', updateMaintenanceValidator, maintenanceController.updateLog);

// DELETE /api/maintenance/:id
router.delete('/:id', maintenanceController.deleteLog);

module.exports = router;
