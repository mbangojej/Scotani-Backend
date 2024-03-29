const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/cms.controller')
const { cpUpload, uploadSingle,uploadContentImage } = require('../../../utils/upload')

router.route('/create').post(uploadSingle, controller.create)
router.route('/upload').post(uploadContentImage, controller.uploadContentPageImg)
router.route('/edit').put(uploadSingle, controller.edit)
router.route('/delete/:contentId').delete(controller.delete)
router.route('/get/:contentId').get(controller.get)
router.route('/list').post(controller.list)

module.exports = router