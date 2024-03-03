const { text } = require('express');
const mongoose = require('mongoose');

/**
 * Email Schema
 * @private
 */
const EmailTemplatesSchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true },
    title: { type: String, required: true},
    subject: { type: String, required: true},
    content: { type: String, required: true},
}, { timestamps: true }
);

/**
 * @typedef EmailTemplates
 */

module.exports = mongoose.model('EmailTemplates', EmailTemplatesSchema);