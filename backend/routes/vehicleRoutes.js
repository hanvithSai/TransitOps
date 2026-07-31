const express = require('express');
const router = require('express').Router();
const vehicleController = require('../controllers/vehicleController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');
const { createVehicleValidator, updateVehicleValidator } = require('../validators/vehicleValidator');

// Apply authentication to all vehicle routes
router.use(authenticate, requirePasswordUpdated);

// GET /api/vehicles (Accessible by admin, fleet_manager, driver)
router.get('/', authorize('admin', 'fleet_manager', 'driver', 'vehicles:read'), vehicleController.getAllVehicles);

// GET /api/vehicles/:id (Accessible by admin, fleet_manager, driver)
router.get('/:id', authorize('admin', 'fleet_manager', 'driver', 'vehicles:read'), vehicleController.getVehicleById);

// POST /api/vehicles (Accessible by admin, fleet_manager)
router.post(
  '/',
  authorize('admin', 'fleet_manager', 'vehicles:write'),
  createVehicleValidator,
  vehicleController.createVehicle
);

// PUT /api/vehicles/:id (Accessible by admin, fleet_manager)
router.put(
  '/:id',
  authorize('admin', 'fleet_manager', 'vehicles:write'),
  updateVehicleValidator,
  vehicleController.updateVehicle
);

// DELETE /api/vehicles/:id (Accessible by admin, fleet_manager as requested)
router.delete('/:id', authorize('admin', 'fleet_manager', 'vehicles:write'), vehicleController.deleteVehicle);

module.exports = router;
