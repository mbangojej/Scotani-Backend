const ObjectId = require('mongoose').Types.ObjectId
const Customer = require('../../models/customers.model')
const Settings = require('../../models/settings.model')
const bcrypt = require('bcryptjs');
const { checkDuplicate } = require('../../../config/errors')
const { sendEmail } = require('../../utils/emails/emails')
const { generateRandomString } = require('../../utils/util')
const { uploadedImgPath, pwdSaltRounds, userUrl } = require('../../../config/vars')
const { sendPushNotification } = require('../../../config/firebase')

// API to get customers list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, all, withDeleted } = req.query
        let { customername, email, status, isPartner, companyType, userType, accountRequest } = req.body
        const filter = {}

        if (customername) {
            customername = customername.trim()
            filter.customername = { $regex: customername.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }
        if (email) {
            email = email.trim()
            filter.email = { $regex: email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }
        if (status === "true") {
            filter.status = true
        }
        if (accountRequest === "Show Requested") {
            filter.accountDeactivationRequestDate = { $ne: null }
        }
        if (!withDeleted) {
            filter.isDeleted = { $ne: true }
        } else {
            delete filter.status
            delete filter.isDeleted
        }

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await Customer.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


        let pipeline = [

            { $match: filter },
            { $sort: { createdAt: -1 } },
        ]



        if (!all) {
            pipeline.push(
                {
                    $lookup: {
                        from: "wishlists",
                        localField: "_id",
                        foreignField: "customer",
                        as: "wishlists",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "productId",
                                    foreignField: "_id",
                                    as: "product",
                                    pipeline: [
                                        {
                                            $project: {
                                                title: 1,
                                                price: 1,
                                                image: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            { $unwind: { path: '$product' } },
                        ]
                    }
                },
            )

            pipeline.push(
                {
                    $lookup: {
                        from: "carts",
                        localField: "_id",
                        foreignField: "customer",
                        as: "cart",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "systemProducts.productId",
                                    foreignField: "_id",
                                    as: "matchedProducts",
                                },
                            },
                            {
                                $addFields: {
                                    "systemProducts": {
                                        $map: {
                                            input: "$systemProducts",
                                            as: "systemProduct",
                                            in: {
                                                $mergeObjects: [
                                                    "$$systemProduct",
                                                    {
                                                        productName: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $map: {
                                                                        input: {
                                                                            $filter: {
                                                                                input: "$matchedProducts",
                                                                                as: "matchedProduct",
                                                                                cond: {
                                                                                    $eq: ["$$matchedProduct._id", "$$systemProduct.productId"],
                                                                                },
                                                                            },
                                                                        },
                                                                        as: "matchedProduct",
                                                                        in: "$$matchedProduct.title",
                                                                    },
                                                                },
                                                                0,
                                                            ],
                                                        },
                                                    },
                                                    {
                                                        productImage: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $map: {
                                                                        input: {
                                                                            $filter: {
                                                                                input: "$matchedProducts",
                                                                                as: "matchedProduct",
                                                                                cond: {
                                                                                    $eq: ["$$matchedProduct._id", "$$systemProduct.productId"],
                                                                                },
                                                                            },
                                                                        },
                                                                        as: "matchedProduct",
                                                                        in: "$$matchedProduct.image",
                                                                    },
                                                                },
                                                                0,
                                                            ],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "nonSystemProducts.productId",
                                    foreignField: "_id",
                                    as: "matchedProduct",
                                }
                            },

                            {
                                $addFields: {
                                    "nonSystemProducts": {
                                        $map: {
                                            input: "$nonSystemProducts",
                                            as: "nonSystemProduct",
                                            in: {
                                                $mergeObjects: [
                                                    "$$nonSystemProduct",
                                                    {
                                                        productName: {
                                                            $cond: {
                                                                if: { $eq: ["$$nonSystemProduct.productId", null] },
                                                                then: { $arrayElemAt: ["$$nonSystemProduct.designs.prompt", 0] },
                                                                else: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $map: {
                                                                                input: {
                                                                                    $filter: {
                                                                                        input: "$matchedProducts",
                                                                                        as: "matchedProduct",
                                                                                        cond: {
                                                                                            $eq: ["$$matchedProduct._id", "$$nonSystemProduct.productId"],
                                                                                        },
                                                                                    },
                                                                                },
                                                                                as: "matchedProduct",
                                                                                in: "$$matchedProduct.title",
                                                                            },
                                                                        },
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },

                            {
                                $project: {
                                    _id: 1,
                                    customer: 1,
                                    vatPercentage: 1,
                                    isCheckout: 1,
                                    systemProducts: 1,
                                    nonSystemProducts: 1,
                                    promotionId: 1,
                                    subTotal: 1,
                                    taxTotal: 1,
                                    discountTotal: 1,      // Amount of discount
                                    grandTotal: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        "profileImage": 1,
                        "customername": 1,
                        "email": 1,
                        "mobile": 1,
                        "createdAt": 1,
                        "status": 1,
                        "address": 1,
                        "cart": 1,
                        "wishlists": 1,
                        "fcmToken": 1,
                        "sendNotification": 1,
                        "accountDeactivationRequestDate": 1
                    }
                },
            )
        }

        if (!all) {
            pipeline.push(
                { $skip: limit * (page - 1) }
            )
            pipeline.push(
                { $limit: limit }
            )
        }

        const customers = await Customer.aggregate(pipeline)

        return res.send({
            success: true,
            data: {
                customers,
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
exports.customerList = async (req, res, next) => {
    try {
        let { all, page, limit } = req.query
        let { customer, status } = req.body
        const filter = {}



        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await Customer.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        let pipeline = [
            { $match: filter },
            { $sort: { _id: 1 } }
        ]

        if (!all) {
            pipeline.push({ $skip: limit * (page - 1) })
            pipeline.push({ $limit: limit })
        }

        pipeline.push(
            { $unwind: { path: '$addresses', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "countries",
                    localField: "addresses.country",
                    foreignField: "name",
                    as: "country"
                }
            },
            {
                "$group":
                {
                    "_id": "$_id",
                    "customername": { "$first": "$customername" },
                    "title": { "$first": "$title" },
                    "email": { "$first": "$email" },
                    "createdAt": { "$first": "$createdAt" },
                    "profileImage": { "$first": "$profileImage" },
                    "mobile": { "$first": "$mobile" },
                    "phone": { "$first": "$phone" },
                    "status": { "$first": "$status" },
                    "userType": { "$first": "$userType" },
                    "isPartner": { "$first": "$isPartner" },
                    "addresses": { "$push": "$addresses" },
                    "country": { "$first": "$country" },
                    "companyType": { "$first": "$companyType" },
                    "companyName": { "$first": "$companyName" },
                    "companyURL": { "$first": "$companyURL" },
                    "companyRegistrationExtact": { "$first": "$companyRegistrationExtractNumber" },
                    "companyVAT": { "$first": "$companyVAT" },
                }
            },
        )

        const customers = await Customer.aggregate(pipeline)

        return res.send({
            success: true,
            data: {
                customers,
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
// API to delete user
exports.delete = async (req, res, next) => {
    try {
        const { customerId } = req.params
        if (customerId) {
            let customer = await Customer.findOne({ _id: customerId })
            customer.email = customer.email + ' ' + new Date()
            customer.isDeleted = true
            customer.save()
            sendPushNotification(customer.fcmToken, 'Account Deleted', 'Your account has been deleted by admin', true)
            if (customer) {
                return res.send({ success: true, message: 'Customer deleted successfully', customerId, customer })
            }
            else return res.status(400).send({ success: false, message: 'Customer not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Customer Id is required' })
    } catch (error) {
        return next(error)
    }
}
// API to get user
exports.get = async (req, res, next) => {
    try {
        const { customerId } = req.params
        if (customerId) {
            const customer = await Customer.findOne({ _id: customerId }, '-password -resetPasswordToken')
            if (customer)
                return res.send({ success: true, user })
            else return res.status(400).send({ success: false, message: 'Customer not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Customer Id is required' })
    } catch (error) {
        return next(error)
    }
}
exports.create = async (req, res, next) => {
    try {
        let { customername, email } = req.body;
        if (customername && email) {

            let body = req.body;
            email = email.toLowerCase().trim();
            body.email = email;
            let password = generateRandomString(10);
            let customer = await Customer.findOne({ email: email, isDeleted: { $ne: true } });

            if (customer) {
                return res.status(200).send({ success: false, message: 'Customer already exists', customer });
            }

            if (body.profileImage) {
                body.profileImageLocal = body.profileImage.split('/')?.slice(-1)[0]
            }
            else {
                delete body.profileImage
            }
            body.password = password
            body.emailVerified = true
            customer = await Customer.create(body);

            let emailData = {
                name: customer.customername,
                email: customer.email,
                password: password,
            }

            sendEmail('account_created', emailData)

            return res.status(200).send({
                success: true,
                message: 'Customer successfully created',
                data: customer
            })
        }
        else return res.status(200).send({ success: false, message: 'Required fields are missing' });
    } catch (error) {
        next(error)
    }
}
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const { customerId } = req.params
        if (payload.password) {
            const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
            const hash = await bcrypt.hash(payload.password, rounds);
            payload.password = hash
        } else {
            delete payload.password
        }
        if (payload.profileImage) {
            payload.profileImageLocal = payload.profileImage.split('/')?.slice(-1)[0]
        }
        else {
            delete payload.profileImage
        }

        if (customerId) {
            if (payload.companyType == 0) {
                payload.companyName = '';
            }

            const oldCustomer = await Customer.findOne({ _id: customerId }, '-password -resetPasswordToken')

            const customer = await Customer.findByIdAndUpdate({ _id: customerId }, { $set: payload }, { new: true })
            if (oldCustomer.status != payload.status) {
                if (!payload.status) {
                    sendPushNotification(customer.fcmToken, 'Account deactivated', 'Your account has been deactivated by admin', true)
                } else {
                    sendPushNotification(customer.fcmToken, 'Account activated', 'Your account has been activated by admin')
                }
            }
            const settings = await Settings.findOne().lean(true)
            let emailData = {
                name: customer.customername,
                email: customer.email,
                bcc: settings.orderEmailRecipients,
                emailLanguage: customer.customerLanguage
            }

            if (oldCustomer.status == false && customer.status == true) {
                sendEmail('account_activated', emailData)
            }

            return res.send({ success: true, message: 'Customer updated successfully', customer })
        }
        else
            return res.status(400).send({ success: false, message: 'Customer Id is required' })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Customer')
        else
            return next(error)
    }
}
exports.sendVerificationEmail = async (req, res, next) => {
    try {
        const { userId } = req.params;
        let user = await Customer.findOne({ _id: userId });

        var accessToken = await user.token();
        user = user.transform();
        let data = {
            ...user,
            accessToken
        }

        let emailData = {
            baseUrl: `${userUrl}/verify-email/${user._id}`,
            email: user.email,
            password: user.password,
            name: user.customername,

        }

        sendEmail('verify_user_email', emailData)

        return res.status(200).send({
            success: true,
            message: 'Verification Email Sent',
            data: data
        })
    }
    catch (error) {
        next(error)
    }
}