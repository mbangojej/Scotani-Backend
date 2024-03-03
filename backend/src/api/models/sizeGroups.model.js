const mongoose = require('mongoose');

/**
 * Size Group  Schema
 * @private
 */
const SizeGroupsSchema = new mongoose.Schema({
    startingWidth: { type: Number, required: true },
    endingWidth: { type: Number, required: true },
    typeOfSizeGroup: [{ type: Number, enum: [0, 1, 2] }],
    configurableProductPrice: { type: Number },
    blackAndWhitePrice: { type: Number },
    coloredPrice: { type: Number },
    mixedPrice: { type: Number },
    bodyParts: [{ type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8] }],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true }
);

/**
 * @typedef sizeGroups
 */

module.exports = mongoose.model('sizeGroups', SizeGroupsSchema);