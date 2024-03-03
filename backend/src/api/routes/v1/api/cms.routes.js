const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/api/cms.controller')

router.route('/get-cms').get(controller.getCMS)

module.exports = router