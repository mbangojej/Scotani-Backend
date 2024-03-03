const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const { mongo } = require("../../config/vars");
/**
 * CMS Schema
 * @private
 */
var connection = mongoose.createConnection(mongo.uri);
 
autoIncrement.initialize(connection);
const OrderSchema = new mongoose.Schema({
    orderNumber: { type: Number, default: 0 },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    vatPercentage: { type: Number },

    systemProducts: [{          // For product type 0, 1, 2, 4
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        variationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariation',
        },
        quantity: { type: Number },
        price: { type: Number },
        subTotal: { type: String },
        isRefunded: { type: Boolean, default: false}
    }],

    nonSystemProducts: [{          // For product type 3 and create a tatoo flow
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        variationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariation',
        },
        designs: [
            {
                prompt: { type: String },
                image: { type: String },
                size: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'sizeGroups'
                },
                quantity: { type: Number },
                price: { type: Number },
                desireText : { type: String },
                desireTextSizeGroup : {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'sizeGroups'
                },
                desireTextColorCode : { type: String },
            }
        ],
        productImage: { type: String, default: '' }, // Image for the create a product flow with the tattoo attached
        color: { type: Number },    //  1: Black & White, 2: Colored, 3: Mixed,
        bodyPart: { type: Number }, // 1: Left Arm, 2: Right Arm, 3: Chest, 4: Neck, 5: Back, 6: Left Leg, 7: Right Leg, 8: Wrist
        price: {type:Number},       // In case the productId is there use this. Else the design ones
        quantity: {type:Number},    // In case the productId is there use this. Else the design ones
        designImprintId: { type: mongoose.Schema.Types.ObjectId, ref:"designimprints"  },       // In case the productId is there use this
        designImprintPrice: { type: Number },       // In case the productId is there use this
        subTotal: { type: String },
        isRefunded: { type: Boolean, default: false}
    }],

    status: { type: Number, default: 0 },  // 0: Order Received, 1: Processing, 2: On The Way 3: Delivered 4: Cancel
    isDeleted: { type: Number, default: 0 },  // 0: No, 1: Yes 

    //createdAt will determine the order receive date
    processingDate: { type: Date, default: null },       // Date when order was marked as processing
    onTheWayDate: { type: Date, default: null },         // Date when order was marked as on the way
    deliveredDate: { type: Date, default: null },        // Date when order was marked as delivered
    cancelledDate: { type: Date, default: null },        // Date when order was cancelled

    promotionId: { type: mongoose.Types.ObjectId },
    subTotal: { type: Number },
    taxTotal: { type: Number },
    discountTotal: { type: Number },      // Amount of discount
    couponDiscountType: { type: Number },      // type of discount  0: percentage 1: fixed
    couponDiscountAmount: { type: Number },      // amount of discount either percentage or fixed  
    grandTotal: { type: Number },

    isInvoiced: { type: Boolean, default: false },
    invoicedAt: { type: Date, default: null },

    paidAmount: { type: Number, default: 0 },
    
    refundedAmount: { type: Number, default: 0 },
    refundedMsg: { type: String, default: null },
    refundedDate: { type: Date, default: null },

    transactionId: { type: String, default: null },
    transactionPlatform: { type: String, default: null }
}, { timestamps: true }
);
OrderSchema.plugin(autoIncrement.plugin, {
    model: 'Order',
    field: 'orderNumber',
    startAt: 1,
    incrementBy: 1
});
/**
 * @typedef Order
 */
module.exports = mongoose.model('Order', OrderSchema);