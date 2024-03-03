const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;

/**
 * Customer Schema
 * @private
 */
const CartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    vatPercentage: { type: Number },
    isCheckout: { type: Boolean, default: false },
    systemProducts: [
      {
        // For product type 0, 1, 2, 4
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        variationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariation",
        },
        variationID: { type: String },
        variationData: { type: Object },
        quantity: { type: Number },
        price: { type: Number },
        subTotal: { type: Number },
        discountAmount: { type: Number },
        discountType: { type: Number },
      },
    ],
    nonSystemProducts: [
      {
        // For product type 3 and create a tatoo flow
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        variationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariation",
        },
        designs: [
          {
            prompt: { type: String },
            image: { type: String },
            size: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "sizeGroups",
            },
            quantity: { type: Number },
            price: { type: Number },
            desireText: { type: String },
            desireTextSizeGroup: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "sizeGroups",
            },
            desireTextColorCode: { type: String },
          },
        ],
        productImage: { type: String, default: "" }, // Image for the create a product flow with the tattoo attached
        color: { type: Number }, //  1: Black & White, 2: Colored, 3: Mixed,
        bodyPart: { type: Number }, // 1: Left Arm, 2: Right Arm, 3: Chest, 4: Neck, 5: Back, 6: Left Leg, 7: Right Leg, 9: Wrist
        quantity: { type: Number }, // In case the productId is there use this. Else the design ones
        price: { type: Number }, // In case the productId is there use this. Else the design ones
        designImprintId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "designimprints",
        }, // In case the productId is there use this
        designImprintPrice: { type: Number }, // In case the productId is there use this
        subTotal: { type: Number },
        discountAmount: { type: Number },
        discountType: { type: Number },
      },
    ],
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "promotion",
    },
    subTotal: { type: Number },
    taxTotal: { type: Number },
    discountTotal: { type: Number, default: 0 }, // Amount of discount
    couponDiscountType: { type: Number }, // type of discount  0: percentage 1: fixed
    couponDiscountAmount: { type: Number }, // amount of discount either percentage or fixed
    grandTotal: { type: Number },
  },
  { timestamps: true }
);

/**
 * Methods
 */

/**
 * @typedef Cart
 */

module.exports = mongoose.model("Cart", CartSchema);
