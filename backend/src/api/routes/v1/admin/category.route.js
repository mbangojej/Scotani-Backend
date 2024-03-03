const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/category.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create').post(controller.create)
router.route('/edit').put( controller.edit)
router.route('/delete/:categoryId').delete(controller.delete)
router.route('/get/:categoryId').get(controller.get)
router.route('/list').post(controller.list)
router.route('/parent-categories').get(controller.parentCategories)
module.exports = router