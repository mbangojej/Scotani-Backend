var mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, lowercase: true, unique: true },

        /**  system permissions **/

        // admin records
        addAdmin: { type: Boolean, default: false },
        editAdmin: { type: Boolean, default: false },
        deleteAdmin: { type: Boolean, default: false },
        viewAdmin: { type: Boolean, default: false },

        // cms records
        addCMS: { type: Boolean, default: false },
        editCMS: { type: Boolean, default: false },
        deleteCMS: { type: Boolean, default: false },
        viewCMS: { type: Boolean, default: false },

        // email-templates
        editEmails: { type: Boolean, default: false },
        viewEmails: { type: Boolean, default: false },

        // settings
        editSetting: { type: Boolean, default: false },
        viewSetting: { type: Boolean, default: false },

        // Email Template 
        addEmailTemplate: { type: Boolean, default: false },
        editEmailTemplate: { type: Boolean, default: false },
        deleteEmailTemplate: { type: Boolean, default: false },
        viewEmailTemplate: { type: Boolean, default: false },

        // Email Type 
        addEmailType: { type: Boolean, default: false },
        editEmailType: { type: Boolean, default: false },
        deleteEmailType: { type: Boolean, default: false },
        viewEmailType: { type: Boolean, default: false },

        //customers
        addCustomer: { type: Boolean, default: false },
        editCustomer: { type: Boolean, default: false },
        deleteCustomer: { type: Boolean, default: false },
        viewCustomer: { type: Boolean, default: false },

        // FAQs 
        addFaq: { type: Boolean, default: false },
        editFaq: { type: Boolean, default: false },
        deleteFaq: { type: Boolean, default: false },
        viewFaqs: { type: Boolean, default: false },

        
        // FAQs 
        addFaqCategory: { type: Boolean, default: false },
        editFaqCategory: { type: Boolean, default: false },
        deleteFaqCategory: { type: Boolean, default: false },
        viewFaqCategories: { type: Boolean, default: false },
        
        // Categories 
        addCategory: { type: Boolean, default: false },
        editCategory: { type: Boolean, default: false },
        deleteCategory: { type: Boolean, default: false },
        viewCategories: { type: Boolean, default: false },
        
        addPromotion: { type: Boolean, default: false },
        editPromotion: { type: Boolean, default: false },
        deletePromotion: { type: Boolean, default: false },
        viewPromotions: { type: Boolean, default: false },
        // SizeGroups 
        addSizeGroup: { type: Boolean, default: false },
        editSizeGroup: { type: Boolean, default: false },
        deleteSizeGroup: { type: Boolean, default: false },
        viewSizeGroups: { type: Boolean, default: false },

        // Order 
        addOrder: { type: Boolean, default: false },
        editOrder: { type: Boolean, default: false },
        confirmOrder: { type: Boolean, default: false },
        viewOrders: { type: Boolean, default: false },
        cancelOrder: { type: Boolean, default: false },
        createInvoice: { type: Boolean, default: false },

        // FAQs 
        addContent: { type: Boolean, default: false },
        editContent: { type: Boolean, default: false },
        deleteContent: { type: Boolean, default: false },
        viewContents: { type: Boolean, default: false },

        // Product  
        addProduct: { type: Boolean, default: false },
        editProduct: { type: Boolean, default: false },
        deleteProduct: { type: Boolean, default: false },
        viewProducts: { type: Boolean, default: false },

        // Reports  
        viewSalesReport: { type: Boolean, default: false },
        viewInvoiceReport: { type: Boolean, default: false },
        viewBugReport: { type: Boolean, default: false },
        replyBugReport: { type: Boolean, default: false },

        // Design Imprints  
        viewDesignImprints: { type: Boolean, default: false },
        addDesignImprints: { type: Boolean, default: false },
        editDesignImprints: { type: Boolean, default: false },
        deleteDesignImprints: { type: Boolean, default: false },

        // Contact Query 
        addContactQuery: { type: Boolean, default: false },
        editContactQuery: { type: Boolean, default: false },
        deleteContactQuery: { type: Boolean, default: false },
        viewContactQueries: { type: Boolean, default: false },

        // roles
        addRole: { type: Boolean, default: false },
        editRole: { type: Boolean, default: false },
        deleteRole: { type: Boolean, default: false },
        viewRole: { type: Boolean, default: false },
        
        // status (i.e: true for active & false for in-active)
        status: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);

RolesSchema.index({ identityNumber: 'title' });

/**
 * @typedef Roles
 */

module.exports = mongoose.model("Roles", RolesSchema);
