const express = require('express');
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authenticate');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

const router = express.Router();

router.use(authenticate, requirePasswordUpdated);

router.get('/roi', reportController.getROIReport);
router.get('/roi/download', reportController.downloadROICSV);

module.exports = router;
