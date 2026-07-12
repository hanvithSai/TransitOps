const express = require('express');
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.use(authenticate); // All report routes require authentication

router.get('/roi', reportController.getROIReport);
router.get('/roi/download', reportController.downloadROICSV);

module.exports = router;
