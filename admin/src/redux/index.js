import { combineReducers } from 'redux'
import adminReducer from '../views/Admin/Admin.reducer'
import rolesReducer from '../views/AdminStaff/permissions/permissions.reducer'
import customerReducer from 'views/Customers/Customer.reducer'
import errorReducer from './shared/error/error.reducer'
import emailReducer from '../views/EmailTemplates/EmailTemplates.reducer'
import settingsReducer from '.././views/Settings/settings.reducer'
import faqReducer from 'views/Faq/Faq.reducer'
import faqCategoryReducer from 'views/Faq/Category/Category.reducer'
import sizeGroupReducer  from 'views/SizeGroups/SizeGroup.reducer'
import ActivityReducer from 'views/Activity/Activity.reducer'
import DashboardReducer from 'views/Dashboard.reducer'
import ContentManagementReducer from 'views/ContentManagment/cms.reducer'
import ContactUsQuery from 'views/ContactUsQuery/ContactUsQuery.reducer'
import UserEmailTemplateReducer from 'views/UserEmailTemplates/UserEmailTemplate.reducer'
import EmailTypeReducer from 'views/EmailTypes/EmailType.reducer'
import Sale from 'views/Sales/Sale.reducer'
import ProductReducer from 'views/Products/Products.reducer'
import CategoryReducer from 'views/Products/Category/Category.reducer'
import PromotionReducer from 'views/Promotions/Promotions.reducer'
import Report from 'views/Report/Report.reducer'
import BugReportReducer from 'views/BugReport/BugReport.reducer'
import DesignImprintReducer from 'views/DesignImprints/DesignImprint.reducer'
export default combineReducers({
    admin: adminReducer,
    role: rolesReducer,
    customer: customerReducer,
    error: errorReducer,
    email: emailReducer,
    settings: settingsReducer,
    faqs: faqReducer,
    faqCategory: faqCategoryReducer,
    sizeGroups: sizeGroupReducer,
    activity: ActivityReducer,
    dashboard: DashboardReducer,
    content: ContentManagementReducer,
    UserEmailTemplate: UserEmailTemplateReducer,
    EmailType: EmailTypeReducer,
    sale: Sale,
    report: Report,
    product: ProductReducer,
    category: CategoryReducer,
    promotion: PromotionReducer,
    contactUsQuery: ContactUsQuery,
    BugReports: BugReportReducer,
    designImprints: DesignImprintReducer,
})