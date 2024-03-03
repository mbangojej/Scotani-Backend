const fs = require('fs')
const passport = require('passport')
const bcrypt = require('bcryptjs');
const moment = require('moment');
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose');
const Admin = require('../../models/admin.model')
const Roles = require('../../models/roles.model')
const Order = require('../../models/order.model')
const { uploadToCloudinary } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')
const { sendEmail } = require('../../utils/emails/emails')
const { adminUrl, adminPasswordKey, pwdSaltRounds } = require('../../../config/vars');
const randomstring = require("randomstring");
const { validationResult } = require('express-validator')
const Customer = require('../../models/customers.model')

// API to login admin
exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body

        email = email.toLowerCase()
        const user = await Admin.findOne({ email }).lean()

        if (!user)
            return res.status(404).send({ success: false, message: 'Incorrect email or password' })
        if (!user.confirmationCode)
            return res.status(402).send({ success: false, message: 'Email Not Verified' })

        const adminRoles = await Roles.findOne({ _id: user.roleId }, { status: 1 })
        passport.use(new localStrategy({ usernameField: 'email' },
            (username, password, done) => {
                Admin.findOne({ email: username }, 'name email phone roleId status image password', (err, user) => {
                    if (err)
                        return done(err)
                    else if (!user) // unregistered email
                        return done(null, false, { success: false, message: 'Incorrect email or password' })
                    else if (!user.verifyPassword(password)) // wrong password
                        return done(null, false, { success: false, message: 'Incorrect email or password' })
                    else return done(null, user)
                })
                // .populate({ path: "roleId", select: 'title' })
            })
        )

        // call for passport authentication
        passport.authenticate('local', async (err, user, info) => {
            if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while authenticating' })
            // registered user
            else if (user) {
                if (!user.status)
                    return res.status(403).send({ success: false, message: 'Your account is inactive, kindly contact admin', user })
                else {
                    var accessToken = await user.token()
                    let data = {
                        ...user._doc,
                        accessToken
                    }
                    await Admin.updateOne({ _id: user._id }, { $set: { accessToken } }, { upsert: true })
                    return res.status(200).send({ success: true, message: 'Admin logged in successfully', data, adminStatus: adminRoles.status })
                }
            }
            // unknown user or wrong password
            else return res.status(402).send({ success: false, message: 'Incorrect email or password' })
        })(req, res)

    } catch (error) {
        return next(error)
    }
}
// API to create admin 
exports.create = async (req, res, next) => {
    try {
        let payload = req.body


        const getAdmin = await Admin.findOne({ email: payload.email.toLowerCase() }).lean(true);

        if (getAdmin) {
            return res.json({ success: false, exist: true, message: 'Email already exist', admin: payload })
        }


        if (req.files && req.files.image) {
            const image = req.files.image[0]
            // const imgData = fs.readFileSync(image.path)
            payload.image = await uploadToCloudinary(image.path)
        }

        const setPasswordToken = randomstring.generate({
            length: 8,
            charset: 'alphanumeric'
        })

        const admin = new Admin(payload)
        admin.setPasswordToken = setPasswordToken;
        await admin.save()

        let emailData = {
            baseUrl: adminUrl,
            email: payload.email,
            adminId: admin._id,
            setPasswordToken
        }

        sendEmail('set_admin_password', emailData)
        return res.send({ success: true, message: 'Admin Staff created successfully', admin })
    } catch (error) {
        // if (error.code === 11000 || error.code === 11001)
        //     checkDuplicate(error, res, 'Admin')
        // else
        return next(error)
    }
}

//API to verify  admin password
exports.verify = async (req, res, next) => {
    try {
        let { password } = req.body;
        let userId = req.user;
        let currentPasswordFlag = false;
        let user = await Admin.findById({ _id: userId, }).exec();
        if (user) {
            if (password) {
                currentPasswordFlag = await user.verifyPassword(password)// check if current password is valid
            }
            if (currentPasswordFlag) {
                return res.status(200).send({
                    success: true,
                    message: 'Password is right',
                    data: true,
                });
            }
            else {
                return res.status(200).send({
                    success: false,
                    message: 'Your entered password is wrong',
                    data: false,
                });
            }
        }
    }
    catch (error) {
        next(error)
    }
}
// API to edit admin
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body

        if (payload.password) {
            const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
            const hash = await bcrypt.hash(payload.password, rounds);
            payload.password = hash
        }
        else {
            delete payload.password
        }

        if (req.files && req.files.image) {
            const image = req.files.image[0]
            // const imgData = fs.readFileSync(image.path)
            payload.image = await uploadToCloudinary(image.path)
            payload.imageLocal = image.filename
        }
        const admin = await Admin.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(payload._id) }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Admin has been updated successfully', admin })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Admin')
        else
            return next(error)
    }
}
// API to delete admin
exports.delete = async (req, res, next) => {
    try {
        const { adminId } = req.params
        if (adminId) {
            const admin = await Admin.deleteOne({ _id: adminId })
            if (admin.deletedCount)
                return res.send({ success: true, message: 'Admin Staff deleted successfully', adminId })
            else return res.status(400).send({ success: false, message: 'Admin not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Admin Id is required' })
    } catch (error) {
        return next(error)
    }
}
// API to get an admin
exports.get = async (req, res, next) => {
    try {
        const { adminId } = req.params
        if (adminId) {
            let admin = await Admin.findOne({ _id: mongoose.Types.ObjectId(adminId) }, { __v: 0, createdAt: 0, updatedAt: 0, password: 0 }).lean(true)
            // admin.image = admin.imageLocal ? `${uploadedImgPath}${admin.imageLocal}` : ''
            if (admin)
                return res.json({ success: true, admin })
            else return res.status(400).send({ success: false, message: 'Admin not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Admin Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get admin list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, adminId, name, email, status, roleId } = req.query

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        let filters = {};
        if (name && name != undefined && name != 'undefined')
            filters.name = new RegExp(name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
        if (email && email != undefined && email != 'undefined')
            filters.email = new RegExp(email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
        if (status && status != undefined && status != 'undefined')
            filters.status = status && status == 'true' ? true : false
        if (roleId && roleId != undefined && roleId != 'undefined')
            filters.roleId = roleId

        const total = await Admin.countDocuments({
            $and: [filters, { _id: { $ne: mongoose.Types.ObjectId(adminId) } }]
        })
        const admins = await Admin.aggregate([
            {
                $match: {
                    $and: [filters, { _id: { $ne: mongoose.Types.ObjectId(adminId) } }]
                }
            },

            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            { "$addFields": { "role_Id": { "$toObjectId": "$roleId" } } },
            {
                $lookup: {
                    from: 'roles',
                    foreignField: '_id',
                    localField: 'role_Id',
                    as: 'role'
                }
            },
            { $unwind: '$role' },
            {
                $project: {
                    __v: 0, createdAt: 0, updatedAt: 0,
                }
            }
        ])

        return res.send({
            success: true,
            data: {
                admins,
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

// API to edit admin password
exports.editPassword = async (req, res, next) => {
    try {
        let payload = req.body
        let admin = await Admin.find({ _id: mongoose.Types.ObjectId(payload._id) })
        if (admin[0].verifyPassword(payload.current)) {
            let newPayload = {
                password: await admin[0].getPasswordHash(payload.new)
            }
            let updatedAdmin = await Admin.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(payload._id) }, { $set: newPayload }, { new: true })
            return res.send({ success: true, message: 'Password updated successfully', updatedAdmin })
        }
        else {
            return res.send({ success: false, message: 'Incorrent current password', admin: admin[0] })
        }


    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Admin')
        else
            return next(error)
    }
}

// API to edit admin password
exports.forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;
        if (email) {
            email = email.toLowerCase();
            Admin.findOne({ email }, async (err, admin) => {
                if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });
                if (admin) {
                    const resetPasswordToken = randomstring.generate({
                        length: 8,
                        charset: 'alphanumeric'
                    })
                    admin.resetPasswordToken = resetPasswordToken;
                    admin.expireToken = Date.now() + 3600000;
                    admin.save();

                    let emailData = {
                        baseUrl: `${adminUrl}/reset-password`,
                        email: admin.email,
                        name: admin.name,
                        userId: admin._id,
                        resetPasswordToken
                    }

                    await sendEmail('reset_admin_password', emailData)
                    res.status(200).send({ success: true, message: 'Email sent successfully' });
                } else return res.status(200).send({ success: false, message: 'Please enter valid email' });
            });
        } else return res.status(200).send({ success: false, message: 'Please enter email' });
    } catch (error) {
        next(error)
    }
}

// API to reset password


exports.resetPassword = async (req, res, next) => {
    let { password, resetPasswordToken } = req.body;

    Admin.findOne({ resetPasswordToken }, (err, admin) => {
        if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });
        if (admin) {
            admin.resetPasswordToken = undefined;
            admin.expireToken = undefined;
            admin.password = password;
            admin.save();

            // password has been reset successfully
            return res.status(200).send({ success: true, message: 'Your password is changed successfully!' });
        } else {
            return res.status(400).send({ message: 'Your reset password link has expired.', success: false });
        }
    });
}

exports.setPassword = async (req, res, next) => {
    let { password, setPasswordToken } = req.body;

    Admin.findOne({ setPasswordToken }, (err, admin) => {
        if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });

        if (admin) {
            let confirmationCode = randomstring.generate({ length: 20, charset: 'alphanumeric' })
            admin.confirmationCode = confirmationCode;
            admin.setPasswordToken = undefined;
            admin.expireToken = undefined;
            admin.password = password;
            admin.save();

            // password has been reset successfully
            return res.status(200).send({ success: true, message: 'Password set successfully!', admin });
        } else {
            return res.status(400).send({ message: 'Your set password link has expired.', success: false });
        }
    });
}
exports.verifyEmail = async (req, res, next) => {
    let { adminId } = req.params;

    Admin.findOne({ _id: adminId }, (err, admin) => {
        if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });
        if (admin) {
            let confirmationCode = randomstring.generate({ length: 20, charset: 'alphanumeric' })
            admin.confirmationCode = confirmationCode;
            admin.save();

            return res.status(200).send({ success: true, message: 'Email verified successfully!' });
        } else {
            return res.status(400).send({ message: 'Oops! Something went wrong', success: false });
        }
    });
}

// API to get dashboard
exports.dashboard = async (req, res, next) => {
    try {
        const customers = await Customer.countDocuments()
        const guest = await Customer.countDocuments({ userType: 1 })
        const adminlist = await Admin.countDocuments({})

        const orderReceived = await Order.countDocuments({ status: 0 })
        const processingOrders = await Order.countDocuments({ status: 1 })
        const onTheWayOrders = await Order.countDocuments({ status: 2 })
        const deliveredOrders = await Order.countDocuments({ status: 3 })
        const cancelledOrders = await Order.countDocuments({ status: 4 })
        const invoices = await Order.countDocuments({ isInvoiced: 1 })

        const ordersStats = await Order.aggregate([
            {
                $group: {
                    _id: '',
                    "subTotal": { $sum: '$subTotal' },
                    "discountTotal": { $sum: '$discountTotal' },
                    "taxTotal": { $sum: '$taxTotal' },
                    "grandTotal": { $sum: '$grandTotal' },
                    "paidAmount": { $sum: '$paidAmount' },
                },
            },
            {
                $project: {
                    _id: 0,
                    "subTotal": '$subTotal',
                    "discountTotal": '$discountTotal',
                    "taxTotal": '$taxTotal',
                    "grandTotal": '$grandTotal',
                    "paidAmount": '$paidAmount',
                }
            }
        ])

        let orderChartData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $add: [
                            { $dayOfYear: "$createdAt" },
                            {
                                $multiply:
                                    [400, { $year: "$createdAt" }]
                            }
                        ]
                    },
                    orders: { $sum: 1 },
                    first: { $min: "$createdAt" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 15 },
            { $project: { createdAt: "$first", orders: 1, _id: 0 } }
        ])

        let chartData = []
        chartData['data'] = []
        chartData['labels'] = []

        orderChartData.forEach((data, index) => {
            chartData['data'].push(data.orders)
            chartData['labels'].push(moment(data.createdAt).format('MM-DD-YYYY'))
        })

        const filter = {}
        //const last_orders = await Order.find(  { deliveredDate:{ $ne: null } }).sort({ _id: -1 }).limit(10)
        const last_orders = await Order.find().sort({ _id: -1 }).limit(10)
        return res.send({
            success: true,
            data: {
                customers,
                adminlist,
                orderReceived,
                processingOrders,
                onTheWayOrders,
                deliveredOrders,
                cancelledOrders,
                invoices,
                last_orders,
                ordersStats,
                orderChartData,
                guest,
                invoices
            }
        })
    } catch (error) {
        return next(error)
    }
}

exports.privateAdmin = async (req, res, next) => {
    try {
        return res.render('index');
    }
    catch (err) {
        next(err)
    }
}
exports.createPrivateAdmin = async (req, res, next) => {
    try {
        let username = req.body.name
        let email = req.body.email
        let password = req.body.password
        let privateKey = req.body.privatekey
        let status = req.body.status === '1' ? true : false
        let admin = await Admin.findOne({ email }, { _id: 1, email: 1 })
        if (admin) {
            return res.status(400).send({ status: false, message: 'Admin with same email already exists!' })
        }

        if (privateKey === adminPasswordKey) {

            roleAlreadyExists = await Roles.findOne({ title: privateAdminPermissionsKeys.title }, { _id: 1 })
            if (roleAlreadyExists) {
                await Admin.create({ name: username, email, password, status, roleId: mongoose.Types.ObjectId(roleAlreadyExists._id) })
            }
            else {
                let createdRole = await Roles.create(privateAdminPermissionsKeys)
                await Admin.create({ name: username, email, password, status, roleId: mongoose.Types.ObjectId(createdRole._id) })

            }
            return res.status(200).send({ status: true, message: 'Admin created successfully!' })

        }
        else {
            return res.status(400).send({ status: false, message: 'Incorrect Private Key!' })
        }
    }
    catch (err) {
        next(err)
    }
}

exports.imageUpload = async (req, res, next) => {
    try {
        const image = req.file ? `${req.file.filename}` : "";
        return res.json({ success: true, message: 'Image upload successfully', data: image })
    } catch (error) {
        return res.status(400).send({ success: false, message: error });
    }
};

exports.videoUpload = async (req, res, next) => {
    try {
        const video = req.file ? `${req.file.filename}` : "";
        return res.json({ success: true, message: 'Video upload successfully', data: video })
    } catch (error) {
        return res.status(400).send({ success: false, message: error });
    }
};


exports.uploadContent = async (req, res, next) => {
    try {
        const files = req.file ? `${req.file.filename}` : "";
        return res.json({ success: true, message: 'File upload successfully', data: files })
    } catch (error) {
        return res.status(400).send({ success: false, message: error });
    }
};

exports.testRoute = async (req, res, next) => {
    try {
        return res.status(200).send('Successful!')
    }
    catch (err) {
    }
}
var privateAdminPermissionsKeys = {
    "addAdmin": true,
    "editAdmin": true,
    "deleteAdmin": true,
    "viewAdmin": true,
    "addCMS": true,
    "editCMS": true,
    "deleteCMS": true,
    "viewCMS": true,
    "editEmails": true,
    "viewEmails": true,
    "editSetting": true,
    "viewSetting": true,
    "addEmailTemplate": true,
    "editEmailTemplate": true,
    "deleteEmailTemplate": true,
    "viewEmailTemplate": true,
    "addEmailType": true,
    "editEmailType": true,
    "deleteEmailType": true,
    "viewEmailType": true,
    "addCustomer": true,
    "editCustomer": true,
    "deleteCustomer": true,
    "viewCustomer": true,
    "addFaq": true,
    "editFaq": true,
    "deleteFaq": true,
    "viewFaqs": true,
    "addCategory": true,
    "editCategory": true,
    "deleteCategory": true,
    "viewCategories": true,
    "addPromotion": false,
    "editPromotion": false,
    "deletePromotion": false,
    "viewPromotions": false,
    "addSizeGroup": false,
    "editSizeGroup": false,
    "deleteSizeGroup": false,
    "viewSizeGroups": false,
    "addOrder": true,
    "editOrder": true,
    "confirmOrder": true,
    "viewOrders": true,
    "cancelOrder": true,
    "createInvoice": true,
    "registerPayment": true,
    "addContent": true,
    "editContent": true,
    "deleteContent": true,
    "viewContents": true,
    "addProduct": true,
    "editProduct": true,
    "deleteProduct": true,
    "viewProducts": true,
    "viewSalesReport": true,
    "viewInvoiceReport": true,
    "viewBugReport": true,
    "addContactQuery": true,
    "editContactQuery": true,
    "deleteContactQuery": true,
    "viewContactQueries": true,
    "addRole": true,
    "editRole": true,
    "deleteRole": true,
    "viewRole": true,
    "status": true,
    "title": "Super Admin"
}