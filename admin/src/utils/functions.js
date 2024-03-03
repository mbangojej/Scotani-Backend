import axios from "axios";
import { ENV } from '../config/config';
import { GET_ERRORS } from '../redux/types'
import { toast } from 'react-toastify';

export const permissionsForComponents = [
  /**  system permissions **/

  // dashboard
  { role: 'viewDashboard', component: 'Dashboard' },

  // Admin records
  { role: 'viewAdmin', component: 'Admin Staff' },
  { role: 'addAdmin', component: 'Add Admin' },
  { role: 'editAdmin', component: 'Edit Admin' },
  { role: 'deleteAdmin', component: 'Delete Admin' },

  // staff's records
  { role: 'viewStaff', component: 'View Staff' },
  { role: 'addStaff', component: 'Add Staff' },
  { role: 'editStaff', component: 'Edit Staff' },
  { role: 'deleteStaff', component: 'Delete Staff' },

  // Customer's records
  { role: 'viewCustomer', component: 'Customers' },
  { role: 'addCustomer', component: 'Add Customer' },
  { role: 'editCustomer', component: 'Edit Customer' },
  { role: 'deleteCustomer', component: 'Delete Customer' },


  { role: 'viewUsers', component: 'Users' },
  { role: 'viewRole', component: 'Permissions' },
  { role: 'viewRole', component: 'Roles' },

  // FAQs / articles
  { role: 'addFaq', component: 'Add Faq' },
  { role: 'editFaq', component: 'Edit Faq' },
  { role: 'viewFaqs', component: 'FAQS' },
  { role: 'deleteFaq', component: 'Delete FAQ' },

  // FAQs / Categories
  { role: 'addFaqCategory', component: 'Add Faq Category' },
  { role: 'editFaqCategory', component: 'Edit Faq Category' },
  { role: 'viewFaqCategories', component: 'FAQ Categories' },
  { role: 'deleteFaqCategory', component: 'Delete FAQ Category' },

  // Categories / articles
  { role: 'addCategory', component: 'Add Category' },
  { role: 'editCategory', component: 'Edit Category' },
  { role: 'viewCategories', component: 'Categories' },
  // Promotion
  { role: 'addPromotion', component: 'Add Category' },
  { role: 'editPromotion', component: 'Edit Category' },
  { role: 'viewPromotions', component: 'Promotions' },
  { role: 'deletePromotion', component: 'Delete Category' },
  // Order
  { role: 'addOrder', component: 'Add Order' },
  { role: 'editOrder', component: 'Edit Order' },
  { role: 'viewOrders', component: 'Orders' },
  { role: 'cancelOrder', component: 'Cancel Order' },
  { role: 'registerPayment', component: 'Register Payment' },
  { role: 'addOrder', component: 'Create New Order' },

  // Product
  { role: 'addProduct', component: 'Add Product' },
  { role: 'deleteProduct', component: 'Delete Product' },
  { role: 'editProduct', component: 'Edit Product' },
  { role: 'viewProducts', component: 'Product Attributes' },
  { role: 'viewProducts', component: 'Products' },

  // Cms
  { role: 'viewCMS', component: 'CMS Pages' },

  // Reports
  { role: 'viewSalesReport', component: 'Sales Report' },
  { role: 'viewInvoiceReport', component: 'Invoice Report' },

  // Bug Reports
  { role: 'viewBugReport', component: 'Bug Report' },
  { role: 'replyBugReport', component: 'Reply Bug Report' },


  // contact
  { role: 'viewContact', component: 'Contact Query' },
  { role: 'addContact', component: 'Add Contact' },
  { role: 'deleteContact', component: 'Delete Contact' },
  { role: 'editContact', component: 'Edit Contact' },

  // activity
  { role: 'viewActivity', component: 'Activities' },
  { role: 'addActivity', component: 'Add Activity' },
  { role: 'deleteActivity', component: 'Delete Activity' },
  { role: 'editActivity', component: 'Edit Activity' },

  // settings
  { role: 'viewSetting', component: 'Site Settings' },
  { role: 'addSetting', component: 'Add Setting' },
  { role: 'deleteSetting', component: 'Delete Setting' },
  { role: 'editSetting', component: 'Edit Setting' },

  // email-templates
  { role: 'viewEmail', component: 'Email Templates' },
  { role: 'addEmail', component: 'Add Email' },
  { role: 'deleteEmail', component: 'Delete Email' },
  { role: 'editEmail', component: 'Edit Email' },

  // content
  { role: 'viewContent', component: 'Content Management' },
  { role: 'addContent', component: 'Add Content' },
  { role: 'editContent', component: 'Edit Content' },
  { role: 'deleteContent', component: 'Delete Content' },

  // email-types
  { role: 'viewEmailType', component: 'Email Types' },

  // email-templates
  { role: 'viewEmailTemplate', component: 'Email Templates' },

  // viewContactQueries
  { role: 'viewContactQueries', component: 'Contact Query' },

]

export const currencyFormat = (amount, currencyCode = "USD", currencySymbol = "$") => {
  return currencySymbol + parseFloat(amount).toFixed(2)
}

export const apiHelper = async (apiType, path, data) => {
  if (apiType === 'post' || apiType === 'put' || apiType === 'get' || apiType === 'delete') {
    try {
      let response = await axios({
        method: apiType,
        url: path,
        data,
        headers: {
          'Authorization': ENV.Authorization,
          'x-auth-token': ENV.x_auth_token
        }
      })

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const { data } = error.response
        if (data.message)
          toast.error(data.message)
      }

    }
  }
}

/**
 * Converts an array of values to a comma-separated string of labels.
 * @param {number[]} values - The array of values to convert.
 * @param {Object[]} options - The array of objects with value and label properties.
 * @returns {string} - A comma-separated string of labels corresponding to the values.
 */


export const valuesToCommaSeparatedLabels = (values, options) => {
  const selectedLabels = values.map((value) => {
    const option = options.find((option) => option.value === value);
    return option ? option.label : '';
  });
  return selectedLabels.join(', ');
}



