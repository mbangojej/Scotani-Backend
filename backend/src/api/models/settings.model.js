const mongoose = require('mongoose');

/**
 * Settings Schema
 * @private
 */
const SettingsSchema = new mongoose.Schema({

    splashScreen: [
        {
            text: { type: String },
            image: { type: String }
        }
    ],
    
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    mobile: { type: String, default: '' },
    address: { type: String, default: '' },

    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },

    vatPercentage: { type: String, default: '' },
    orderEmailRecipients: { type: String, default: '' },
    registrationEmailRecipients: { type: String, default: '' },
    
    backgroundRemovalKey: { type: String, default: '' },
    
    userAccountDeletionDays: { type: Number, default: '' },

}, { timestamps: true }
);

/**
 * @typedef Settings
 */

module.exports = mongoose.model('Settings', SettingsSchema);