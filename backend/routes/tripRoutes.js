const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { createTripValidator, completeTripValidator } = require('../validators/tripValidator');

// Protect all routes
router.use(authenticate);

// GET /api/trips
router.get(
    '/',
    authorize('admin', 'fleet_manager', 'driver', 'safety_officer'),
    tripController.getAllTrips
);

// GET /api/trips/:id
router.get(
    '/:id',
    authorize('admin', 'fleet_manager', 'driver', 'safety_officer'),
    tripController.getTripById
);

// POST /api/trips (Create Draft)
router.post(
    '/',
    authorize('admin', 'driver'),
    createTripValidator,
    tripController.createTrip
);

// PUT /api/trips/:id/dispatch (Draft -> Dispatched)
router.put(
    '/:id/dispatch',
    authorize('admin', 'driver'),
    tripController.dispatchTrip
);

// PUT /api/trips/:id/complete (Dispatched -> Completed)
router.put(
    '/:id/complete',
    authorize('admin', 'driver', 'fleet_manager'),
    completeTripValidator,
    tripController.completeTrip
);

// PUT /api/trips/:id/cancel (Draft -> Cancelled)
router.put(
    '/:id/cancel',
    authorize('admin', 'driver'),
    tripController.cancelTrip
);

module.exports = router;
