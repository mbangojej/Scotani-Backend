const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/emailTemplates.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create/email/type').post(cpUpload, controller.createEmailTypes)
router.route('/list/email/type').post(controller.listEmailType)




router.route('/create').post(cpUpload, controller.create)
router.route('/edit').put(cpUpload, controller.edit)
router.route('/delete/:languageId').delete(controller.delete)
router.route('/get/:languageId').get(controller.get)
router.route('/list').post(controller.list)

module.exports = router