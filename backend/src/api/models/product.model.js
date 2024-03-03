const mongoose = require("mongoose");

/**
 * Special Product Schema
 * @private
 */
const ProductSchema = new mongoose.Schema(
  {
    title: { type: String },
    price: { type: Number },
    minQty: { type: Number },
    image: { type: String },
    images: [{ type: String }],
    type: { type: Number }, //  0: Inspiration 1: Design, 2: Tattoo, 3: Special Product, 4: Fashion
    attributes: [
      {
        title: { type: String },
        isColor: { type: Boolean, default: false },
        isMeasurement: { type: Boolean, default: false },
        isImage: { type: Boolean, default: false },
        values: [
          {
            title: { type: String },
            image: { type: String },
            colorCode: { type: String },
            measurementScale: { type: String },
          },
        ],
      },
    ],
    shortDescription: { type: String },
    status: { type: Boolean, default: true },
    minimumQuantity: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

/**
 * @typedef Product
 */

module.exports = mongoose.model("Product", ProductSchema);
