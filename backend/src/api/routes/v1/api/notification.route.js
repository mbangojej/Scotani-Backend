const express = require('express');
const controller = require('../../../controllers/api/notification.controller');
const router = express.Router();

router.route('/list').get(controller.list);
router.route('/change-status').post(controller.updateStatusForCustomer);
router.route('/change-notification-status').post(controller.updateNotificationStatus);
router.route('/test-notification').get(controller.testNotification);
module.exports = router;