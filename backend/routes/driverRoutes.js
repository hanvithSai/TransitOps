const express = require('express');
const router = require('express').Router();
const driverController = require('../controllers/driverController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { createDriverValidator, updateDriverValidator } = require('../validators/driverValidator');

// Apply authentication to all driver routes
router.use(authenticate);

// GET /api/drivers (Accessible by admin, dispatcher, safety_officer)
router.get('/', authorize('admin', 'dispatcher', 'safety_officer'), driverController.getAllDrivers);

// GET /api/drivers/:id (Accessible by admin, dispatcher, safety_officer)
router.get('/:id', authorize('admin', 'dispatcher', 'safety_officer'), driverController.getDriverById);

// POST /api/drivers (Accessible by admin, safety_officer)
router.post(
  '/',
  authorize('admin', 'safety_officer'),
  createDriverValidator,
  driverController.createDriver
);

// PUT /api/drivers/:id (Accessible by admin, safety_officer)
router.put(
  '/:id',
  authorize('admin', 'safety_officer'),
  updateDriverValidator,
  driverController.updateDriver
);

// DELETE /api/drivers/:id (Accessible by admin, safety_officer)
router.delete('/:id', authorize('admin', 'safety_officer'), driverController.deleteDriver);

module.exports = router;
