const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/product.controller.js')
const { uploadSingle } = require('../../../utils/upload')

router.route('/create').post(uploadSingle, controller.create)
router.route('/edit').put(uploadSingle, controller.edit)
router.route('/delete/:productId').delete(controller.delete)
router.route('/get/:productId').get(controller.get)
router.route('/list').post(controller.list)

router.route('/list-variations').get(controller.listVariations)
router.route('/list-variations/:productId').get(controller.listVariations)
router.route('/deleteVariation/:variationId').post(controller.deleteVariation)
router.route('/updateVariation').put(controller.updateVariation)
router.route('/addVariation').post(controller.addVariation)

module.exports = router