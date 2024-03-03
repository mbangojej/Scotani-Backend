const Notification = require('../../models/notification.model')
const mongoose = require('mongoose');
const Customer = require('../../models/customers.model')
const { sendPushNotification } = require('../../../config/firebase')

exports.testNotification = async (req, res, next) => {
    const { email, logout } = req.query
    const customer = await Customer.findOne({email: email})
    if(customer.fcmToken){
        if(logout){
            sendPushNotification(customer.fcmToken, "This is a logout test", "User must logout from application", false)
        }else{
            sendPushNotification(customer.fcmToken, "This is a test", "A simple notification")
        }
    }
    return res.status(200).send({
        customer
    })
}


// API to get all Notifications
exports.list = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        let { all } = req.query
        let { page, limit } = req.body
        if(!page){
            page = req.params.page
        }
        const filter = {
            customerId: mongoose.Types.ObjectId(userAgent),
        }
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10
        const total = await Notification.countDocuments(filter)
        // if (page > Math.ceil(total / limit) && total > 0)
        //     page = Math.ceil(total / limit)

        let pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]


        if (!all) {
            pipeline.push({ $skip: limit * (page - 1) })
            pipeline.push({ $limit: limit })
        }


        pipeline.push({
            $project: {
                title: 1, description: 1, status: 1, createdAt: 1
            }
        })

        const notifications = await Notification.aggregate(pipeline)
        return res.status(200).send({
            status: 1,
            message: 'Notifications fetched successfully',
            data: {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }

        });


    } catch (error) {
        return next(error)
    }
};

// API to update notification receiving for customer
exports.updateStatusForCustomer = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];

        let customer =  await Customer.findOne({ _id: mongoose.Types.ObjectId(userAgent) });
        
        if (customer) { 
            let status = !customer.sendNotification
            await Customer.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userAgent) }, {$set: {sendNotification: !customer.sendNotification}},{ includeResultMetadata: true });
            return res.status(200).send({ status: 1, message: 'Notifcation update successfully', data: {status: status ? 1: 0}});
        }
        else {
            return res.status(200).send({ status: 0, message: 'Invalid Customer' });
        }

    } catch (error) {
        return next(error);
    }
};

// Mark notification as read/unread 
exports.updateNotificationStatus = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        let customer =  await Customer.findOne({ _id: mongoose.Types.ObjectId(userAgent) });
        const { notificationId } = req.body
        const notification = await Notification.findOne({_id: mongoose.Types.ObjectId(notificationId)})
        if (notification) { 
            let status = !notification.status
            await Notification.findOneAndUpdate({ _id: mongoose.Types.ObjectId(notificationId) }, {$set: {status: status}},{ includeResultMetadata: true });
            
            return res.status(200).send({ status: 1, message: 'Notifcation updated successfully', data: {status: status ? 1: 0}});
        }
        else {
            return res.status(200).send({ status: 0, message: 'Invalid Notification' });
        }

    } catch (error) {
        return next(error);
    }
};

