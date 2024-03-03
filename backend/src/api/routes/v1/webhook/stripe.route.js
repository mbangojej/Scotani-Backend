const express = require('express');
const controller = require('../../../controllers/webhook/stripe.controller.js');
const router = express.Router();

router.route('/refund-update').get(controller.refundUpdateWebhook);
router.route('/refund-update').post(controller.refundUpdateWebhook);

module.exports = router;