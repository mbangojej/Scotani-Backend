const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/report.controller')

router.route('/salesReport').post(controller.salesReport)
router.route('/invoiceReport').post(controller.invoiceReport)


module.exports = router