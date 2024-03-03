const mongoose = require('mongoose');

/**
 * FAQCategory Schema
 * @private
 */
const FAQCategorySchema = new mongoose.Schema({

    name: { type: String, required: true},
    display_order: { type: Number, required: true},

}, { timestamps: true }
);

/**
 * @typedef FAQCategory
 */

module.exports = mongoose.model('FAQCategory', FAQCategorySchema);