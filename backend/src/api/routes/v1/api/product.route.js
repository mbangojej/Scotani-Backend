const express = require('express');
const controller = require('../../../controllers/api/product.controller.js');
const router = express.Router();

router.route('/list-products').post(controller.listProducts);
router.route('/list-categories').get(controller.listCategories);
router.route('/get-variantion-price').get(controller.getVariationPrice);
router.route('/detail').post(controller.productDetail);
router.route('/get-colors').get(controller.getColors);
module.exports = router;