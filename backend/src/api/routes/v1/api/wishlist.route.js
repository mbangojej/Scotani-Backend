const express = require('express');
const controller = require('../../../controllers/api/wishlist.controller.js');
const router = express.Router();

router.route('/add-to-wishlist').post(controller.addToWishlist);
router.route('/list').get(controller.list);
router.route('/remove-from-whishlist').post(controller.delete)


module.exports = router;