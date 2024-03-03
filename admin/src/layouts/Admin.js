import React, { Component } from "react";
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import AdminNavbar from "components/Navbars/AdminNavbar";
import { getRole, beforeRole } from "views/AdminStaff/permissions/permissions.actions";
import Footer from "components/Footers/AdminFooter";
import Sidebar from "components/Sidebar/Sidebar";
import routes from "routes.js";
import { ENV } from './../config/config';
import image3 from "assets/img/full-screen-image-3.jpg";
var CryptoJS = require("crypto-js");

let ProtectedArrayProperties = [
	// Roles
	{
		viewRole: false,
		url: '/admin/roles',
        navigateTo: '/permission-denied'
	},
	// Admin
	{
		viewAdmin: false,
		url: '/admin/admin-staff',
        navigateTo: '/permission-denied'
	},
	// Customer
	{
		viewCustomer: false,
		url: '/admin/customers',
        navigateTo: '/permission-denied'
	},
	// Products
	{
		viewProducts: false,
		url: '/admin/products',
        navigateTo: '/permission-denied'
	},
	{
		addProduct: false,
		url: '/admin/add-product',
        navigateTo: '/permission-denied'
	},
	{
		editProduct: false,
		url: '/admin/edit-product/*',
        navigateTo: '/permission-denied'
	},
	// Products Categories
	{
		viewCategories: false,
		url: '/admin/categories',
        navigateTo: '/permission-denied'
	},
	// Promotions
	{
		viewPromotions: false,
		url: '/admin/promotions',
        navigateTo: '/permission-denied'
	},
	{
		addPromotion: false,
		url: '/admin/add-promotion',
        navigateTo: '/permission-denied'
	},
	// Size Groups
	{
		viewSizeGroups: false,
		url: '/admin/size-groups',
        navigateTo: '/permission-denied'
	},
	// Orders
	{
		viewOrders: false,
		url: '/admin/orders',
        navigateTo: '/permission-denied'
	},
	{
		addOrder: false,
		url: '/admin/create-new-sale',
        navigateTo: '/permission-denied'
	},
	{
		editOrder: false,
		url: '/admin/edit-sale',
        navigateTo: '/permission-denied'
	},
	// Report
	{
		viewSalesReport: false,
		url: '/admin/sales-report',
        navigateTo: '/permission-denied'
	},
	{
		viewInvoiceReport: false,
		url: '/admin/invoice-report',
        navigateTo: '/permission-denied'
	},
	// FAQ
	{
		viewFaqs: false,
		url: '/admin/faq',
        navigateTo: '/permission-denied'
	},
	{
		addFaq: false,
		url: '/admin/add-faq',
        navigateTo: '/permission-denied'
	},
	// FAQ Category
	{
		viewFaqCategories: false,
		url: '/admin/faq-categories',
        navigateTo: '/permission-denied'
	},
	// Email Types
	{
		viewEmailType: false,
		url: '/admin/email-types',
        navigateTo: '/permission-denied'
	},
	{
		addEmailType: false,
		url: '/admin/add-email-type',
        navigateTo: '/permission-denied'
	},
	// Email Templates
	{
		viewEmailTemplate: false,
		url: '/admin/email-templates',
        navigateTo: '/permission-denied'
	},
	{
		addEmailTemplate: false,
		url: '/admin/add-email-template',
        navigateTo: '/permission-denied'
	},
	// CMS
	{
		viewCMS: false,
		url: '/admin/cms',
        navigateTo: '/permission-denied'
	},
	{
		addCMS: false,
		url: '/admin/add-cms',
        navigateTo: '/permission-denied'
	},
	// Site Settings
	{
		viewSetting: false,
		url: '/admin/site-setings',
        navigateTo: '/permission-denied'
	},
	// Contact Query
	{
		viewContactQueries: false,
		url: '/admin/contactQuery',
        navigateTo: '/permission-denied'
	},

]
class Admin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			routes: routes,
			permissions: {}
		};
	}

	componentDidMount() {
		let roleEncrypted = localStorage.getItem('role');
		let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
			role = roleDecrypted
		}
		if(role) {
			this.props.getRole(role)
			this.props.beforeRole()
		}else{
			localStorage.removeItem("accessToken");
			window.location.replace('/admin');
		}
	}
	componentWillReceiveProps(props) {
		if (Object.keys(props.getRoleRes).length > 0) {
			this.setState({permissions : props.getRoleRes.role})
			let data = this.state.permissions
			let path = window.location.pathname;

			for (const key in data) {
				ProtectedArrayProperties.forEach((val) => {
					if (key === Object.keys(val)[0] && path.includes(Object.values(val)[1])  && data[key] === false) {
						this.props.history.push(Object.values(val)[2])
					}
				})
			}
			
        }
    }
	getBrandText = path => {
		for (let i = 0; i < routes.length; i++) {
			if (
				this.props.location.pathname.indexOf(
					routes[i].path
				) !== -1
			) {
				return routes[i].name;
			}
		}
		return "Not Found";
	};
	componentDidUpdate(e) {
		if (
			window.innerWidth < 993 &&
			e.history.location.pathname !== e.location.pathname &&
			document.documentElement.className.indexOf("nav-open") !== -1
		) {
			document.documentElement.classList.toggle("nav-open");
		}
		if (e.history.action === "PUSH") {
			document.documentElement.scrollTop = 0;
			document.scrollingElement.scrollTop = 0;
			this.refs.mainPanel.scrollTop = 0;
		}
	}

	render() {
		return (
			<div>
				{
					localStorage.getItem("accessToken") ?
						<div className={`wrapper`}>
							<Sidebar {...this.props} routes={this.state.routes} image={image3} background={'black'} />
							<div id="main-panel" className="main-panel" ref="mainPanel">
								<AdminNavbar {...this.props} brandText={this.getBrandText(this.props.location.pathname)} history={this.props.history} />
								<div className="content">
									{this.props.children}
								</div>
								<Footer />
							</div>
						</div>
						: this.props.history.push('/')
				}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	getRoleRes : state.role.getRoleRes,
})
export default connect(mapStateToProps, {getRole, beforeRole})(Admin);