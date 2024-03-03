const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/order.controller')

router.route('/create').post(controller.create)
router.route('/list').post(controller.list)
router.route('/get/:orderId').get(controller.get)
router.route('/edit').put(controller.edit)
router.route('/updateStatus/:orderId/:status').post(controller.updateStatus)
router.route('/generateInvoice/:orderId').post(controller.generateInvoice)
router.route('/getInvoice/:orderId').get(controller.getInvoice)
router.route('/registerPayment').put(controller.registerPayment)
router.route('/validate/coupon').put(controller.validateCoupon)
router.route('/refundAmount').post(controller.refundAmount)

module.exports = router