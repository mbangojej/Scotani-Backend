const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/customers.controller')

router.route('/create').post(controller.create)
router.route('/edit/:customerId').put(controller.edit)
router.route('/list').post(controller.list)
router.route('/delete/:customerId').delete(controller.delete)
router.route('/:customerId').get(controller.get)
router.route('/send-verification-email/:userId').post(controller.sendVerificationEmail);


module.exports = router