const mongoose = require('mongoose');

/**
 * CMS Schema
 * @private
 */
const CMSSchema = new mongoose.Schema({
    title: { type: String, required: true},
    image: { type: String, required: true},
    slug: { type: String, required: true, unique:true},
    description: { type: String, required: true},
    status : {type: Boolean ,default : false},

}, { timestamps: true }
);

/**
 * @typedef CMS
 */

module.exports = mongoose.model('cms', CMSSchema);