const { text } = require('express');
const mongoose = require('mongoose');

/**
 * Email Schema
 * @private
 */
const EmailTypesSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true},
    status: { type: Boolean, required: true, default: true},
}, { timestamps: true }
);

/**
 * @typedef EmailTypes
 */

module.exports = mongoose.model('EmailTypes', EmailTypesSchema);