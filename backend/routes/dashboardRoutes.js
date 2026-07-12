const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
