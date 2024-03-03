const BugReport = require('../../models/bugReport.model')
const Settings = require('../../models/settings.model')
const fs = require('fs')
const mongoose = require('mongoose');
const moment = require('moment')
var xl = require('excel4node');
const { sendEmail } = require('../../utils/emails/emails')

// API for Issue Bug Report Listing
exports.list = async (req, res, next) => {
    try {

        let { page, limit } = req.query
        let { customer, name, email, status } = req.body
        let filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (customer) {
            filter.customer = mongoose.Types.ObjectId(customer);
        }

        if (name && name != undefined && name != 'undefined')
            filter.name = new RegExp(name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
        if (email && email != undefined && email != 'undefined')
            filter.email = new RegExp(email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
        if (status && status != undefined && status != 'undefined')
            filter.status = status && status == 'true' ? true : false


        const total = await BugReport.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const bugReports = await BugReport.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "_id",
                    as: "customer"

                },
            },

            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    subject: 1,
                    message: 1,
                    reply: 1,
                    status: 1,
                    customerName: { $arrayElemAt: ["$customer.customername", 0] }

                }
            }
        ])


        return res.send({
            success: true,
            data: {
                bugReports,
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

// API to edit Bug Report
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const { bugReportId } = req.params
        if (bugReportId && payload.reply) {
            payload.status = true
            const bugReport = await BugReport.findByIdAndUpdate({
                    _id: bugReportId
                }, {
                    $set: payload
                }, {
                    new: true
                })

            let adminEmails = await Settings.findOne({}, 'email')
            adminEmails = adminEmails.email
            adminEmails = adminEmails.split(",")



            let emailData = {
                name: bugReport.name,
                email: bugReport.email,
                phone: bugReport.phone,
                subject: bugReport.subject,
                message: bugReport.message,
                reply: bugReport.reply,
                bcc: adminEmails,

            }
            sendEmail('bug_report_query_response', emailData)


            return res.send({
                success: true,
                message: 'Successfully Responded',
            })
        }
        else {
            return res.status(400).send({ success: false, message: 'Id and Reply is required' })
        }
    } catch (error) {
        return next(error)
    }
}