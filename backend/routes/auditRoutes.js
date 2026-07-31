const router = require('express').Router();
const auditController = require('../controllers/auditController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

router.use(authenticate, requirePasswordUpdated);
router.get('/', authorize('admin'), auditController.getAuditLogs);

module.exports = router;
