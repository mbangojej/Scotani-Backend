const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const emailType = require('../../models/emailTypes.model')
const EmailTemplates = require('../../models/emailTemplates.model')
const { uploadToCloudinary } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')



// API to create Language
exports.createEmailTypes = async (req, res, next) => {
    try {
        let payload = req.body

        const emailTypes = await emailType.create(payload)
        return res.send({ success: true, message: 'Email type created successfully', emailTypes })
    } catch (error) {

        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Email Type')
        else
            return next(error)
    }
}


// API to get Email Type list
exports.listEmailType = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        let { code, title } = req.body
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (code !== undefined) {
            filter.code = code
        }
        if (title !== undefined) {
            filter.title = title
        }
        const total = await emailType.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const emailTemplate = await emailType.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1, code: 1, title: 1
                }
            }
        ])

        return res.send({
            success: true,
            data: {
                emailTemplate,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}

// API to create Language
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const emailTemplates = await EmailTemplates.create(payload)
        return res.send({ success: true, message: 'Email Templates created successfully', emailTemplates })
    } catch (error) {

        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Email Templates')
        else
            return next(error)
    }
}

// API to edit Language
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const emailTemplates = await EmailTemplates.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Email Template updated successfully', emailTemplates })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Email Templates')
        else
            return next(error)
    }
}

// API to delete language
exports.delete = async (req, res, next) => {
    try {
        const { languageId } = req.params
        if (languageId) {
            const emailTemplates = await EmailTemplates.deleteOne({ _id: languageId })
            if (emailTemplates && emailTemplates.deletedCount)
                return res.send({ success: true, message: 'Email Templates deleted successfully', languageId })
            else return res.status(400).send({ success: false, message: 'Email Templates not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Email Template Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Language
exports.get = async (req, res, next) => {
    try {
        const { languageId } = req.params
        if (languageId) {
            const emailTemplates = await EmailTemplates.findOne({ _id: languageId }, { _id: 1, title: 1, type: 1, subject: 1, content: 1, subjectDE: 1, contentDE: 1 }).lean(true)
            if (emailTemplates)
                return res.json({ success: true, emailTemplates })
            else return res.status(400).send({ success: false, message: 'Email Template not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Email Template Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get language list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        let { type, title, content, subject } = req.body
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (type !== undefined) {
            filter.type = type
        }

        if (title) {
            title = title.trim()
            filter.title = { $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }

        if (content !== undefined) {
            filter.content = content
        }
        if (subject !== undefined) {
            subject = subject.trim()
            filter.subject = { $regex: subject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }

        const total = await EmailTemplates.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const emailTemplate = await EmailTemplates.aggregate([
            { $match: filter },
            { $sort: { subject: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, type: 1, title: 1, subject: 1, content: 1
                }
            }
        ])

        return res.send({
            success: true,
            data: {
                emailTemplate,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}