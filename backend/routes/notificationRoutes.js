const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

router.use(authenticate, requirePasswordUpdated);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
