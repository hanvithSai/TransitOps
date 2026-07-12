const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All report routes require authentication

router.get('/roi', reportController.getROIReport);
router.get('/roi/download', reportController.downloadROICSV);

module.exports = router;
