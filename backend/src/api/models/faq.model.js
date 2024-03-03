const mongoose = require('mongoose');

/**
 * FAQ Schema
 * @private
 */
const FaqSchema = new mongoose.Schema({
    title: { type: String, required: true, unique:true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FAQCategory',
        
    },
    desc: { type: String, required: true, default: ''},
    display_order: { type: Number, required: true},
    status: { type: Boolean, default: false},
}, { timestamps: true }
);

/**
 * @typedef FAQ
 */

module.exports = mongoose.model('faq', FaqSchema);