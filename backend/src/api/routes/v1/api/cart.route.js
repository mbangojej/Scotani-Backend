const express = require('express');
const controller = require('../../../controllers/api/cart.controller.js');
const router = express.Router();

router.route('/add-to-cart').post(controller.addToCart);
router.route('/remove-from-cart').post(controller.removeFromCart);
router.route('/update-cart-quantity').post(controller.updateCartQuantity);
router.route('/list').get(controller.list);
router.route('/validate-coupon').post(controller.validateCoupon);

module.exports = router;