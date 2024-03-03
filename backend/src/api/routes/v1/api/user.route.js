const express = require('express');
const controller = require('../../../controllers/api/user.controller.js');
const router = express.Router();

router.route('/edit-profile').put(controller.editProfile);
router.route('/get-profile').get(controller.getProfile);
module.exports = router;