const mongoose = require('mongoose');

/**
 * Design Imprint Schema
 * @private
 */
const DesignImprintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, deafault: false },
    isDeleted: { type: Boolean, default: false}
}, { timestamps: true }
);

/**
 * @typedef DesignImprint
 */

module.exports = mongoose.model('DesignImprint', DesignImprintSchema);