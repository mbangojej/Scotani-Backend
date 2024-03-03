const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/designImprint.controller')

router.route('/create').post(controller.create)
router.route('/edit').put(controller.edit)
router.route('/delete/:designImprintId').delete(controller.delete)
router.route('/get/:designImprintId').get(controller.get)
router.route('/list').post(controller.list)

module.exports = router