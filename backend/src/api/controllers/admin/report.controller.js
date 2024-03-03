const Order = require('../../models/order.model')
const fs = require('fs')
const mongoose = require('mongoose');
const moment = require('moment')
var xl = require('excel4node');
// API for Sales Report
exports.salesReport = async (req, res, next) => {
    try {

        let { page, limit } = req.query
        let {
            startDate,
            endDate,
            customerID,
            productID,
            status,
            invoiceStatus
        } = req.body




        let filter = {}
        if (startDate) {
            const creationEndDateforHour = new Date(endDate);
            creationEndDateforHour.setHours(23, 59, 59, 999);

            filter.createdAt = {
                '$gt': new Date(startDate),
                '$lte': creationEndDateforHour
            }
        }
        if (customerID) {
            filter.customer = mongoose.Types.ObjectId(customerID)
        }
        if (productID) {
            filter["systemProducts.productId"] = mongoose.Types.ObjectId(productID)
        }
        if (status || status === 0) {
            filter.status = parseInt(status)
        }

        if (invoiceStatus == 0 || invoiceStatus == 1 || invoiceStatus == 2 || invoiceStatus == 3 || invoiceStatus == 4) {

            switch (invoiceStatus) {
                case 0: // Not Invoiced
                    filter.isInvoiced = false
                    break
                case 1: // Invoiced
                    filter.isInvoiced = true
                    break
                case 2: // Unpaid
                    filter.isInvoiced = true
                    filter.paidAmount = 0
                    break
                case 3: // Partially Paid
                    filter.isInvoiced = true
                    filter["$expr"] = {
                        $ne: ["$paidAmount", "$grandTotal"]
                    }
                    filter["$expr"] = {
                        $gt: ["$paidAmount", 0]
                    }
                    break
                case 4: // Paid
                    filter.isInvoiced = true
                    filter["$expr"] = {
                        $eq: ["$paidAmount", "$grandTotal"]
                    }
                    break
            }
        }



        const ordersStats = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '',
                    "subTotal": { $sum: '$subTotal' },
                    "discountTotal": { $sum: '$discountTotal' },
                    "taxTotal": { $sum: '$taxTotal' },
                    "grandTotal": { $sum: '$grandTotal' },
                    "refundedAmount": { $sum: '$refundedAmount' }
                },
            },
            {
                $project: {
                    _id: 0,
                    "subTotal": '$subTotal',
                    "discountTotal": '$discountTotal',
                    "taxTotal": '$taxTotal',
                    "grandTotal": '$grandTotal',
                    "refundedAmount": '$refundedAmount'
                }
            }
        ])
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

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
                    vatPercentage: 1,
                    subTotal: 1,
                    taxTotal: 1,
                    discountTotal: 1,
                    grandTotal: 1,
                    refundedAmount: 1,
                    createdAt: 1,
                    paidAmount: 1
                }
            }
        ])
        let orderChartData = await Order.aggregate([
            { $match: filter },
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

        const ordersDownloads = await Order.aggregate([
            { $match: filter },
            { $sort: { orderNumber: -1 } },
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
                    vatPercentage: 1,
                    subTotal: 1,
                    taxTotal: 1,
                    discountTotal: 1,
                    grandTotal: 1,
                    refundedAmount: 1,
                    createdAt: 1,
                    paidAmount: 1
                }
            }
        ])
        let filename = await downloadSaleReport(ordersDownloads, ordersStats[0])
        return res.send({
            success: true,
            filename: filename,
            chartData,
            orderChartData,
            ordersStats,
            orders,
            pagination: {
                page, limit, total,
                pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}
// API to download Invoice Report
const downloadSaleReport = async (orders, ordersStats) => {
    try {
        var currency = {
            code: "",
            symbol: "$",
        }
        var wb = new xl.Workbook();
        var style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
        });
        var ws = wb.addWorksheet('Sheet 1');
        ws.cell(1, 1)
            .string('Order Stats')
            .style(style);

        ws.cell(2, 1)
            .string('Total Sales')
            .style(style);
        ws.cell(2, 2)
            .string(currency.symbol + parseFloat(ordersStats.grandTotal).toFixed(2) + ' ' + currency.code)
            .style(style);

        ws.cell(3, 1)
            .string('Total Discount')
            .style(style);
        ws.cell(3, 2)
            .string(currency.symbol + parseFloat(ordersStats.discountTotal).toFixed(2) + ' ' + currency.code)
            .style(style);

        ws.cell(4, 1)
            .string('Total Refunded')
            .style(style);
        ws.cell(4, 2)
            .string(currency.symbol + parseFloat(ordersStats.refundedAmount).toFixed(2) + ' ' + currency.code)
            .style(style);

        ws.cell(5, 1)
            .string('Untaxed Total')
            .style(style);
        ws.cell(5, 2)
            .string(currency.symbol + parseFloat(ordersStats.grandTotal - ordersStats.taxTotal).toFixed(2) + ' ' + currency.code)
            .style(style);


        ws.cell(6, 1)
            .string('Total Taxes')
            .style(style);
        ws.cell(6, 2)
            .string(currency.symbol + parseFloat(ordersStats.taxTotal).toFixed(2) + ' ' + currency.code)
            .style(style);

        ws.cell(7, 1)
            .string('No. of Orders')
            .style(style);
        ws.cell(7, 2)
            .string(parseFloat(orders.length) + '       ')
            .style(style);


        ws.cell(9, 1)
            .string('Order Number')
            .style(style);

        ws.cell(9, 2)
            .string('Discount Total')
            .style(style);
        ws.cell(9, 3)
            .string('Total')
            .style(style);
        ws.cell(9, 4)
            .string('Refunded Amount')
            .style(style);
        ws.cell(9, 5)
            .string('Order Date')
            .style(style);
        ws.cell(9, 6)
            .string('Status')
            .style(style);
        let i = 10

        orders.map((order, index) => {
            ws.cell(i, 1)
                .string("SC" + order.orderNumber.toString().padStart(5, 0))
                .style(style);

            ws.cell(i, 2)
                .string(currency.symbol + parseFloat(isNaN(order.discountTotal) ? 0 : order.discountTotal).toFixed(2) + ' ' + currency.code)
                .style(style);

            ws.cell(i, 3)
                .string(currency.symbol + parseFloat(isNaN(order.grandTotal) ? 0 : order.grandTotal).toFixed(2) + ' ' + currency.code)
                .style(style);

            ws.cell(i, 4)
                .string(currency.symbol + parseFloat(isNaN(order.refundedAmount) ? 0 : order.refundedAmount).toFixed(2) + ' ' + currency.code)
                .style(style);

            ws.cell(i, 5)
                .string(moment(order.createdAt).format('MM-DD-YYYY'))
                .style(style);

            if (order.status == 0)
                ws.cell(i, 6)
                    .string("Order Received")
                    .style(style);

            if (order.status == 1)
                ws.cell(i, 6)
                    .string("Processing")
                    .style(style);

            if (order.status == 2)
                ws.cell(i, 6)
                    .string("On the way")
                    .style(style);

            if (order.status == 3)
                ws.cell(i, 6)
                    .string("Delivered")
                    .style(style);

            if (order.status == 4)
                ws.cell(i, 6)
                    .string("Cancelled")
                    .style(style);

            i = i + 1

        })
        fs.mkdir('./src/uploads/reports/sales',
            { recursive: true }, (err) => {
                if (err) {
                }
            });
        let filename = 'Sales_Report_' + moment().format("MM-DD-YYYY") + '.xlsx'
        let path = './src/uploads/reports/sales/' + filename
        wb.write(path);
        return 'sales/' + filename
    } catch (error) {

    }
}

// API for Invoice Report
exports.invoiceReport = async (req, res, next) => {
    try {

        let { page, limit, all } = req.query
        let {
            creationStartDate,
            creationEndDate,
            updationStartDate,
            updationEndDate,
            orderNumber,
            invoiceNumber,
            customerID,
            productID,
            variationID,
            status,
            paymentMethod
        } = req.body



        let filter = {}
        let options = []

        filter.isInvoiced = true
        if (creationStartDate) {
            const creationEndDateforHour = new Date(creationEndDate);
            creationEndDateforHour.setHours(23, 59, 59, 999);

            filter.invoicedAt = {
                '$gte': new Date(creationStartDate),
                '$lte': creationEndDateforHour
            }
        }
        if (updationStartDate) {
            const updationEndDateforHour = new Date(updationEndDate);
            updationEndDateforHour.setHours(23, 59, 59, 999);
            filter.updatedAt = {
                '$gte': new Date(updationStartDate),
                '$lte': new Date(updationEndDateforHour)
            }
        }

        if (orderNumber) {
            filter.orderNumber = parseInt(orderNumber)
        }

        if (invoiceNumber) {
            filter.orderNumber = parseInt(invoiceNumber)
        }

        if (paymentMethod) {
            filter.transactionPlatform = paymentMethod
        }
        if (customerID) {
            filter.customer = mongoose.Types.ObjectId(customerID)
        }
        if (productID) {
            filter["systemProducts.productId"] = mongoose.Types.ObjectId(productID)
        }
        if (variationID) {
            filter["products.productVariationID"] = mongoose.Types.ObjectId(variationID)
        }// 'Un Paid': '2', 'Partially Paid': '3', 'Paid': '4'
        if (status == 2 || status == 3 || status == 4) {

            switch (status) {
                case 2: // Unpaid
                    filter.isInvoiced = true
                    filter.paidAmount = 0
                    break
                case 3: // Partially Paid
                    filter.isInvoiced = true
                    filter.paidAmount = { $gt: 0 }
                    filter["$expr"] = {
                        $lt: ["$paidAmount", "$grandTotal"]
                    }
                    break
                case 4: // Paid
                    filter.isInvoiced = true
                    filter["$expr"] = {
                        $eq: ["$paidAmount", "$grandTotal"]
                    }
                    break
            }
        }

        options.push(
            { $match: filter },
        )



        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await Order.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const invoices = await Order.aggregate([
            ...options,
            { $sort: { orderNumber: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
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
                $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { customername: 1 } }
                    ],
                    as: "customername"
                }
            },
            { $unwind: { path: '$customername', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, orderNumber: 1, status: 1, customer: 1, priceList: 1, customername: '$customername.customername', vatPercentage: 1, subTotal: 1, taxTotal: 1, discountTotal: 1, grandTotal: 1, createdAt: 1, updatedAt: 1, paidAmount: 1, isInvoiced: 1, transactionPlatform: 1, invoicedAt: 1, currency: 1
                }
            }
        ])


        const invoicesDownolad = await Order.aggregate([
            ...options,
            { $sort: { orderNumber: -1 } },
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
                $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { customername: 1 } }
                    ],
                    as: "customername"
                }
            },
            { $unwind: { path: '$customername', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    orderNumber: 1,
                    status: 1,
                    customer: 1,
                    priceList: 1,
                    customerName: '$customername.customername',
                    customerEmail: '$customername.email',
                    vatPercentage: 1,
                    subTotal: 1,
                    taxTotal: 1,
                    discountTotal: 1,
                    grandTotal: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    paidAmount: 1,
                    isInvoiced: 1,
                    transactionPlatform: 1,
                    invoicedAt: 1, currency
                        : 1
                }
            }
        ])


        let filename = await downloadInvoiceReport(invoicesDownolad)
        return res.send({
            success: true,
            invoices,
            filename: filename,
            pagination: {
                page, limit, total,
                pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}
// API to download Invoice Report
const downloadInvoiceReport = async (invoices) => {
    try {
        var wb = new xl.Workbook();
        var style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
        });
        var ws = wb.addWorksheet('Sheet 1');
        ws.cell(1, 1)
            .string('Invoice Number')
            .style(style);
        ws.cell(1, 2)
            .string('Order Number')
            .style(style);
        ws.cell(1, 3)
            .string('Customer')
            .style(style);
        ws.cell(1, 4)
            .string('Creation Date')
            .style(style);
        ws.cell(1, 5)
            .string('Updation Date')
            .style(style);
        ws.cell(1, 6)
            .string('Discount Amount')
            .style(style);
        ws.cell(1, 7)
            .string('Total Amount')
            .style(style);
        ws.cell(1, 8)
            .string('Paid Amount')
            .style(style);
        ws.cell(1, 9)
            .string('Status')
            .style(style);
        ws.cell(1, 10)
            .string('Payment Method')
            .style(style);
        let i = 2

        invoices.map((invoice, index) => {

            ws.cell(i, 1)
                .string("INV" + invoice.orderNumber.toString().padStart(5, 0))
                .style(style);

            ws.cell(i, 2)
                .string("SC" + invoice.orderNumber.toString().padStart(5, 0))
                .style(style);

            ws.cell(i, 3)
                .string(`${invoice.customerName}`)
                .style(style);

            ws.cell(i, 4)
                .string(moment(invoice.invoicedAt).format('MM-DD-YYYY'))
                .style(style);

            ws.cell(i, 5)
                .string(moment(invoice.updatedAt).format('MM-DD-YYYY'))
                .style(style);

            ws.cell(i, 6)
                .string('$' + parseFloat(invoice.discountTotal).toFixed(2))
                .style(style);

            ws.cell(i, 7)
                .string('$' + parseFloat(invoice.grandTotal).toFixed(2))
                .style(style);

            ws.cell(i, 8)
                .string('$' + parseFloat(invoice.paidAmount).toFixed(2))
                .style(style);

            if (invoice.paidAmount == 0)
                ws.cell(i, 9)
                    .string("Unpaid")
                    .style(style);

            if (invoice.paidAmount > 0 && invoice.paidAmount < invoice.grandTotal)
                ws.cell(i, 9)
                    .string("Partially Paid")
                    .style(style);

            if (invoice.paidAmount == invoice.grandTotal.toFixed(2))
                ws.cell(i, 9)
                    .string("Paid")
                    .style(style);

            ws.cell(i, 10)
                .string(invoice.transactionPlatform)
                .style(style);
            i = i + 1
        })

        fs.mkdir('./src/uploads/reports/invoice',
            { recursive: true }, (err) => {
                if (err) {
                }
            });

        let filename = 'Invoice_Report_' + moment().format("MM-DD-YYYY") + '.xlsx'
        let path = './src/uploads/reports/invoice/' + filename
        wb.write(path);
        return 'invoice/' + filename
    } catch (error) {

    }
}

