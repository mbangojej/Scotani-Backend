const mongoose = require('mongoose');

/**
 * Customer Schema
 * @private
 */
const ContactQuerySchema = new mongoose.Schema({
  name: { type: String, required:true },
  email: { type: String, required:true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String },
  response: { type: String },
  status: { type: Boolean, required:true },
  emailLanguage:{ type: String },
  
}, { timestamps: true }
);

/**
 * Methods
 */


/**
 * @typedef Customer
 */

module.exports = mongoose.model('ContactQuery', ContactQuerySchema);