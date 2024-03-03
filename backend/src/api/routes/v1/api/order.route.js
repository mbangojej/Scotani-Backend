const express = require('express');
const controller = require('../../../controllers/api/order.controller.js');
const router = express.Router();

router.route('/history').get(controller.orderHistory);
router.route('/delete').get(controller.orderDelete);
router.route('/get-size-group').get(controller.sizeGroup);
router.route('/re-order').get(controller.reorder);
router.route('/details/:orderId').get(controller.orderDetail);
router.route('/checkout').post(controller.checkout);
router.route('/confirm-transaction').post(controller.confirmTransaction);
router.route('/cancel-order').post(controller.cancelOrder);
module.exports = router;