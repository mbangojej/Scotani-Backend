const express = require('express')
const customerRoutes = require('./customer.route')
const adminRoutes = require('./admin.route')
const roleRoutes = require('./roles.route')
const settingsRoutes = require('./settings.route')
const faqRoutes = require('./faq.route')
const faqCategoryRoutes = require('./faqCategory.route')
const sizeGroupRoutes = require('./sizeGroups.route')
const cmsRoutes = require('./cms.routes')
const contactQueryRoutes = require('./contactQuery.route')
const productRoutes = require("./product.route")
const emailTemplateRoutes = require("./emailTemplates.route")
const emailTypeRoutes = require("./emailTypes.route")
const orderRoutes = require("./order.route")
const reportRoutes = require("./report.route")
const categoryRoutes = require("./category.route")
const promotionRoutes = require("./promotion.route")
const bugReportRoutes = require("./bugReport.route")
const designImprintRotues = require("./designImprint.route")


const router = express.Router()

/**
 * GET v1/admin
 */
router.use('/staff', adminRoutes)
router.use('/role', roleRoutes)
router.use('/customer', customerRoutes)
router.use('/category', categoryRoutes)
router.use('/settings', settingsRoutes)
router.use('/faq', faqRoutes)
router.use('/faqCategory', faqCategoryRoutes)
router.use('/sizeGroup', sizeGroupRoutes)
router.use('/content', cmsRoutes)
router.use('/product', productRoutes)
router.use('/template', emailTemplateRoutes)
router.use('/emailType', emailTypeRoutes)
router.use('/order', orderRoutes)
router.use('/report', reportRoutes)
router.use('/promotion', promotionRoutes)
router.use('/contactUsQuery', contactQueryRoutes)
router.use('/bugReport', bugReportRoutes)
router.use('/designImprint', designImprintRotues)



module.exports = router
