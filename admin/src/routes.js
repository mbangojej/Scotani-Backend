//importing layouts....
import Admin from 'layouts/Admin';

import Dashboard from "views/Dashboard.js";
import NotFound from "views/NotFound.js";
import Login from "./views/Login/Login";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt, faQuestionCircle, faLayerGroup, faTags, faUsers, faFingerprint, faEnvelope, faDharmachakra, faQuestion, faBug, faCertificate, faUserPlus, faChartPie, faAtom, faUserCheck, faDice, faFolderPlus, faCommentMedical, faNewspaper, faFileInvoice, faFileExport, faListOl, faListUl, faListAlt } from '@fortawesome/free-solid-svg-icons'
import Customers from "./views/Customers/Customers";

import Faq from "views/Faq/Faq";
import AddFaq from "views/Faq/AddFaq"
import EditFaq from 'views/Faq/EditFaq';

import SizeGroups from "views/SizeGroups/SizeGroups";

import Profile from 'views/Profile/profile'
import UnAuth from 'layouts/Auth';
import Unauth from 'layouts/Auth';
import ForgotPassword from 'views/ForgotPassword/ForgotPassword';
import ResetPassword from 'views/ResetPassword/ResetPassword';
import SetPassword from 'views/SetPassword/SetPassword';


import Permissions from 'views/AdminStaff/permissions/permissionsListingComponent'
import Staff from 'views/AdminStaff/staff/staffListingComponent'

import AddContentPage from 'views/ContentManagment/addContentPage';
import contentManagement from 'views/ContentManagment/contentManagement';

import ContactUsQuery from 'views/ContactUsQuery/ContactUsQuery';

import Products from "./views/Products/Products";
import AddProduct from "./views/Products/AddProduct";
import EditProduct from 'views/Products/EditProduct';
import VariationListing from 'views/Products/Variations/Listings';

import Category from "./views/Products/Category/Category";

import UserEmailTemplates from 'views/UserEmailTemplates/UserEmailTemplate';
import AddUserEmailTemplate from 'views/UserEmailTemplates/AddUserEmailTemplate';
import EditUserEmailTemplate from 'views/UserEmailTemplates/EditUserEmailTemplate';

import EmailTypes from 'views/EmailTypes/EmailType';
import AddEmailType from 'views/EmailTypes/AddEmailType';
import EditEmailType from 'views/EmailTypes/EditEmailType';

import SiteSettings from 'views/Settings/SiteSettings';

import Promotions from 'views/Promotions/Promotions';
import PromotionForm from 'views/Promotions/PromotionForm';
import Orders from 'views/Sales/Orders';
import CreateSale from 'views/Sales/CreateSale';
import EditSale from 'views/Sales/EditSale';

import Invoice from 'views/Invoice/Invoice';

import SalesReport from 'views/Report/SalesReport';
import InvoiceReport from 'views/Report/InvoiceReport';

import VerifyEmail from 'views/VerifyEmail/VerifyEmail'
import FaqCategories from 'views/Faq/Category/Category';

import BugReports from 'views/BugReport/BugReport';
import DesignImprints from 'views/DesignImprints/DesignImprints';

var routes = [
  {
    path: "/permission-denied",
    layout: Unauth,
    access: true,
    exact: true,
    component: NotFound,
    showInSideBar: false
  },
  {
    path: "/dashboard",
    layout: Admin,
    name: "Dashboard",
    icon: faAtom,
    access: true,
    exact: true,
    component: Dashboard,
    showInSideBar: true
  },
  {
    collapse: true,
    name: "Admin Staff",
    state: "openAdminStaff",
    icon: faUserPlus,
    showInSideBar: true,
    submenus: [
      {
        path: "/admin-staff",
        layout: Admin,
        name: "Admin Staff",
        icon: faUserCheck,
        access: true, exact: true,
        component: Staff,
        showInSideBar: true,
      },
      {
        path: "/roles",
        layout: Admin,
        name: "Roles",
        icon: faDice,
        access: true, exact: true,
        component: Permissions,
        showInSideBar: true,
      }
    ],
  },
  {
    path: "/customers",
    layout: Admin,
    name: "Customers",
    icon: faUsers,
    access: true, exact: true,
    component: Customers,
    showInSideBar: true,
  },
  {
    collapse: true,
    name: "Products",
    state: "openProducts",
    icon: faChartPie,
    showInSideBar: true,
    submenus: [

      {
        path: "/products",
        layout: Admin,
        name: "Products",
        icon: faChartPie,
        access: true, exact: true,
        component: Products,
        showInSideBar: true,
      },
      {
        path: "/categories",
        layout: Admin,
        name: "Categories",
        icon: faListAlt,
        access: true, exact: true,
        component: Category,
        showInSideBar: true,
      },
      {
        path: "/promotions",
        layout: Admin,
        name: "Promotions",
        icon: faTags,
        access: true, exact: true,
        component: Promotions,
        showInSideBar: true,
      },
      {
        path: "/add-promotion",
        layout: Admin,
        name: "Add Promotion",
        icon: faChartPie,
        access: true, exact: true,
        component: PromotionForm,
        showInSideBar: false,
      },
      {
        path: "/edit-promotion/:promotionId",
        layout: Admin,
        name: "Edit Promotion",
        icon: faChartPie,
        access: true, exact: true,
        component: PromotionForm,
        showInSideBar: false,
      },

      {
        path: "/add-product",
        layout: Admin,
        name: "Add Design",
        icon: "nc-icon nc-bulb-63",
        access: true, exact: true,
        component: AddProduct,
      },
      {
        path: "/edit-product/:id",
        layout: Admin,
        icon: "nc-icon nc-bulb-63",
        access: true, exact: true,
        component: EditProduct,
      },
      {
        path: "/list-variations/:productId",
        layout: Admin,
        icon: "nc-icon nc-bulb-63",
        access: true, exact: true,
        component: VariationListing,
      },
      {
        path: "/size-groups",
        layout: Admin,
        name: "Size Groups",
        icon: faLayerGroup,
        access: true, exact: true,
        component: SizeGroups,
        showInSideBar: true,
      },
      {
        path: "/design-imprints",
        layout: Admin,
        name: "Design Imprints",
        icon: faFingerprint,
        access: true, exact: true,
        component: DesignImprints,
        showInSideBar: true,
      }
    ]
  },
  {
    collapse: true,
    name: "Orders",
    state: "openSales",
    icon: faListOl,
    showInSideBar: true,
    submenus: [
      {
        path: "/orders/",
        layout: Admin,
        name: "Orders",
        icon: faListUl,
        access: true, exact: true,
        component: Orders,
        showInSideBar: true,
      },
      {
        path: "/orders/:status?",
        layout: Admin,
        name: "Orders",
        icon: faListUl,
        access: true, exact: true,
        component: Orders,
      },
      {
        path: "/create-new-sale",
        layout: Admin,
        name: "Create New Order",
        icon: faFolderPlus,
        access: true, exact: true,
        component: CreateSale,
        showInSideBar: true,
      },
      {
        path: "/edit-sale/:saleId",
        layout: Admin,
        name: "Edit Sale",
        icon: "nc-icon nc-grid-45",
        access: true, exact: true,
        component: EditSale,
      },
      {
        path: "/invoice/:saleId",
        layout: Admin,
        name: "Invoice",
        icon: "nc-icon nc-grid-45",
        access: true, exact: true,
        component: Invoice,
      },
    ],
  },
  {
    collapse: true,
    name: "Reporting",
    state: "openReporting",
    icon: faFileAlt,
    showInSideBar: true,
    submenus: [
      {
        path: "/sales-report",
        layout: Admin,
        name: "Sales Report",
        icon: faFileExport,
        access: true, exact: true,
        component: SalesReport,
        showInSideBar: true,
      },
      {
        path: "/invoice-report",
        layout: Admin,
        name: "Invoice Report",
        icon: faFileInvoice,
        access: true, exact: true,
        component: InvoiceReport,
        showInSideBar: true,
      }
    ]
  },
  // {
  //   path: "/contactQuery",
  //   layout: Admin,
  //   name: "Contact Query",
  //   icon: faAddressBook,
  //   access: true, exact: true,
  //   component: ContactUsQuery,
  //   showInSideBar: true,
  // },
  {
    path: "/bug-report",
    layout: Admin,
    name: "Bug Report",
    icon: faBug,
    access: true, exact: true,
    component: BugReports,
    showInSideBar: true,
  },
  {
    collapse: true,
    name: "FAQ",
    state: "openFAQ",
    icon: faQuestionCircle,
    showInSideBar: true,
    submenus: [
      {
        path: "/faq-categories",
        layout: Admin,
        name: "FAQ Categories",
        icon: faChartPie,
        access: true, exact: true,
        component: FaqCategories,
        showInSideBar: true,
      },
      {
        path: "/faq",
        layout: Admin,
        name: "FAQS",
        icon: faQuestion,
        access: true, exact: true,
        component: Faq,
        showInSideBar: true,
      },
    ],
  },
  {
    path: "/",
    layout: Unauth,
    name: "Login",
    icon: "nc-icon nc-chart-pie-35",
    access: true,
    exact: true,
    component: Login
  },
  {
    path: "/profile",
    layout: Admin,
    name: "Profile",
    icon: "nc-icon nc-circle-09",
    access: true, exact: true,
    component: Profile,
    showInSideBar: false,
  },
  {
    collapse: true,
    name: "Email",
    state: "openEmails",
    icon: faEnvelope,
    showInSideBar: true,
    submenus: [
      // {
      //   path: "/email-types",
      //   layout: Admin,
      //   name: "Email Types",
      //   icon: faComment,
      //   access: true, exact: true,
      //   component: EmailTypes,
      //   showInSideBar: true,
      // },
      {
        path: "/user-email-templates",
        layout: Admin,
        name: "Email Templates",
        icon: faCommentMedical,
        access: true, exact: true,
        component: UserEmailTemplates,
        showInSideBar: true,
      }
    ]
  },
  {
    collapse: true,
    name: "Configuration",
    state: "openConfiguration",
    icon: faCertificate,
    showInSideBar: true,
    submenus: [
      {
        path: "/cms",
        layout: Admin,
        name: "CMS Pages",
        icon: faNewspaper,
        access: true, exact: true,
        component: contentManagement,
        showInSideBar: true,
      },
      {
        path: "/site-settings",
        layout: Admin,
        name: "Site Settings",
        icon: faDharmachakra,
        access: true, exact: true,
        component: SiteSettings,
        showInSideBar: true,
      },
      // {
      //   path: "/bug-report",
      //   layout: Admin,
      //   name: "Bug Report",
      //   icon: faBug,
      //   access: true, exact: true,
      //   component: BugReports,
      //   showInSideBar: true,
      // },
    ],
  },
  {
    path: "/add-faq",
    layout: Admin,
    name: "Add Faq",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: AddFaq,
  },
  {
    path: "/edit-faq/:faqId",
    layout: Admin,
    name: "Edit Faq",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: EditFaq,
  },
  {
    path: "/add-user-email-templates",
    layout: Admin,
    name: "Add User Email Templates",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: AddUserEmailTemplate,
  },
  {
    path: "/edit-user-email-templates/:emailTemplateId",
    layout: Admin,
    name: "Edit User Email Templates",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: EditUserEmailTemplate,
  },
  // {
  //   path: "/add-email-type",
  //   layout: Admin,
  //   name: "Add Email Type",
  //   icon: "nc-icon nc-bulb-63",
  //   access: true, exact: true,
  //   component: AddEmailType,
  // },
  // {
  //   path: "/edit-email-type/:emailTypeId",
  //   layout: Admin,
  //   name: "Edit Email Type",
  //   icon: "nc-icon nc-bulb-63",
  //   access: true, exact: true,
  //   component: EditEmailType,
  // },
  {
    path: "/add-cms",
    layout: Admin,
    name: "Add Content",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: AddContentPage,
  },
  {
    path: "/edit-cms/:contentId",
    layout: Admin,
    name: "Edit Content",
    icon: "nc-icon nc-bulb-63",
    access: true, exact: true,
    component: AddContentPage,
  },
  {
    path: "/login",
    layout: UnAuth,
    name: "Login",
    mini: "LP",
    component: Login,
  },
  {
    path: "/forgot-password",
    layout: UnAuth,
    name: "Forgot Passowrd",
    mini: "FP",
    component: ForgotPassword,
  },
  {
    path: "/reset-password",
    layout: UnAuth,
    name: "Reset Passowrd",
    mini: "RP",
    component: ResetPassword,
  },
  {
    path: "/set-password",
    layout: UnAuth,
    name: "Set Passowrd",
    mini: "SP",
    component: SetPassword,
  },
  {
    path: "/verify-email/:id",
    layout: UnAuth,
    name: "Verify Email",
    mini: "SP",
    component: VerifyEmail,
  }
];

export default routes;
