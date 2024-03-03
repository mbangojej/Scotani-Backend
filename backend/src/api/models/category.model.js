const mongoose = require('mongoose');

/**
 * Category Schema
 * @private
 */
const CategorySchema = new mongoose.Schema({

    name: { type: String },
    image: { type: String },
    status: { type: Boolean, default: false},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }

}, { timestamps: true }
);

/**
 * @typedef Category
 */

module.exports = mongoose.model('Category', CategorySchema);