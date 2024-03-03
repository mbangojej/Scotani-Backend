const CMS = require('../../models/cms.model')
const { checkDuplicate } = require('../../../config/errors')

// API to get a CMS
exports.getCMS = async (req, res, next) => {
    try {
        const { slug } = req.body
        if (slug) {
            const content = await CMS.findOne({ slug: slug, status: true }, { _id: 1, title: 1, description: 1 }).lean(true)
            if (content)
                return res.status(200).send({
                    status: 1,
                    message: 'CMS fetch successfully',
                    content
                });
            else return res.status(400).send({ success: false, message: 'CMS not found for given slug' })
        } else
            return res.status(400).send({ success: false, message: 'CMS slug is required', param: req.params })
    } catch (error) {
        return next(error)
    }
}
