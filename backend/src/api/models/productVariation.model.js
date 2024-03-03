const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
/**
 * Product Schema
 * @private
 */
const ProductVariationSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    price: { type: Number },
    details: [
        {
            title: { type: String },
            isColor: { type: String },
            isMeasurement: { type: String },
            isImage: { type: String },
            value: { type: String },
            image: { type: String },
            colorCode: { type: String },
            measurementScale: { type: String },
        }
    ],
    status: { type: Boolean, default: true },
}, { timestamps: true }
);

/**
 * @typedef Product
 */

module.exports = mongoose.model('ProductVariation', ProductVariationSchema);