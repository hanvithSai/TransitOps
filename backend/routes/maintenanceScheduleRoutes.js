const router = require('express').Router();
const controller = require('../controllers/maintenanceScheduleController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const requirePasswordUpdated = require('../middlewares/requirePasswordUpdated');

router.use(authenticate, requirePasswordUpdated);

router.get('/', authorize('admin', 'fleet_manager', 'maintenance:read'), controller.list);
router.post('/', authorize('admin', 'fleet_manager', 'maintenance:write'), controller.create);
router.put('/:id', authorize('admin', 'fleet_manager', 'maintenance:write'), controller.update);
router.delete('/:id', authorize('admin', 'fleet_manager', 'maintenance:write'), controller.remove);

module.exports = router;
