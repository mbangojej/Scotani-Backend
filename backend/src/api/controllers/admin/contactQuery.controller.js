const ContactQuery = require('../../models/contactQuery.model')
const { checkDuplicate } = require('../../../config/errors')
const Settings = require('../../models/settings.model')
const { sendEmail } = require('../../utils/emails/emails')

// API to create ContactQuery
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        
        const contactQuery = await ContactQuery.create(payload)
        return res.send({ success: true, message: 'ContactQuery created successfully', data: contactQuery })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'ContactQuery')
        else
            return next(error)
    }
}

// API to edit ContactQuery
exports.respondToQuery = async (req, res, next) => {
    try {
        let payload = req.body
        const { contactQueryId } = req.params
        if (contactQueryId) {
            const contactUsQuery = await ContactQuery.findByIdAndUpdate({ _id: contactQueryId }, { $set: payload }, { new: true })
           
            let adminEmails = await Settings.findOne({}, 'inquiryEmail')
            adminEmails = adminEmails.inquiryEmail
            adminEmails = adminEmails.split(",")

            let emailData = {
                name: contactUsQuery.name,
                email: contactUsQuery.email,
                phone: contactUsQuery.phone,
                subject: contactUsQuery.subject,
                message: contactUsQuery.message,
                response: contactUsQuery.response,
                bcc: adminEmails,
            }
            sendEmail('contact_query_response', emailData)
           
            return res.send({ success: true, message: 'ContactQuery updated successfully', contactUsQuery })
        }
        else
            return res.status(400).send({ success: false, message: 'ContactQueryId is required' })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'ContactQuery')
        else
            return next(error)
    }
}

// API to delete contactQuery
exports.delete = async (req, res, next) => {
    try {
        const { contactQueryId } = req.params
        if (contactQueryId) {
            const contactQuery = await ContactQuery.deleteOne({ _id: contactQueryId })
            if (contactQuery && contactQuery.deletedCount)
                return res.send({ success: true, message: 'ContactQuery deleted successfully', contactQueryId })
            else return res.status(400).send({ success: false, message: 'ContactQuery not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'ContactQuery Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a ContactQuery
exports.get = async (req, res, next) => {
    try {
        const { contactQueryId } = req.params
        if (contactQueryId) {
            const contactQuery = await ContactQuery.findOne({ _id: contactQueryId }, { _id: 1, name: 1, email: 1, phone: 1, subject: 1, status: 1, message: 1 }).lean(true)
            if (contactQuery)
                return res.json({ success: true, contactQuery })
            else return res.status(400).send({ success: false, message: 'ContactQuery not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'ContactQuery Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get ContactQuery list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        let { name, status, isDefault } = req.body
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        // if(name){
        //     name = name.trim()
        //     filter.name = { $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'gi' };
        // }
        // if(status !== undefined){
        //     filter.status = status == 'true' ? true : false
        // }
        // if(isDefault !== undefined){
        //     filter.isDefault = isDefault == 'true' ? true : false
        // }

        const total = await ContactQuery.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


            
        const contactUsQueries = await ContactQuery.aggregate([
            { $match : filter },
            { $sort: { createdAt: 1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, name: 1, email: 1, phone: 1, subject: 1, status: 1, message: 1, response:1,
                }
            }
        ])


        return res.send({
            success: true,
            data: {
                contactUsQueries,
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