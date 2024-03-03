const express = require('express');
const controller = require('../../../controllers/api/designImprint.controller');
const router = express.Router();

router.route('/list').get(controller.list);
module.exports = router;