const { stripeSecretKey } = require('../../config/vars')
const stripe = require('stripe')(stripeSecretKey);

exports.retrieveStripeTransaction = async (transactionId) => {
    try {
        const transaction = await stripe.issuing.transactions.retrieve(
            transactionId
        );
        return transaction
    } catch (e) {
        console.log("🚀 ~ file: stripe.js:13 ~ exports.retrieveTransaction= ~ e:", e)
    }
}

exports.makeStripeRefund = async (paymentIntend, amount = 0) => {
    try {
        let refund = null
        if (amount > 0) {
            refund = await stripe.refunds.create({
                payment_intent: paymentIntend,
                amount: amount * 100,
            });

        } else {
            refund = await stripe.refunds.create({
                payment_intent: paymentIntend,
            });

        }
        return refund
    } catch (e) {
        console.log("🚀 ~ file: stripe.js:34 ~ exports.makeRefund= ~ e:", e)
    }
}

exports.createStripeCharge = async (amount, currency, description) => {
    try {
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: currency,
            description: description,
        });
        return charge
    } catch (e) {
        console.log("🚀 ~ file: stripe.js:46 ~ exports.createCharge= ~ e:", e)
    }
}