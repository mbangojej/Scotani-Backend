const Order = require('../../models/order.model')
const SizeGroup = require('../../models/sizeGroups.model')
const Settings = require('../../models/settings.model')
const Customer = require('../../models/customers.model')
const ProductVariation = require('../../models/productVariation.model')
const Product = require('../../models/product.model')
const fs = require('fs')
const mongoose = require('mongoose');
const moment = require('moment')
const { sendEmail } = require('../../utils/emails/emails')
const { invoicePDF, sendNotification } = require('../../utils/util')
const Promotions = require('../../models/promotions.model')
const { validateAndApplyCouponCode } = require('../../utils/util')
const { makeStripeRefund } = require("../../utils/stripe")
const { makePaypalRefund } = require("../../utils/paypal")
// API to create order
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const lastOrder = await Order.find().limit(1).sort({ $natural: -1 })
        // payload.orderNumber = lastOrder[0] ? lastOrder[0].orderNumber + 1 : 1
        const order = await Order.create(payload)
        const customer = await Customer.findOne({ _id: order.customer });
        const attachment = ""
        const settings = await Settings.findOne().lean(true)
        let emailData = {
            name: customer.customername,
            orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
            email: customer.email,
            bcc: settings.orderEmailRecipients,
            attachment: attachment,
        }
       
        sendEmail('order_placed', emailData)
        await sendNotification(customer._id, 'Order Created', `Your order with ID ${emailData.orderNumber} is created. We will update you once it's ready for delivery.`)
        return res.send({ success: true, message: 'Order created successfully', order: order })

    } catch (error) {
        return next(error)
    }
}

// API to edit Order
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (payload.promotionId) {

            payload.promotionId = payload.promotionId
        }
        else {
            payload.promotionId = null
        }
        const order = await Order.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })

        const customer = await Customer.findOne({ _id: order.customer });
        let settings = await Settings.findOne({}, 'orderEmailRecipients')
        settings = settings.orderEmailRecipients
        settings = settings.split(",")

        const invoice_url = await invoicePDF(order._id)

        let emailData = {
            name: customer.customername,
            bcc: settings,
            orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
            email: customer.email,
        }
        // This has been commented for future use
        // sendEmail('order_updated', emailData)
        await sendNotification(customer._id, 'Order Updated', `Your order with ID ${emailData.orderNumber} is updated. We will update you once it's ready for delivery.`)


        return res.send({ success: true, message: 'Order updated successfully', order })
    } catch (error) {
        return next(error)
    }
}
// API to update Order Status
exports.updateStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.params
        // status  0: Order Received, 1: Processing, 2: On The Way 3: Delivered 4: Cancel
        let setData = { status: status }
        switch (String(status)) {
            case "1":
                setData.processingDate = new Date()
                break;
            case "2":
                setData.onTheWayDate = new Date()
                break;
            case "3":
                setData.deliveredDate = new Date()
                break;
            case "4":
                setData.cancelledDate = new Date()
                break;
        }

        const order = await Order.findByIdAndUpdate({ _id: orderId }, { $set: setData }, { new: true })
        const customer = await Customer.findOne({ _id: order.customer });
        const invoice_url = await invoicePDF(order._id)


        let settings = await Settings.findOne({}, 'orderEmailRecipients')
        settings = settings.orderEmailRecipients
        settings = settings.split(",")

        let emailData = {
            name: customer.customername,
            bcc: settings,
            orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
            email: customer.email,
        }
        if (status == 1) // processing
        {
            sendEmail('order_processing', emailData)
            await sendNotification(customer._id, 'Order Processing', `Your order with ID ${emailData.orderNumber} is currently being processed. We will update you once it's ready for delivery.`)
        }
        else if (status == 2) // on the way
        {
            sendEmail('order_on_the_way', emailData)
            await sendNotification(customer._id, 'Order on the Way', `Your order with ID ${emailData.orderNumber} is on its way to your delivery address.`)
        }
        else if (status == 3) // delivered
        {
            sendEmail('order_delivered', emailData)
            await sendNotification(customer._id, 'Order Delivered', `Your order with ID ${emailData.orderNumber} has been successfully delivered to your specified address.`)
        }
        else if (status == 4) // cancelled
        {
            sendEmail('order_cancelled', emailData)
            await sendNotification(customer._id, 'Order Cancelled', `We regret to inform you that your order with ID ${emailData.orderNumber} has been cancelled`)
        }
        return res.send({ success: true, message: 'Order updated successfully', order })
    } catch (error) {
        return next(error)
    }
}
// API to Generate Invoice of Order
exports.generateInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params

        const order = await Order.findByIdAndUpdate({ _id: orderId }, { $set: { isInvoiced: true, invoicedAt: moment() } }, { new: true })
        const customer = await Customer.findOne({ _id: order.customer });
        const orderD = await Order.findOne({ _id: mongoose.Types.ObjectId(orderId) })
            .populate({
                path: 'systemProducts.productId',
                model: 'Product',

            })
            .populate({
                path: 'nonSystemProducts.productId',
                model: 'Product',

            })
            .populate({
                path: 'customer',
                model: 'Customer',

            })
            .lean(true)
        const invoice_url = await invoicePDF(order._id)

        // const settings = await Settings.findOne().lean(true)
        let settings = await Settings.findOne({}, 'orderEmailRecipients')
        settings = settings.orderEmailRecipients
        settings = settings.split(",")

        let emailData = {
            name: customer.customername,
            bcc: settings,
            orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
            invoiceNumber: `INV${order.orderNumber.toString().padStart(5, 0)}`,
            email: customer.email,
            attachment: invoice_url,
        }
        // sendEmail('invoice_created', emailData)
        // await sendNotification(customer._id, 'Invoice Created', `Your invoice with number INV${emailData.orderNumber.toString().padStart(5, 0)} has been generated`)
        return res.send({ success: true, message: 'Invoice generated successfully', orderD })
    } catch (error) {
        return next(error)
    }
}

// API to get a Order
exports.get = async (req, res, next) => {
    try {
        const { orderId } = req.params
        if (orderId) {
            const order = await Order.findOne({ _id: orderId }).lean(true)
            for (let i = 0; i < order.systemProducts.length; i++) {

                let product = await Product.findOne({ _id: order.systemProducts[i].productId }).lean(true)
                if (product) {
                    order.systemProducts[i].productType = product.type
                    let variations = await ProductVariation.find({ productId: mongoose.Types.ObjectId(order.systemProducts[i].productId) })
                    order.systemProducts[i].variations = variations
                }
            }
            let size = null
            for (let i = 0; i < order.nonSystemProducts.length; i++) {
                let product = await Product.findOne({ _id: order.nonSystemProducts[i].productId }).lean(true)
                if (product) {
                    order.nonSystemProducts[i].productType = product.type
                    let variations = await ProductVariation.find({ productId: mongoose.Types.ObjectId(order.nonSystemProducts[i].productId) })
                    order.nonSystemProducts[i].variations = variations
                }
                for (let j = 0; j < order.nonSystemProducts[i].designs.length; j++) {
                    size = await SizeGroup.findOne({ _id: mongoose.Types.ObjectId(order.nonSystemProducts[i].designs[j].size) })
                    if (size)
                        order.nonSystemProducts[i].designs[j].sizeDetail = `SW: ${size.startingWidth} EW: ${size.endingWidth}`
                    order.nonSystemProducts[i].designs[j].desireTextSizeGroupDetail = ``
                    if (order.nonSystemProducts[i].designs[j].desireTextSizeGroup) {
                        size = await SizeGroup.findOne({ _id: mongoose.Types.ObjectId(order.nonSystemProducts[i].designs[j].desireTextSizeGroup) })
                        order.nonSystemProducts[i].designs[j].desireTextSizeGroupDetail = `SW: ${size.startingWidth} EW: ${size.endingWidth}`
                    }
                }
            }
            if (order) {
                return res.json({ success: true, order, attachment: "" })
            }
            else return res.status(400).send({ success: false, message: 'Order not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Order Id is required' })
    } catch (error) {
        return next(error)
    }
}
// API to get a Invoice Detail of Order
exports.getInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params
        if (orderId) {

            const order = await Order.findOne({ _id: mongoose.Types.ObjectId(orderId) })
                .populate({
                    path: 'systemProducts.productId',
                    model: 'Product',

                })
                .populate({
                    path: 'nonSystemProducts.productId',
                    model: 'Product',

                })
                .populate({
                    path: 'customer',
                    model: 'Customer',

                })
                .lean(true)
            const invoice_url = await invoicePDF(order._id);
            if (order) {
                //Update 31-10-2023
                //NOTE:Extracting the text before the first space character from the 'order.customer.email' string in case of deleted customer
                const emailBeforeExtract = order.customer.email
                const firstSpaceIndex = emailBeforeExtract.indexOf(' ');
                let extractedEmail;
                if (firstSpaceIndex !== -1) {
                    extractedEmail = emailBeforeExtract.substring(0, firstSpaceIndex);
                } else {
                    extractedEmail = emailBeforeExtract;
                }

                let invoice = {
                    shipping: {
                        name: order.customer.customername,
                        email: extractedEmail,
                        mobile: order.customer.mobile,
                        address: order.customer.address,
                    },
                    systemProducts: [],
                    nonSystemProducts: [],
                    vatPercentage: order.vatPercentage,
                    vatLabel: order.vatLabel,
                    subtotal: order.subTotal,
                    taxtTotal: order.taxTotal,
                    discountTotal: order.discountTotal,
                    couponDiscountAmount: order.couponDiscountAmount,
                    couponDiscountType: order.couponDiscountType,
                    grandTotal: order.grandTotal,
                    paidAmount: order.paidAmount,
                    refundedAmount: order.refundedAmount,
                    invoice_nr: "INV" + order.orderNumber.toString().padStart(5, 0),
                    currency: order.currency,
                    status: order.status
                };
                order.systemProducts.forEach(async (product) => {
                    //Update 31-10-2023
                    //NOTE: Using a regular expression to capture the text before any specified day names (Mon, Tues, Wed, etc.) IN case of delete product
                    let extractedTitle;
                    let matchExtractedTitle = product.productId.title.match(/(.*?)\b(?:Mon|Tue|Wed|Thur|Fri|Sat|Sun)/);
                    if (matchExtractedTitle) {
                        extractedTitle = matchExtractedTitle[1];
                    } else {
                        extractedTitle = product.productId.title;
                    }

                    let obj_ = {
                        _id: product._id,
                        item: extractedTitle,
                        quantity: product.quantity,
                        price: product.price,
                        subTotal: product.subTotal,
                        isRefunded: product.isRefunded
                    }

                    invoice.systemProducts.push(obj_)
                })

                order.nonSystemProducts.forEach(async (product) => {
                //Update 01-10-2023
                //NOTE: Using a regular expression to capture the text before any specified day names (Mon, Tues, Wed, etc.) IN case of delete product
                    let extractedTitle ='';
                    if( product.productId){
                   
                    let matchExtractedTitle = product.productId.title.match(/(.*?)\b(?:Mon|Tue|Wed|Thur|Fri|Sat|Sun)/);
                    if (matchExtractedTitle) {
                        extractedTitle = matchExtractedTitle[1];
                    } else {
                        extractedTitle = product.productId.title;
                    }
                   }

                    let obj_ = {
                        _id: product._id,
                        item: product.productId ? extractedTitle : "",
                        subTitle: product.designs[0].prompt,
                        color: product.color,
                        bodyPart: product.bodyPart,
                        subTotal: product.subTotal,
                        isRefunded: product.isRefunded,
                        innerDesign: [],
                    };

                    product.designs.forEach((design) => {
                        let inner_obj_ = {
                            image: design.image,
                            quantity: design.quantity,
                            price: design.price,
                        };
                        obj_.innerDesign.push(inner_obj_);
                    });

                    invoice.nonSystemProducts.push(obj_);
                });
                return res.json({ success: true, invoice })
            }
            else return res.status(400).send({ success: false, message: 'Order not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Order Id is required' })
    } catch (error) {
        return next(error)
    }
}
// API to get Order list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query

        let { orderNumber, customer, country, isInvoiced, productID, variationID, orderStatus, paymentMethod } = req.body
        const filter = {}


        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (customer) {
            filter.customer = mongoose.Types.ObjectId(customer);
        }
        if (orderNumber) {
            if (!isNaN(orderNumber)) {
                filter.orderNumber = parseInt(orderNumber)
            } else {
                var regex_pattern = /^SC\d{5}$/;
                var check = new RegExp(regex_pattern);
                if (check.test(orderNumber)) {
                    filter.orderNumber = parseInt(orderNumber.replace("SC", ""))
                } else {
                    filter.orderNumber = 9999999
                }

            }
        }
        if (paymentMethod)
            filter.transactionPlatform = paymentMethod
        if (country)
            filter.customerAddress = { $regex: ".*" + country + ".*" }

        if (orderStatus)
            filter.status = parseInt(orderStatus)


        if (isInvoiced) {
            // filter.isInvoiced = isInvoiced
            switch (isInvoiced) {
                case "0":
                    filter.isInvoiced = false
                    break
                case "1":
                    filter.isInvoiced = true
                    break
            }
        }


        const total = await Order.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const orders = await Order.aggregate([
            { $match: filter },
            { $sort: { orderNumber: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { customername: 1, email: 1, mobile: 1 } }
                    ],
                    as: "customer"
                }
            },
            {
                $lookup: {
                    from: "pricelists",
                    localField: "priceList",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1 } }
                    ],
                    as: "priceList"
                }
            },
            {
                $project: {
                    _id: 1,
                    orderNumber: 1,
                    status: 1,
                    customer: 1,
                    priceList: 1,
                    vatPercentage: 1,
                    vatLabel: 1,
                    transactionPlatform: 1,
                    subTotal: 1,
                    taxTotal: 1,
                    discountTotal: 1,
                    refundedAmount: 1,
                    grandTotal: 1,
                    createdAt: 1
                }
            }
        ])
        const ordersStatsResult = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    "status": { $first: '$status' },
                    "count": { $sum: 1 }
                },
            },
            {
                $project: {
                    "status": 1,
                    "count": 1,
                }
            }
        ])
        let ordersStats = []
        ordersStats[0] = ordersStatsResult.find((o_) => { return o_.status == 0 })?.count
        ordersStats[1] = ordersStatsResult.find((o_) => { return o_.status == 1 })?.count
        ordersStats[2] = ordersStatsResult.find((o_) => { return o_.status == 2 })?.count
        ordersStats[3] = ordersStatsResult.find((o_) => { return o_.status == 3 })?.count
        ordersStats[4] = ordersStatsResult.find((o_) => { return o_.status == 4 })?.count
        return res.send({
            success: true,
            data: {
                ordersStats,
                orders,
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
// API to update Order Status
exports.registerPayment = async (req, res, next) => {
    try {
        let payload = req.body;
        let setData;
        const orders = await Order.findOne({ _id: payload._id })

        if (payload.paidStatus === "2") {
            setData = { paidAmount: 0 }
        } else {
            setData = { paidAmount: orders.grandTotal }
        }
        const order = await Order.findByIdAndUpdate({ _id: payload._id }, { $set: setData }, { new: true })
        try {
            await fs.unlinkSync(`./src/uploads/quotations/INV${order.orderNumber.toString().padStart(5, 0)}.pdf`)
        } catch (error) {

        }
        const invoice_url = await invoicePDF(order._id)
        return res.send({ success: true, message: 'Invoice status updated successfully', order })


    } catch (error) {
        return next(error)
    }
}
// API for Validate Coupon and apply discount
exports.validateCoupon = async (req, res, next) => {
    try {
        let { promotionId, customer, orderData, isEditOrder } = req.body

        const coupon = await Promotions.findOne({ _id: promotionId })

        if (coupon) {
            if (orderData != null) {
                let cart = await validateAndApplyCouponCode(orderData, coupon, true, isEditOrder);
                if (cart.isValid) {
                    return res.status(200).send({
                        status: 1,
                        message: 'Coupon applied successfully',
                        cart: cart.cart
                    })
                } else {
                    return res.status(200).send({
                        status: 1,
                        message: 'Invalid coupon code',
                        cart: orderData
                    })
                }
            } else {
                return res.status(400).send({ success: false, message: 'Sorry, your cart is empty' })
            }
        }
        else {
            return res.status(400).send({ success: false, message: 'Invalid coupon code', cart: orderData })
        }

    } catch (error) {
        return next(error)
    }





}
// API to refund the order eithr full or partial
exports.refundAmount = async (req, res, next) => {
    try {
        let { orderId, refundAmount, refundPayload } = req.body
        refundPayload = JSON.parse(refundPayload)
        let systemRefunds = refundPayload.filter(rp => rp.type == 0)
        let nonSystemRefunds = refundPayload.filter(rp => rp.type == 1)

        let order = await Order.findOne({ _id: orderId })
        let remainingAmount= order.paidAmount - order.refundedAmount
        remainingAmount=  remainingAmount.toFixed()
        if (remainingAmount >= refundAmount) {
            order.systemProducts.map(osp => {
                let check = systemRefunds.filter(sr => sr.productId == osp._id)
                if (check.length > 0) {
                    osp.isRefunded = true
                }
            })
            order.nonSystemProducts.map(onsp => {
                let check = nonSystemRefunds.filter(nsr => nsr.productId == onsp._id)
                if (check.length > 0) {
                    onsp.isRefunded = true
                }
            })
            order.refundedAmount = order.refundedAmount ? order.refundedAmount + refundAmount : refundAmount
            order.refundedDate = new Date()
            order.refundedMsg = "Refund Approved"
            order.save()
            let refund = null
            if (order.transactionPlatform == "Stripe") {
                refund = await makeStripeRefund(order.transactionId, refundAmount)
            } else if (order.transactionPlatform == "PayPal") {
                refund = await makePaypalRefund(order.transactionId, refundAmount)
            }
            const customer = await Customer.findOne({ _id: order.customer });
            const invoice_url = await invoicePDF(order._id)


            let settings = await Settings.findOne({}, 'orderEmailRecipients')
            settings = settings.orderEmailRecipients
            settings = settings.split(",")

            let emailData = {
                name: customer.customername,
                bcc: settings,
                orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
                email: customer.email,
                currentRefunded:refundAmount,
                totalRefunded:order.refundedAmount,

            }
            await sendNotification(customer._id, 'Order Refunded', `Your order with ID ${emailData.orderNumber} has been refunded.`)
            sendEmail('order_refunded', emailData)
            return res.send({ success: true, message: 'Payment refunded successfully', order })
        }
        return res.send({ success: true, message: 'Payment cannot be refunded', order })

    } catch (error) {
        return next(error)
    }
}
