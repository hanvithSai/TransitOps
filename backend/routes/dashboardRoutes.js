const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

const router = express.Router();

router.use(authenticate, requirePasswordUpdated);

router.get(
    '/stats',
    authorize('admin', 'fleet_manager', 'driver', 'safety_officer', 'financial_analyst'),
    dashboardController.getDashboardStats
);

module.exports = router;
