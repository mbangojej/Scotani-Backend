const express = require('express');
const controller = require('../../../controllers/cron/index.controller');
const router = express.Router();

router.route('/mark-customers-for-deletion').get(controller.markCustomersForDeletion);
module.exports = router;