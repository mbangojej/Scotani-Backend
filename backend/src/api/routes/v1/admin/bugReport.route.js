const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/bugReport.controller')

router.route('/list').post(controller.list)
router.route('/respondToBugReport/:bugReportId').put(controller.edit)


module.exports = router