const express = require('express');
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

const router = express.Router();

router.use(authenticate, requirePasswordUpdated);

router.get(
    '/roi',
    authorize('admin', 'financial_analyst', 'fleet_manager', 'reports:read'),
    reportController.getROIReport
);
router.get(
    '/roi/download',
    authorize('admin', 'financial_analyst', 'fleet_manager', 'reports:read'),
    reportController.downloadROICSV
);
router.get(
    '/roi/download-pdf',
    authorize('admin', 'financial_analyst', 'fleet_manager', 'reports:read'),
    reportController.downloadROIPDF
);

module.exports = router;
