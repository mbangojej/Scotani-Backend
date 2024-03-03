const mongoose = require('mongoose');

/**
 * Promotion Schema
 * @private
 */
const PromotionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    customers: [
        { type: mongoose.Schema.Types.ObjectId,ref:"customers",default:null }
    ],
    promotionCode: {type: String, unique: true},
    
    noOfUsesPerCustomer: {type: Number, default: 1},
    minPurchaseAmount: {type: Number, default: 1},
    
    startDate: {type: Date},
    endDate: {type: Date},
    
    discountAmount: {type: Number},
    discountType:{type:Number}, // //1=Fixed 0=percentage

    isActive: { type: Boolean, default: true},
    isDeleted: { type: Boolean, default: false}
}, { timestamps: true }
);


/**
 * @typedef PromotionSchema
 */

module.exports = mongoose.model('promotion', PromotionSchema);