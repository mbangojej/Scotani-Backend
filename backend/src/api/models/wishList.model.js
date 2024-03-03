const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

/**
 * WishList Schema
 * @private
 */
const WishListSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }
}, { timestamps: true }
);


/**
 * @typedef Cart
 */

module.exports = mongoose.model('WishList', WishListSchema);