const express = require('express')
const stripeRoutes = require('./stripe.route')
const router = express.Router()
/**
 * GET v1/status
 */
router.use('/stripe', stripeRoutes)
module.exports = router
