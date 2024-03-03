const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

/**
 * Bug Report Schema
 * @private
 */
const BugReportSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    reply: { type: String },
    status: { type: Boolean, default: false},
}, { timestamps: true }
);


/**
 * @typedef BugReport
 */

module.exports = mongoose.model('BugReport', BugReportSchema);