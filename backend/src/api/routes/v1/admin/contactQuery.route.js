const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/contactQuery.controller')

router.route('/create').post(controller.create)
router.route('/respondToQuery/:contactQueryId').put(controller.respondToQuery)
router.route('/list').post(controller.list)
router.route('/delete/:contactQueryId').delete(controller.delete)
router.route('/:contactQueryId').get(controller.get)

module.exports = router