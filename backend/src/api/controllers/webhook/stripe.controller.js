const Order = require('../../models/order.model')


exports.refundUpdateWebhook = async (req, res, next) => {
    const { data } = req.body
    const { payment_intent } = data.object
    let order = await Order.findOneAndUpdate({transactionId: payment_intent}, {$set: {refundedMsg: "Refund Successful"}},{ new: true })
    return res.send({ success: true })
}