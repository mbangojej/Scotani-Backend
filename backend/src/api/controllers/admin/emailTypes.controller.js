const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const emailType = require('../../models/emailTypes.model')
const { uploadToCloudinary } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')



// API to create Language
exports.create = async (req, res, next) => {
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
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        let { title} = req.body
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if(title){
            title = title.trim()
            filter.title = { $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'gi' };
        }


        const total = await emailType.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const emailTemplate = await emailType.aggregate([
            { $match : filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, title: 1
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

// API to edit Language
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const emailTypes = await emailType.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Email Template updated successfully', emailTypes })
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
            const emailTypes = await emailType.deleteOne({ _id: languageId })
            if (emailTypes && emailTypes.deletedCount)
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
            const emailTypes = await emailType.findOne({ _id: languageId }, { _id: 1, title: 1 }).lean(true)
            if (emailTypes)
                return res.json({ success: true, emailTypes })
            else return res.status(400).send({ success: false, message: 'Email Template not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Email Template Id is required' })
    } catch (error) {
        return next(error)
    }
}