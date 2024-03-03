const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

/**
 * Notification Schema
 * @private
 */
const NotificationSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    title: { type: String, required: true, },
    description: { type: String, required: true, default: '' },
    status: { type: Boolean, default: false },

}, { timestamps: true }
);


/**
 * @typedef Notification
 */

module.exports = mongoose.model('Notification', NotificationSchema);