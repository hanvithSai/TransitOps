const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

const router = express.Router();

router.use(authenticate, requirePasswordUpdated);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
