const Order = require('../../models/order.model')
const ProductVariation = require('../../models/productVariation.model')
const SizeGroup = require('../../models/sizeGroups.model')
const Cart = require('../../models/cart.model')
const { invoicePDF } = require('../../utils/util')
const Settings = require('../../models/settings.model')
const Customer = require('../../models/customers.model')
const { sendEmail } = require('../../utils/emails/emails')
const mongoose = require('mongoose');
const { title } = require('process')

// API to get order history

exports.orderHistory = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        let { all } = req.query
        let { querySearch, page, limit, } = req.body
        if (!page) {
            page = req.params.page
        }
        const filter = {
            customer: mongoose.Types.ObjectId(userAgent),
            isDeleted: 0
        }
        var titleFilter = {};
        if (querySearch) {              // Search for only order numbers
            let parsedQuerySearch = parseInt(querySearch)
            if (!Number.isNaN(parsedQuerySearch)) {
                titleFilter = {
                    'orderID': parsedQuerySearch
                }
            } else {
                titleFilter = {
                    'orderID': parseInt(querySearch.replace('SC', ''))
                };
            }
        }
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all || querySearch)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10
        let pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]
        if (!all && !querySearch) {
            pipeline.push({ $skip: limit * (page - 1) })
            pipeline.push({ $limit: limit })
        }
        pipeline.push(
            {
                $lookup: {
                    from: "products",
                    localField: "systemProducts.productId",
                    foreignField: "_id",
                    as: "systemProducts",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                productID: "$_id",
                                productImage: "$image",
                                productName: "$title",
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$nonSystemProducts',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "nonSystemProducts.productId",
                    foreignField: "_id",
                    as: "matchedProduct"
                }
            },
            {
                $addFields: {
                    nonSystemProducts: {
                        $map: {
                            input: "$nonSystemProducts.designs",
                            as: "design",
                            in: {
                                productName: {
                                    $cond: [
                                        { $ifNull: ["$nonSystemProducts.productId", null] },
                                        "$$design.prompt",
                                        { $arrayElemAt: ["$matchedProduct.title", 0] }
                                    ]
                                },
                                productImage: "$$design.image",
                            },
                        }


                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    orderID: { $first: "$orderNumber" },
                    orderDate: { $first: "$createdAt" },
                    orderStatus: { $first: "$status" },
                    deliveredDate: { $first: "$deliveredDate" },
                    refundedAmount: { $first: "$refundedAmount" },
                    refundedDate: { $first: "$refundedDate" },
                    orderPrice: { $first: "$grandTotal" },
                    nonSystemProducts: { $push: "$nonSystemProducts" },
                    systemProducts: { $first: "$systemProducts" },
                    processingDate: { $first: "$processingDate" },
                    onTheWayDate: { $first: "$onTheWayDate" },
                    cancelledDate: { $first: "$cancelledDate" },
                    refundedMsg: { $first: "$refundedMsg" },
                }
            },
            {
                $project: {
                    orderID: 1,
                    orderDate: 1,
                    orderStatus: 1,
                    deliveredDate: 1,
                    orderPrice: 1,
                    nonSystemProducts: 1,
                    systemProducts: 1,
                    processingDate: 1,
                    onTheWayDate: 1,
                    cancelledDate: 1,
                    refundedAmount: 1,
                    refundedDate: 1,
                    refundedMsg: 1,
                },
            },
            {
                $match: titleFilter,
            },
            {
                $sort: { orderID: -1 }
            }
        )
        const orders = await Order.aggregate(pipeline)
        const total = await Order.countDocuments(filter)
        for (let i = 0; i < orders.length; i++) {
            orders[i].orderStatus = orders[i].refundedAmount > 0 ? 5 : orders[i].orderStatus
            orders[i].nonSystemProducts = orders[i].nonSystemProducts.filter(o => o);
            orders[i].systemProducts = orders[i].systemProducts.filter(o => o);
            if (!orders[i].nonSystemProducts[0]) {
                orders[i].nonSystemProducts[0] = []
            }
            orders[i].products = orders[i].nonSystemProducts[0].concat(orders[i].systemProducts)
            orders[i].orderID = "SC" + orders[i].orderID.toString().padStart(5, 0)

            delete orders[i].systemProducts
            delete orders[i].nonSystemProducts
        }

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        return res.status(200).send({
            status: 1,
            message: 'Orders fetched',
            data: {
                orders: orders,
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

// API to delete an order
exports.orderDelete = async (req, res, next) => {
    try {
        const { orderId } = req.body
        let setData = { isDeleted: 1 }
        const order = await Order.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(orderId) }, { $set: setData }, { new: true })
        return res.status(200).send({
            status: 1,
            message: 'Order Deleted successfully',
        });
    } catch (error) {
        return next(error)
    }
};

// API to get SizeGroup list
exports.sizeGroup = async (req, res, next) => {
    try {
        let { all } = req.query
        let { type, bodyPart, page, limit, } = req.body
        console.log('type')
        console.log(type)
        // Check if 'type' is empty or not a number
        if (type === "" || isNaN(type)) {
            return res.status(400).send({ status: 0, message: 'Type is Required' });
        }
        // Check for validation when 'type' is 0 (Tattoo)
        if (type == 0 && (bodyPart === "" || isNaN(bodyPart))) {
            return res.status(400).send({ status: 0, message: 'Body Part is required and must be a valid number in case of Tattoo' });
        }

        const filter = { typeOfSizeGroup: parseInt(type), isDeleted: { $ne: true } }

        if (type == 0 && bodyPart)
            filter.bodyParts = { $in: [parseInt(bodyPart)] };



        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await SizeGroup.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


        let pipeline = [
            { $match: filter },
            { $sort: { startingWidth: 1, endingWidth: 1 } }
        ]

        if (!all) {
            pipeline.push({ $skip: limit * (page - 1) })
            pipeline.push({ $limit: limit })
        }
        if (type == 1) {
            pipeline.push({
                $addFields: {
                    // price: "$configurableProductPrice",
                    price: {
                        blackNWhite: 0,
                        colored: 0,
                        mixed: "$configurableProductPrice",
                    }
                }
            })
        }
        else if (type == 0) {
            pipeline.push({
                $addFields: {
                    price: {
                        blackNWhite: "$blackAndWhitePrice",
                        colored: "$coloredPrice",
                        mixed: "$mixedPrice",
                    }
                }
            })
        } else {
            pipeline.push({
                $addFields: {
                    price: {
                        blackNWhite: 0,
                        colored: 0,
                        mixed: 0,
                    }
                }
            })
        }
        pipeline.push(
            {
                $project: {
                    startingWidth: 1,
                    endingWidth: 1,
                    price: 1,
                }
            }
        )


        const sizeGroups = await SizeGroup.aggregate(pipeline)

        // Calculate minStartingWidth and maxEndingWidth

        const startingWidth = await SizeGroup.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minStartingWidth: { $min: "$startingWidth" }
                }
            },
            {
                $project: {
                    _id: 0,
                    minStartingWidth: 1
                }
            },
            { $unwind: "$minStartingWidth" }
        ])


        const endingWidth = await SizeGroup.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    maxEndingWidth: { $max: "$endingWidth" }
                }
            },
            {
                $project: {
                    _id: 0,
                    maxEndingWidth: 1
                }
            },
            { $unwind: "$maxEndingWidth" }
        ])

        console.log(startingWidth)


        return res.status(200).send({
            status: 1,
            message: 'Size groups fetched successfully',
            data: {
                sizeLimits: {
                    start: startingWidth[0]?.minStartingWidth,
                    end: endingWidth[0]?.maxEndingWidth
                },
                sizeGroups,
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
}

// API to  reorder
exports.reorder = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        const { orderId } = req.body
        const order = await Order.findOne({ _id: orderId }).lean(true)
        const lastOrder = await Order.find().limit(1).sort({ $natural: -1 })

        order.systemProducts.map((osp, index) => {
            order.systemProducts[index].isRefunded = false
        })
        order.nonSystemProducts.map((onsp, index) => {
            order.nonSystemProducts[index].isRefunded = false
        })
        let payload = {
            orderNumber: lastOrder[0] ? lastOrder[0].orderNumber + 1 : 1,
            isInvoiced: false,
            paidAmount: 0,
            customer: userAgent,
            vatPercentage: order.vatPercentage,
            status: 0,
            subTotal: order.subTotal,
            taxTotal: order.taxTotal,
            grandTotal: order.grandTotal,
            systemProducts: order.systemProducts,
            nonSystemProducts: order.nonSystemProducts,
            discountTotal: order.discountTotal,
            couponDiscountType: order.couponDiscountType,
            couponDiscountAmount: order.couponDiscountAmount,
            promotionId: order.promotionId,
        }
        const newOrder = await Order.create(payload)

        return res.status(200).send({
            status: 1,
            message: 'Order created successfully',
            data: {
                id: newOrder._id,
                orderID: newOrder.orderNumber
            }
        });
    } catch (error) {
        return next(error)
    }
};


/* API to get a Order detail
Update 28-08-2023 
Note :Change Api response 
*/
exports.orderDetail = async (req, res, next) => {
    try {
        const { orderId } = req.params
        if (orderId) {

            const order = await Order.aggregate([

                { $match: { _id: mongoose.Types.ObjectId(orderId) } },
                {
                    $lookup: {
                        from: "products",
                        localField: "systemProducts.productId",
                        foreignField: "_id",
                        as: "systemProducts_",
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    productID: "$_id",
                                    productImage: "$image",
                                    productName: "$title",
                                    isRefunded: "$systemProducts.isRefunded",
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$nonSystemProducts',
                        preserveNullAndEmptyArrays: true,
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "nonSystemProducts.productId",
                        foreignField: "_id",
                        as: "matchedProduct"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderID: { $first: "$orderNumber" },
                        orderDate: { $first: "$createdAt" },
                        orderStatus: { $first: "$status" },
                        deliveredDate: { $first: "$deliveredDate" },
                        orderPrice: { $first: "$grandTotal" },
                        nonSystemProducts: { $push: "$nonSystemProducts" },
                        systemProducts: { $first: "$systemProducts" },
                        systemProducts_: { $first: "$systemProducts_" },
                        refundedAmount: { $first: "$refundedAmount" },
                        refundedMsg: { $first: "$refundedMsg" },
                        refundedDate: { $first: "$refundedDate" },
                        grandTotal: { $first: "$grandTotal" },
                    }
                },
                {
                    $project: {
                        orderID: 1,
                        orderDate: 1,
                        orderStatus: 1,
                        deliveredDate: 1,
                        orderPrice: 1,
                        products: 1,
                        nonSystemProducts: 1,
                        systemProducts: 1,
                        systemProducts_: 1,
                        refundedAmount: 1,
                        refundedMsg: 1,
                        refundedDate: 1,
                        grandTotal: 1,
                    }
                }
            ])
            order[0].nonSystemProducts = order[0].nonSystemProducts.filter(o => o);
            order[0].systemProducts_ = order[0].systemProducts_.filter(o => o);
            order[0].systemProducts_.map((product, index) => {
                if (product.productID) {
                    order[0].systemProducts.map(p_ => {
                        if (product.productID.equals(p_.productId)) {
                            order[0].systemProducts_[index].isRefunded = p_.isRefunded
                        }

                    })
                }
            })
            if (!order[0].nonSystemProducts[0]) {
                order[0].nonSystemProducts = []
            }
            order[0].products = order[0].nonSystemProducts.concat(order[0].systemProducts_)
            order[0].orderID = "SC" + order[0].orderID.toString().padStart(5, 0)

            const productNames = order[0].products.map(product => product.productName);
            const concatenatedProductNames = productNames.join(', ');
            order[0].aboutOrder = concatenatedProductNames;
            delete order[0].systemProducts
            delete order[0].systemProducts_
            delete order[0].nonSystemProducts

            if (order[0].orderStatus === 0) {
                order[0].orderStatus = "Order Received"
            }
            if (order[0].orderStatus === 1) {
                order[0].orderStatus = "Processing"
            }
            if (order[0].orderStatus === 2) {
                order[0].orderStatus = "On The Way"
            }
            if (order[0].orderStatus === 3) {
                order[0].orderStatus = "Delivered"
            }
            if (order[0].orderStatus === 4) {
                order[0].orderStatus = "Cancel"
            }
            if (order[0].refundedAmount > 0) {
                order[0].orderStatus = order[0].refundedAmount < order[0].grandTotal ? "Partially Refunded" : "Refunded"
            }
            /// Update: 01-10-2023
            // Functionality: Using a regular expression to extract text before any specified day names(Mon, Tues, Wed, etc.) In case of deleted product title.
            // Note: If any issues arise or if this code causes problems, consider removing below code.
            order[0].products = order[0].products.map(product => {
                if (product.productID) {
                    let extractedTitle;
                    let matchExtractedTitle = product.productName.match(/^(.*?)\b(?:Mon|Tue|Wed|Thur|Fri|Sat|Sun)/);
                    if (matchExtractedTitle) {
                        extractedTitle = matchExtractedTitle[1];
                    } else {
                        extractedTitle = product.productName;
                    }

                    return {
                        ...product,
                        productName: extractedTitle.trim()
                    };
                } else {
                    return product;
                }
            });


            if (order) {
                return res.status(200).send({
                    status: 1,
                    message: 'Order detail fetch successfully',
                    order
                });
            }
            else return res.status(400).send({ success: false, message: 'Order not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Order Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to place order / checkout
exports.checkout = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        const cart = await Cart.findOne({ customer: mongoose.Types.ObjectId(userAgent), isCheckout: false }).lean(true)
        if (cart != null && (cart.systemProducts.length > 0 || cart.nonSystemProducts.length > 0)) {
            const lastOrder = await Order.find().limit(1).sort({ $natural: -1 })
            // cart.orderNumber = lastOrder[0] ? lastOrder[0].orderNumber + 1 : 1
            cart.status = 0;
            delete cart._id
            delete cart.createdAt
            delete cart.updatedAt
            const order = await Order.create(cart)
            await Cart.deleteOne({ customer: userAgent })

            const customer = await Customer.findOne({ _id: mongoose.Types.ObjectId(userAgent) });
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
            return res.status(200).send({
                status: 1,
                message: 'Order created successfully',
                order
            });
        }
        else return res.status(400).send({ success: false, message: 'Your cart is empty' })
    } catch (error) {
        return next(error)
    }
}
// API to confirm a transaction
exports.confirmTransaction = async (req, res, next) => {
    try {
        const { orderId, transactionId, transactionPlatform } = req.body;


        if (!orderId || !transactionId || !transactionPlatform) {
            return res.status(400).json({
                status: 0,
                message: 'orderId, transactionId, and transactionPlatform are required fields.',
            });
        }
        const order = await Order.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(orderId) },
            { $set: { transactionId, transactionPlatform, isInvoiced: true } },
            { new: true }
        ).lean();

        if (order) {
            let o = await Order.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(orderId) },
                { $set: { paidAmount: order.grandTotal, invoicedAt: new Date } },
                { new: true }
            ).lean();
            return res.status(200).json({
                status: 1,
                message: 'Transaction Id updated',
                order,
            });
        } else {
            return res.status(404).json({
                status: 0,
                message: 'Order not found',
            });
        }
    } catch (error) {

        return next(error);
    }
};
// API to cancel an order
exports.cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;


        if (!orderId) {
            return res.status(400).json({
                status: 0,
                message: 'orderId is  required fields.',
            });
        }

        const order = await Order.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(orderId) },
            { $set: { status: 4, cancelledDate: new Date() } },
            { new: true }
        ).lean();

        if (order) {
            const customer = await Customer.findOne({ _id: order.customer });
            let settings = await Settings.findOne({}, 'orderEmailRecipients')
            settings = settings.orderEmailRecipients
            settings = settings.split(",")

            let emailData = {
                name: customer.customername,
                bcc: settings,
                orderNumber: `SC${order.orderNumber.toString().padStart(5, 0)}`,
                email: customer.email
            }
            sendEmail('order_cancelled', emailData)

            return res.status(200).json({
                status: 1,
                message: 'Order cancelled',
                order,
            });
        } else {
            return res.status(404).json({
                status: 0,
                message: 'Order not found',
            });
        }
    } catch (error) {

        return next(error);
    }
};